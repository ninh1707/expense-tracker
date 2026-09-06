import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/period', ReportController.getPeriodReport as any);
router.get('/export', ReportController.exportData as any);

export default router;
