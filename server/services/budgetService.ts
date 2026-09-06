import { BudgetModel, IBudget } from '../models/Budget';
import { TransactionModel } from '../models/Transaction';

export class BudgetService {
  static async getBudgetsWithProgress(userId: string, monthStr?: string) {
    const month = monthStr || new Date().toISOString().substring(0, 7);
    const budgets = await BudgetModel.find({ userId });
    
    // Get all expense transactions in this month
    const allTransactions = await TransactionModel.find({ userId, type: 'expense' });
    const monthTransactions = allTransactions.filter(t => t.date.startsWith(month));

    return budgets.map(b => {
      const spent = monthTransactions
        .filter(t => t.category === b.category)
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
    if (!data.amount || data.amount <= 0) throw new Error('Hạn mức ngân sách phải lớn hơn 0');

    // Check if budget for category & month already exists
    const currentMonth = data.month || new Date().toISOString().substring(0, 7);
    const existing = await BudgetModel.find({ userId, month: currentMonth });
    const duplicate = existing.find(b => b.category === data.category);
    if (duplicate) {
      throw new Error(`Đã tồn tại ngân sách cho danh mục "${data.category}" trong tháng ${currentMonth}. Vui lòng chỉnh sửa ngân sách hiện có.`);
    }

    return await BudgetModel.create({
      ...data,
      userId,
      amount: Number(data.amount),
      alertThreshold: Number(data.alertThreshold || 80),
      month: currentMonth,
      period: data.period || 'monthly'
    });
  }

  static async update(userId: string, id: string, data: Partial<IBudget>) {
    const existing = await BudgetModel.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error('Ngân sách không tồn tại hoặc không có quyền truy cập');
    }

    const payload: Partial<IBudget> = { ...data };
    if (data.amount !== undefined) payload.amount = Number(data.amount);
    if (data.alertThreshold !== undefined) payload.alertThreshold = Number(data.alertThreshold);

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
