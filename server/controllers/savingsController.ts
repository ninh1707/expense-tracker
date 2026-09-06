import { Response } from 'express';
import { SavingsService } from '../services/savingsService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class SavingsController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const goals = await SavingsService.getAll(userId);
      res.json({ success: true, data: goals });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi khi tải mục tiêu tiết kiệm' });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const goal = await SavingsService.getById(userId, req.params.id);
      res.json({ success: true, data: goal });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Mục tiêu không tồn tại' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const created = await SavingsService.create(userId, req.body);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Tạo mục tiêu thất bại' });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const updated = await SavingsService.update(userId, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Cập nhật mục tiêu thất bại' });
    }
  }

  static async depositOrWithdraw(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { amount, type, note, recordTransaction } = req.body;
      if (!amount || !type) {
        res.status(400).json({ success: false, message: 'Số tiền và loại hành động là bắt buộc' });
        return;
      }
      const updated = await SavingsService.depositOrWithdraw(
        userId,
        req.params.id,
        Number(amount),
        type,
        note,
        Boolean(recordTransaction)
      );
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Thao tác nạp/rút thất bại' });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      await SavingsService.delete(userId, req.params.id);
      res.json({ success: true, message: 'Đã xóa mục tiêu tiết kiệm' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Xóa mục tiêu thất bại' });
    }
  }
}
