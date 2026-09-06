import { Response } from 'express';
import { ReportService } from '../services/reportService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class ReportController {
  static async getPeriodReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { startDate, endDate } = req.query;
      const report = await ReportService.getPeriodReport(
        userId,
        startDate as string,
        endDate as string
      );
      res.json({ success: true, data: report });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi khi tạo báo cáo' });
    }
  }

  static async exportData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const format = (req.query.format as string) || 'json';

      if (format === 'csv') {
        const csv = await ReportService.exportData(userId, 'csv');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="personal_finance_report.csv"');
        res.send(csv);
        return;
      }

      const json = await ReportService.exportData(userId, 'json');
      res.json({ success: true, data: json });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi xuất dữ liệu' });
    }
  }
}
