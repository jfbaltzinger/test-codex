import { Router } from 'express';
import { AdminAnalyticsController } from '../controllers/admin.analytics.controller';
import { requireAdmin } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AdminAnalyticsController();

router.get('/dashboard', requireAdmin, controller.getDashboard);
router.get('/occupancy', requireAdmin, controller.getOccupancy);

export default router;

