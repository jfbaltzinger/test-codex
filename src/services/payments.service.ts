import Stripe from 'stripe';
import { paymentSchemas } from '../models/payment.model';
import { packsStore, paymentsStore, transactionsStore, usersStore } from '../utils/stores';
import { HttpError } from '../utils/http-error';

const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2023-10-16';

export class PaymentsService {
  private stripe: Stripe | null = null;

  private getStripe() {
    if (!this.stripe) {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        throw new HttpError(500, 'Stripe secret key not configured');
      }
      this.stripe = new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
    }
    return this.stripe;
  }

  async createCheckoutSession(userId: string, input: unknown) {
    const data = paymentSchemas.createCheckoutSession.parse(input);
    const pack = packsStore.findById(data.packId);
    if (!pack) {
      throw new HttpError(404, 'Pack not found');
    }

    const successUrl = data.successUrl ?? process.env.STRIPE_SUCCESS_URL;
    const cancelUrl = data.cancelUrl ?? process.env.STRIPE_CANCEL_URL;

    if (!successUrl || !cancelUrl) {
      throw new HttpError(500, 'Stripe redirect URLs not configured');
    }

    const currency = process.env.STRIPE_CURRENCY ?? 'eur';
    const stripe = this.getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      metadata: {
        userId,
        packId: pack.id
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: Math.round(pack.price * 100),
            product_data: {
              name: pack.name,
              description: `${pack.credits} crédits`
            }
          }
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    if (!session.url) {
      throw new HttpError(500, 'Stripe session URL missing');
    }

    const timestamp = new Date().toISOString();
    const amount = pack.price;

    const existingRecord = paymentsStore.findById(session.id);
    if (!existingRecord) {
      paymentsStore.create({
        id: session.id,
        userId,
        packId: pack.id,
        amount,
        currency,
        status: 'pending',
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    return {
      sessionId: session.id,
      url: session.url
    };
  }

  async handleWebhook(rawBody: Buffer, signatureHeader?: string | string[]) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new HttpError(500, 'Stripe webhook secret not configured');
    }

    if (!signatureHeader) {
      throw new HttpError(400, 'Missing Stripe signature header');
    }

    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
    const stripe = this.getStripe();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      throw new HttpError(400, 'Invalid Stripe webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.handleCheckoutSessionCompleted(session);
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata ?? {};
    const userId = metadata.userId;
    const packId = metadata.packId;

    if (!userId || !packId) {
      throw new HttpError(400, 'Missing metadata for completed checkout session');
    }

    const paymentRecord = paymentsStore.findById(session.id);
    if (paymentRecord?.status === 'completed') {
      return;
    }

    const user = usersStore.findById(userId);
    const pack = packsStore.findById(packId);

    if (!user || !pack) {
      throw new HttpError(404, 'Associated resources not found');
    }

    user.credits += pack.credits;

    transactionsStore.create({
      id: `txn_${Date.now()}`,
      userId: user.id,
      packId: pack.id,
      credits: pack.credits,
      type: 'purchase',
      createdAt: new Date().toISOString()
    });

    const timestamp = new Date().toISOString();
    if (paymentRecord) {
      paymentsStore.update(paymentRecord.id, {
        status: 'completed',
        updatedAt: timestamp
      });
    } else {
      paymentsStore.create({
        id: session.id,
        userId: user.id,
        packId: pack.id,
        amount: pack.price,
        currency: session.currency ?? process.env.STRIPE_CURRENCY ?? 'eur',
        status: 'completed',
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
  }
}
