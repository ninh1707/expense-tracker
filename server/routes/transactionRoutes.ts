import { validate, registerValidation, loginValidation, transactionValidation, budgetValidation, savingsValidation, recurringValidation } from '../middlewares/validate';
import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', TransactionController.getAll as any);
router.get('/summary', TransactionController.getSummary as any);
router.get('/:id', TransactionController.getById as any);
router.post('/', validate(transactionValidation), TransactionController.create as any);
router.put('/:id', validate(transactionValidation), TransactionController.update as any);
router.delete('/:id', TransactionController.delete as any);

export default router;
