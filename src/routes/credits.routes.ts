import { Router } from 'express';
import { CreditsController } from '../controllers/credits.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { creditSchemas } from '../models/credit.model';

const router = Router();
const controller = new CreditsController();

router.get('/balance', requireAuth, controller.getBalance);
router.post('/purchase', requireAuth, validateRequest(creditSchemas.purchase), controller.purchasePack);
router.get('/transactions', requireAuth, controller.listTransactions);

export default router;
