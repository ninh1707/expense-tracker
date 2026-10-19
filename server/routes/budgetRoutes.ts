import { validate, registerValidation, loginValidation, transactionValidation, budgetValidation, savingsValidation, recurringValidation } from '../middlewares/validate';
import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', BudgetController.getAll as any);
router.get('/alerts', BudgetController.getAlerts as any);
router.post('/', validate(budgetValidation), BudgetController.create as any);
router.put('/:id', validate(budgetValidation), BudgetController.update as any);
router.delete('/:id', BudgetController.delete as any);

export default router;
