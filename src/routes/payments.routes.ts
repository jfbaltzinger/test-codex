import { Router } from 'express';
import { PaymentsController } from '../controllers/payments.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { paymentSchemas } from '../models/payment.model';

const router = Router();
const controller = new PaymentsController();

router.post(
  '/create-checkout-session',
  requireAuth,
  validateRequest(paymentSchemas.createCheckoutSession),
  controller.createCheckoutSession
);

router.post('/webhook', controller.handleWebhook);

export default router;
