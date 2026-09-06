import { Router } from 'express';
import { RecurringController } from '../controllers/recurringController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', RecurringController.getAll as any);
router.get('/reminders', RecurringController.getDueReminders as any);
router.get('/:id', RecurringController.getById as any);
router.post('/', RecurringController.create as any);
router.put('/:id', RecurringController.update as any);
router.post('/:id/pay', RecurringController.markAsPaid as any);
router.delete('/:id', RecurringController.delete as any);

export default router;
