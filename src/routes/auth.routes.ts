import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authSchemas } from '../models/auth.model';

const router = Router();
const controller = new AuthController();

router.post('/register', validateRequest(authSchemas.register), controller.register);
router.post('/login', validateRequest(authSchemas.login), controller.login);
router.post('/refresh', validateRequest(authSchemas.refresh), controller.refreshToken);

export default router;
