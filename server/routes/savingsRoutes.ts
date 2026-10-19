import { validate, registerValidation, loginValidation, transactionValidation, budgetValidation, savingsValidation, recurringValidation } from '../middlewares/validate';
import { Router } from 'express';
import { SavingsController } from '../controllers/savingsController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', SavingsController.getAll as any);
router.get('/:id', SavingsController.getById as any);
router.post('/', validate(savingsValidation), SavingsController.create as any);
router.put('/:id', validate(savingsValidation), SavingsController.update as any);
router.post('/:id/action', SavingsController.depositOrWithdraw as any);
router.delete('/:id', SavingsController.delete as any);

export default router;
