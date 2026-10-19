import { Response } from 'express';
import { TransactionService, TransactionFilter } from '../services/transactionService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class TransactionController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { type, category, startDate, endDate, search, minAmount, maxAmount, paymentMethod } = req.query;

      const filter: TransactionFilter = {};
      if (type !== undefined) {
        if (type !== 'income' && type !== 'expense') {
          res.status(400).json({ success: false, message: 'Loại giao dịch không hợp lệ.' });
          return;
        }
        filter.type = type;
      }
      for (const [key, value] of Object.entries({ category, startDate, endDate, search, paymentMethod })) {
        if (value !== undefined && typeof value !== 'string') {
          res.status(400).json({ success: false, message: `Bộ lọc ${key} không hợp lệ.` });
          return;
        }
      }
      if (category) filter.category = category as string;
      if (startDate) filter.startDate = startDate as string;
      if (endDate) filter.endDate = endDate as string;
      if (search) filter.search = search as string;
      if (paymentMethod) filter.paymentMethod = paymentMethod as string;
      for (const [key, value] of Object.entries({ minAmount, maxAmount })) {
        if (value !== undefined && (typeof value !== 'string' || value.trim() === '' || !Number.isFinite(Number(value)))) {
          res.status(400).json({ success: false, message: `Bộ lọc ${key} không hợp lệ.` });
          return;
        }
      }
      if (minAmount !== undefined) filter.minAmount = Number(minAmount);
      if (maxAmount !== undefined) filter.maxAmount = Number(maxAmount);

      const list = await TransactionService.getAll(userId, filter);
      res.json({ success: true, data: list });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi khi tải giao dịch' });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const item = await TransactionService.getById(userId, req.params.id);
      res.json({ success: true, data: item });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Giao dịch không tìm thấy' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const newTx = await TransactionService.create(userId, req.body);
      res.status(201).json({ success: true, data: newTx });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Thêm giao dịch thất bại' });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const updated = await TransactionService.update(userId, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Cập nhật giao dịch thất bại' });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      await TransactionService.delete(userId, req.params.id);
      res.json({ success: true, message: 'Đã xóa giao dịch' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Xóa giao dịch thất bại' });
    }
  }

  static async getSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const month = req.query.month as string;
      const summary = await TransactionService.getDashboardSummary(userId, month);
      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi thống kê' });
    }
  }
}
