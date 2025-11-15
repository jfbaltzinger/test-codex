import { Router } from 'express';
import { AdminSessionsController } from '../controllers/admin.sessions.controller';
import { requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { adminSessionSchemas } from '../models/admin.session.model';

const router = Router();
const controller = new AdminSessionsController();

router.get('/', requireAdmin, controller.listSessions);
router.post('/', requireAdmin, validateRequest(adminSessionSchemas.create), controller.createSession);
router.patch('/:id', requireAdmin, validateRequest(adminSessionSchemas.update), controller.updateSession);
router.delete('/:id', requireAdmin, validateRequest(adminSessionSchemas.remove), controller.deleteSession);

export default router;
