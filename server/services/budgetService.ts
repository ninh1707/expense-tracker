import { BudgetModel, IBudget } from '../models/Budget';
import { TransactionModel } from '../models/Transaction';

export class BudgetService {
  static async getBudgetsWithProgress(userId: string, monthStr?: string) {
    const month = monthStr || new Date().toISOString().substring(0, 7);
    const budgets = await BudgetModel.find({ userId });
    
    // Kỳ báo cáo được tính riêng cho từng ngân sách, thay vì lấy tất cả giao dịch của tháng.
    const allTransactions = await TransactionModel.find({ userId, type: 'expense' });
    const [yearStr, monthNumberStr] = month.split('-');
    const year = Number(yearStr), monthIndex = Number(monthNumberStr) - 1;
    const today = new Date();
    const reference = (today.getUTCFullYear() === year && today.getUTCMonth() === monthIndex)
      ? new Date(Date.UTC(year, monthIndex, today.getUTCDate()))
      : new Date(Date.UTC(year, monthIndex, 1));

    return budgets.map(b => {
      const budgetMonth = b.month || month;
      const [by, bm] = budgetMonth.split('-').map(Number);
      const period = b.period || 'monthly';
      let start: Date, end: Date;
      if (period === 'yearly') {
        start = new Date(Date.UTC(by, 0, 1));
        end = new Date(Date.UTC(by + 1, 0, 1));
      } else if (period === 'weekly') {
        // Tuần thứ nhất chứa ngày đầu tháng; các tuần sau bắt đầu thứ Hai.
        const weekStart = new Date(reference);
        const day = (weekStart.getUTCDay() + 6) % 7;
        weekStart.setUTCDate(weekStart.getUTCDate() - day);
        start = weekStart;
        end = new Date(start.getTime() + 7 * 86400000);
      } else {
        start = new Date(Date.UTC(by, bm - 1, 1));
        end = new Date(Date.UTC(by, bm, 1));
      }
      const startStr = start.toISOString().slice(0,10);
      const endStr = end.toISOString().slice(0,10);
      const spent = allTransactions
        .filter(t => t.category === b.category && t.date >= startStr && t.date < endStr)
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      const remaining = b.amount - spent;
      
      let status: 'normal' | 'warning' | 'exceeded' = 'normal';
      if (percentage >= 100) {
        status = 'exceeded';
      } else if (percentage >= (b.alertThreshold || 80)) {
        status = 'warning';
      }

      return {
        ...b,
        month,
        spent,
        remaining,
        percentage,
        status
      };
    });
  }

  static async create(userId: string, data: Omit<IBudget, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    if (!data.category) throw new Error('Danh mục ngân sách không được bỏ trống');
    if (!data.amount || (!Number.isFinite(Number(data.amount)) || Number(data.amount) <= 0)) throw new Error('Hạn mức ngân sách phải lớn hơn 0');

    // Check if budget for category & month already exists
    const currentMonth = data.month || new Date().toISOString().substring(0, 7);
    const existing = await BudgetModel.find({ userId, month: currentMonth });
    const duplicate = existing.find(b => b.category === data.category);
    if (duplicate) {
      throw new Error(`Đã tồn tại ngân sách cho danh mục "${data.category}" trong tháng ${currentMonth}. Vui lòng chỉnh sửa ngân sách hiện có.`);
    }

    return await BudgetModel.create({
      userId,
      category: data.category,
      amount: Number(data.amount),
      alertThreshold: Number(data.alertThreshold || 80),
      month: currentMonth,
      period: data.period || 'monthly',
      notes: data.notes
    });
  }

  static async update(userId: string, id: string, data: Partial<IBudget>) {
    const existing = await BudgetModel.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error('Ngân sách không tồn tại hoặc không có quyền truy cập');
    }

    const payload: Partial<IBudget> = {};
    if (data.amount !== undefined) {
      const value = Number(data.amount);
      if (!Number.isFinite(value) || value <= 0) throw new Error('Hạn mức ngân sách phải lớn hơn 0');
      payload.amount = value;
    }
    if (data.alertThreshold !== undefined) {
      const value = Number(data.alertThreshold);
      if (!Number.isFinite(value) || value <= 0 || value > 100) throw new Error('Ngưỡng cảnh báo phải từ 1 đến 100');
      payload.alertThreshold = value;
    }
    if (data.notes !== undefined) {
      if (typeof data.notes !== 'string') throw new Error('Ghi chú không hợp lệ');
      payload.notes = data.notes;
    }
    if (data.period !== undefined) {
      if (!['weekly', 'monthly', 'yearly'].includes(data.period)) throw new Error('Kỳ ngân sách không hợp lệ');
      payload.period = data.period;
    }
    // Không cho sửa _id, userId, category, month, createdAt, updatedAt.
    if (!Object.keys(payload).length) throw new Error('Không có trường được phép cập nhật');
    return await BudgetModel.findByIdAndUpdate(id, payload);
  }

  static async delete(userId: string, id: string) {
    const existing = await BudgetModel.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error('Ngân sách không tồn tại hoặc không có quyền truy cập');
    }
    return await BudgetModel.findByIdAndDelete(id);
  }

  static async getAlerts(userId: string) {
    const budgetsWithProgress = await this.getBudgetsWithProgress(userId);
    return budgetsWithProgress
      .filter(b => b.status === 'warning' || b.status === 'exceeded')
      .map(b => ({
        id: b._id,
        category: b.category,
        budgetAmount: b.amount,
        spent: b.spent,
        percentage: b.percentage,
        status: b.status,
        message: b.status === 'exceeded'
          ? `Chi tiêu danh mục "${b.category}" đã vượt quá ngân sách (${b.percentage}%)`
          : `Chi tiêu danh mục "${b.category}" đã đạt ${b.percentage}% ngân sách (ngưỡng cảnh báo: ${b.alertThreshold}%)`
      }));
  }
}
