import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/demo', AuthController.demoLogin);
router.get('/profile', authenticateToken as any, AuthController.getProfile as any);
router.put('/profile', authenticateToken as any, AuthController.updateProfile as any);
router.post('/change-password', authenticateToken as any, AuthController.changePassword as any);
router.post('/reset-data', authenticateToken as any, AuthController.resetData as any);

export default router;
