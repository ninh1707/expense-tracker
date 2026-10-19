import { TransactionModel, ITransaction, TransactionType } from '../models/Transaction';

export interface TransactionFilter {
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
}

export class TransactionService {
  static async getAll(userId: string, filter: TransactionFilter = {}) {
    const list = await TransactionModel.find({ userId, ...filter });
    
    return list.filter(t => {
      if (filter.minAmount !== undefined && t.amount < filter.minAmount) return false;
      if (filter.maxAmount !== undefined && t.amount > filter.maxAmount) return false;
      if (filter.paymentMethod && t.paymentMethod !== filter.paymentMethod) return false;
      return true;
    });
  }

  static async getPage(userId: string, filter: TransactionFilter, page: number, limit: number) {
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 100) {
      throw new Error('page phải >= 1 và limit phải từ 1 đến 100.');
    }
    const result = await TransactionModel.paginate({ userId, ...filter }, page, limit);
    return { items: result.items, total: result.total, page, limit, totalPages: Math.ceil(result.total / limit) };
  }

  static async getById(userId: string, id: string) {
    const tx = await TransactionModel.findById(id);
    if (!tx || tx.userId !== userId) {
      throw new Error('Transaction not found or unauthorized');
    }
    return tx;
  }

  static async create(userId: string, data: Omit<ITransaction, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    if (!data.amount || (!Number.isFinite(Number(data.amount)) || Number(data.amount) <= 0)) {
      throw new Error('Số tiền phải lớn hơn 0 / Amount must be greater than 0');
    }
    if (!data.category) {
      throw new Error('Danh mục không được bỏ trống / Category is required');
    }
    if (!data.date) {
      data.date = new Date().toISOString().split('T')[0];
    }

    return await TransactionModel.create({
      userId,
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      date: data.date,
      description: data.description,
      paymentMethod: data.paymentMethod,
      tags: Array.isArray(data.tags) ? data.tags : [],
    });
  }

  static async update(userId: string, id: string, data: Partial<ITransaction>) {
    const existing = await TransactionModel.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error('Transaction not found or unauthorized');
    }

    if (data.amount !== undefined && (!Number.isFinite(Number(data.amount)) || Number(data.amount) <= 0)) {
      throw new Error('Số tiền phải lớn hơn 0 / Amount must be greater than 0');
    }

    // Chỉ chấp nhận các trường chỉnh sửa được. Không bao giờ nhận userId,
    // _id, createdAt, updatedAt hoặc recurringPaymentId từ request.
    const payload: Partial<ITransaction> = {};
    if (data.type !== undefined) {
      if (data.type !== 'income' && data.type !== 'expense') throw new Error('Loại giao dịch không hợp lệ');
      payload.type = data.type;
    }
    if (data.amount !== undefined) payload.amount = Number(data.amount);
    if (data.category !== undefined) {
      if (typeof data.category !== 'string' || !data.category.trim()) throw new Error('Danh mục không hợp lệ');
      payload.category = data.category.trim();
    }
    if (data.date !== undefined) {
      if (typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error('Ngày không hợp lệ');
      payload.date = data.date;
    }
    if (data.description !== undefined) {
      if (typeof data.description !== 'string') throw new Error('Mô tả không hợp lệ');
      payload.description = data.description;
    }
    if (data.paymentMethod !== undefined) {
      if (typeof data.paymentMethod !== 'string') throw new Error('Phương thức thanh toán không hợp lệ');
      payload.paymentMethod = data.paymentMethod;
    }
    if (data.tags !== undefined) {
      if (!Array.isArray(data.tags) || !data.tags.every(t => typeof t === 'string')) throw new Error('Thẻ giao dịch không hợp lệ');
      payload.tags = data.tags;
    }
    if (!Object.keys(payload).length) throw new Error('Không có trường được phép cập nhật');
    return await TransactionModel.findByIdAndUpdate(id, payload);
  }

  static async delete(userId: string, id: string) {
    const existing = await TransactionModel.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error('Transaction not found or unauthorized');
    }

    return await TransactionModel.findByIdAndDelete(id);
  }

  static async getDashboardSummary(userId: string, monthStr?: string) {
    const all = await TransactionModel.find({ userId });
    const currentMonth = monthStr || new Date().toISOString().substring(0, 7); // YYYY-MM

    const monthTx = all.filter(t => t.date.startsWith(currentMonth));

    const totalIncome = monthTx
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTx
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

    // Category breakdown for expenses
    const categoryTotals: Record<string, number> = {};
    monthTx
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const categoryBreakdown = Object.entries(categoryTotals).map(([cat, amount]) => ({
      category: cat,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    // Monthly breakdown for last 6 months
    const monthlyTrend: { month: string; income: number; expense: number; balance: number }[] = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mStr = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}`;
      const txs = all.filter(t => t.date.startsWith(mStr));
      const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      monthlyTrend.push({
        month: mStr,
        income: inc,
        expense: exp,
        balance: inc - exp
      });
    }

    const healthStatus = savingsRate >= 20 ? 'Lành mạnh' : savingsRate >= 10 ? 'Trung bình' : 'Cần tối ưu';

    return {
      month: currentMonth,
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      healthStatus,
      transactionCount: monthTx.length,
      categoryBreakdown,
      monthlyTrend,
      recentTransactions: monthTx.slice(0, 5)
    };
  }
}
