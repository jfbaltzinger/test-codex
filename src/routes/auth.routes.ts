import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authSchemas } from '../models/auth.model';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/register', validateRequest(authSchemas.register), controller.register);
router.post('/login', validateRequest(authSchemas.login), controller.login);
router.post('/refresh', controller.refreshToken);
router.get('/profile', requireAuth, controller.profile);
router.post('/logout', requireAuth, controller.logout);
router.post('/forgot-password', validateRequest(authSchemas.requestPasswordReset), controller.requestPasswordReset);
router.post('/reset-password', validateRequest(authSchemas.resetPassword), controller.resetPassword);

export default router;
