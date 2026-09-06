import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', BudgetController.getAll as any);
router.get('/alerts', BudgetController.getAlerts as any);
router.post('/', BudgetController.create as any);
router.put('/:id', BudgetController.update as any);
router.delete('/:id', BudgetController.delete as any);

export default router;
