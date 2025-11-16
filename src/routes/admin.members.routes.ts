import { Router } from 'express';
import { AdminMembersController } from '../controllers/admin.members.controller';
import { requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { adminMemberSchemas } from '../models/admin.member.model';

const router = Router();
const controller = new AdminMembersController();

router.get('/', requireAdmin, controller.listMembers);
router.post('/', requireAdmin, validateRequest(adminMemberSchemas.create), controller.createMember);
router.put('/:id', requireAdmin, validateRequest(adminMemberSchemas.update), controller.updateMember);
router.patch('/:id', requireAdmin, validateRequest(adminMemberSchemas.update), controller.updateMember);
router.delete('/:id', requireAdmin, validateRequest(adminMemberSchemas.remove), controller.deleteMember);

export default router;
