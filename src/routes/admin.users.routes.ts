import { Router } from 'express';
import { AdminUsersController } from '../controllers/admin.users.controller';
import { requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { adminUserSchemas } from '../models/admin.user.model';

const router = Router();
const controller = new AdminUsersController();

router.get('/', requireAdmin, controller.listUsers);
router.post('/', requireAdmin, validateRequest(adminUserSchemas.create), controller.createUser);
router.patch('/:id', requireAdmin, validateRequest(adminUserSchemas.update), controller.updateUser);
router.delete('/:id', requireAdmin, validateRequest(adminUserSchemas.remove), controller.deleteUser);

export default router;
