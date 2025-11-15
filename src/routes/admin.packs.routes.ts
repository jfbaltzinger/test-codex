import { Router } from 'express';
import { AdminPacksController } from '../controllers/admin.packs.controller';
import { requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { adminPackSchemas } from '../models/admin.pack.model';

const router = Router();
const controller = new AdminPacksController();

router.get('/', requireAdmin, controller.listPacks);
router.post('/', requireAdmin, validateRequest(adminPackSchemas.create), controller.createPack);
router.patch('/:id', requireAdmin, validateRequest(adminPackSchemas.update), controller.updatePack);
router.delete('/:id', requireAdmin, validateRequest(adminPackSchemas.remove), controller.deletePack);

export default router;
