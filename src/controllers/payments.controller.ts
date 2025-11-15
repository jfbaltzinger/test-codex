import { Request, Response } from 'express';
import { PaymentsService } from '../services/payments.service';
import { asyncHandler } from '../utils/async-handler';

export class PaymentsController {
  private readonly service = new PaymentsService();

  createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
    const session = await this.service.createCheckoutSession(req.user!.id, req.body);
    res.status(201).json(session);
  });

  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'];
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
    await this.service.handleWebhook(rawBody, signature);
    res.json({ received: true });
  });
}
