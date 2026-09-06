import { Response } from 'express';
import { BudgetService } from '../services/budgetService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class BudgetController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const month = req.query.month as string;
      const budgets = await BudgetService.getBudgetsWithProgress(userId, month);
      res.json({ success: true, data: budgets });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi khi tải ngân sách' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const newBudget = await BudgetService.create(userId, req.body);
      res.status(201).json({ success: true, data: newBudget });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Tạo ngân sách thất bại' });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const updated = await BudgetService.update(userId, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Cập nhật ngân sách thất bại' });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      await BudgetService.delete(userId, req.params.id);
      res.json({ success: true, message: 'Đã xóa ngân sách' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Xóa ngân sách thất bại' });
    }
  }

  static async getAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const alerts = await BudgetService.getAlerts(userId);
      res.json({ success: true, data: alerts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi kiểm tra cảnh báo' });
    }
  }
}
