import { Router } from 'express';
import { SessionsController } from '../controllers/sessions.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { sessionSchemas } from '../models/session.model';

const router = Router();
const controller = new SessionsController();

router.get('/', requireAuth, controller.listSessions);
router.get('/:id', requireAuth, validateRequest(sessionSchemas.getById), controller.getSessionById);

export default router;
