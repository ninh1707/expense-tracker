import { Response } from 'express';
import { RecurringService } from '../services/recurringService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class RecurringController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const list = await RecurringService.getAll(userId);
      res.json({ success: true, data: list });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi khi tải danh sách định kỳ' });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const item = await RecurringService.getById(userId, req.params.id);
      res.json({ success: true, data: item });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Không tìm thấy khoản thanh toán' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const item = await RecurringService.create(userId, req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Tạo khoản định kỳ thất bại' });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const updated = await RecurringService.update(userId, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Cập nhật thất bại' });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      await RecurringService.delete(userId, req.params.id);
      res.json({ success: true, message: 'Đã xóa khoản thanh toán định kỳ' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Xóa thất bại' });
    }
  }

  static async markAsPaid(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { paidDate, recordTransaction } = req.body;
      const updated = await RecurringService.markAsPaid(userId, req.params.id, paidDate, recordTransaction);
      res.json({ success: true, data: updated, message: 'Đã xác nhận thanh toán thành công' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Xác nhận thanh toán thất bại' });
    }
  }

  static async getDueReminders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const reminders = await RecurringService.getDueReminders(userId);
      res.json({ success: true, data: reminders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi kiểm tra nhắc nhở' });
    }
  }
}
