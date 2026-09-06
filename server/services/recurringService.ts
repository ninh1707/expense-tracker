import { RecurringPaymentModel, IRecurringPayment } from '../models/RecurringPayment';
import { TransactionModel } from '../models/Transaction';

export class RecurringService {
  static async getAll(userId: string) {
    const list = await RecurringPaymentModel.find({ userId });
    const today = new Date().toISOString().split('T')[0];

    return list.map(r => {
      const isDueSoon = this.checkIsDueSoon(r.nextDueDate, r.reminderDaysBefore);
      const isOverdue = r.nextDueDate < today && r.status === 'active';

      return {
        ...r,
        isDueSoon,
        isOverdue
      };
    });
  }

  static async getById(userId: string, id: string) {
    const item = await RecurringPaymentModel.findById(id);
    if (!item || item.userId !== userId) {
      throw new Error('Khoản thanh toán định kỳ không tồn tại');
    }
    return item;
  }

  static async create(userId: string, data: Omit<IRecurringPayment, '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'paymentHistory'>) {
    if (!data.title) throw new Error('Tên khoản thanh toán không được để trống');
    if (!data.amount || data.amount <= 0) throw new Error('Số tiền phải lớn hơn 0');

    // Calculate initial nextDueDate if not provided
    let nextDueDate = data.nextDueDate;
    if (!nextDueDate) {
      const now = new Date();
      const dueDay = data.dueDate || now.getDate();
      const targetMonth = now.getDate() > dueDay ? now.getMonth() + 1 : now.getMonth();
      const targetDate = new Date(now.getFullYear(), targetMonth, dueDay);
      nextDueDate = targetDate.toISOString().split('T')[0];
    }

    return await RecurringPaymentModel.create({
      ...data,
      userId,
      amount: Number(data.amount),
      dueDate: Number(data.dueDate || 1),
      reminderDaysBefore: Number(data.reminderDaysBefore || 3),
      nextDueDate,
      status: data.status || 'active',
      autoRecordTransaction: data.autoRecordTransaction !== undefined ? data.autoRecordTransaction : true
    });
  }

  static async update(userId: string, id: string, data: Partial<IRecurringPayment>) {
    const item = await RecurringPaymentModel.findById(id);
    if (!item || item.userId !== userId) {
      throw new Error('Khoản thanh toán định kỳ không tồn tại');
    }

    const payload: Partial<IRecurringPayment> = { ...data };
    if (data.amount !== undefined) payload.amount = Number(data.amount);
    if (data.dueDate !== undefined) payload.dueDate = Number(data.dueDate);
    if (data.reminderDaysBefore !== undefined) payload.reminderDaysBefore = Number(data.reminderDaysBefore);

    return await RecurringPaymentModel.findByIdAndUpdate(id, payload);
  }

  static async delete(userId: string, id: string) {
    const item = await RecurringPaymentModel.findById(id);
    if (!item || item.userId !== userId) {
      throw new Error('Khoản thanh toán định kỳ không tồn tại');
    }
    return await RecurringPaymentModel.findByIdAndDelete(id);
  }

  static async markAsPaid(userId: string, id: string, paidDate?: string, recordTransaction?: boolean) {
    const item = await RecurringPaymentModel.findById(id);
    if (!item || item.userId !== userId) {
      throw new Error('Khoản thanh toán định kỳ không tồn tại');
    }

    const todayStr = paidDate || new Date().toISOString().split('T')[0];
    let createdTxId: string | undefined = undefined;

    // If autoRecordTransaction is enabled or explicitly requested, record transaction
    if (recordTransaction || item.autoRecordTransaction) {
      const tx = await TransactionModel.create({
        userId,
        type: item.type,
        amount: item.amount,
        category: item.category,
        date: todayStr,
        description: `Thanh toán định kỳ: ${item.title}`,
        paymentMethod: 'bank_transfer',
        recurringPaymentId: item._id,
        tags: ['định kỳ', item.title]
      });
      createdTxId = tx._id;
    }

    // Advance nextDueDate based on frequency
    const currentNext = new Date(item.nextDueDate);
    let nextDate = new Date(currentNext);

    switch (item.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const nextDueDateStr = nextDate.toISOString().split('T')[0];

    const newPaymentHistory = [
      ...(item.paymentHistory || []),
      {
        date: todayStr,
        amount: item.amount,
        transactionId: createdTxId
      }
    ];

    return await RecurringPaymentModel.findByIdAndUpdate(id, {
      nextDueDate: nextDueDateStr,
      paymentHistory: newPaymentHistory
    });
  }

  static async getDueReminders(userId: string) {
    const all = await this.getAll(userId);
    return all.filter(r => r.status === 'active' && (r.isDueSoon || r.isOverdue));
  }

  private static checkIsDueSoon(nextDueDateStr: string, reminderDays: number): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(nextDueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= (reminderDays || 3);
  }
}
