import { Router } from 'express';
import { SavingsController } from '../controllers/savingsController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', SavingsController.getAll as any);
router.get('/:id', SavingsController.getById as any);
router.post('/', SavingsController.create as any);
router.put('/:id', SavingsController.update as any);
router.post('/:id/action', SavingsController.depositOrWithdraw as any);
router.delete('/:id', SavingsController.delete as any);

export default router;
