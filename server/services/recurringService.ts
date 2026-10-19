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
    if (!data.amount || (!Number.isFinite(Number(data.amount)) || Number(data.amount) <= 0)) throw new Error('Số tiền phải lớn hơn 0');

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
      userId,
      title: data.title,
      type: data.type,
      category: data.category,
      frequency: data.frequency,
      amount: Number(data.amount),
      dueDate: Number(data.dueDate || 1),
      reminderDaysBefore: Number(data.reminderDaysBefore || 3),
      nextDueDate,
      status: data.status || 'active',
      notes: data.notes,
      autoRecordTransaction: data.autoRecordTransaction !== undefined ? data.autoRecordTransaction : true
    });
  }

  static async update(userId: string, id: string, data: Partial<IRecurringPayment>) {
    const item = await RecurringPaymentModel.findById(id);
    if (!item || item.userId !== userId) {
      throw new Error('Khoản thanh toán định kỳ không tồn tại');
    }

    const payload: Partial<IRecurringPayment> = {};
    for (const key of ['title', 'category', 'nextDueDate', 'notes'] as const) {
      const value = data[key];
      if (value !== undefined) {
        if (typeof value !== 'string' || (key !== 'notes' && !value.trim())) throw new Error('Thông tin khoản định kỳ không hợp lệ');
        payload[key] = value;
      }
    }
    if (data.amount !== undefined) {
      const amount = Number(data.amount);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('Số tiền phải lớn hơn 0');
      payload.amount = amount;
    }
    if (data.dueDate !== undefined) {
      const day = Number(data.dueDate);
      if (!Number.isInteger(day) || day < 1 || day > 31) throw new Error('Ngày đến hạn không hợp lệ');
      payload.dueDate = day;
    }
    if (data.reminderDaysBefore !== undefined) {
      const days = Number(data.reminderDaysBefore);
      if (!Number.isInteger(days) || days < 0 || days > 365) throw new Error('Số ngày nhắc không hợp lệ');
      payload.reminderDaysBefore = days;
    }
    if (data.type !== undefined) {
      if (!['income', 'expense'].includes(data.type)) throw new Error('Loại giao dịch không hợp lệ');
      payload.type = data.type;
    }
    if (data.frequency !== undefined) {
      if (!['daily', 'weekly', 'monthly', 'yearly'].includes(data.frequency)) throw new Error('Chu kỳ không hợp lệ');
      payload.frequency = data.frequency;
    }
    if (data.status !== undefined) {
      if (!['active', 'paused'].includes(data.status)) throw new Error('Trạng thái không hợp lệ');
      payload.status = data.status;
    }
    if (data.autoRecordTransaction !== undefined) {
      if (typeof data.autoRecordTransaction !== 'boolean') throw new Error('Cờ ghi giao dịch không hợp lệ');
      payload.autoRecordTransaction = data.autoRecordTransaction;
    }
    // paymentHistory, _id, userId và timestamps không được nhận từ request.
    if (!Object.keys(payload).length) throw new Error('Không có trường được phép cập nhật');
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
    // Ngày tài chính dạng YYYY-MM-DD: tính theo UTC để không lệch múi giờ.
    const [dueYear, dueMonth, dueDay] = item.nextDueDate.split('-').map(Number);
    const nextDate = new Date(Date.UTC(dueYear, dueMonth - 1, dueDay));
    const advanceMonth = (months: number) => {
      const startOfTarget = new Date(Date.UTC(dueYear, dueMonth - 1 + months, 1));
      const lastDay = new Date(Date.UTC(startOfTarget.getUTCFullYear(), startOfTarget.getUTCMonth() + 1, 0)).getUTCDate();
      startOfTarget.setUTCDate(Math.min(dueDay, lastDay));
      return startOfTarget;
    };
    let advanced: Date;
    switch (item.frequency) {
      case 'daily': advanced = new Date(nextDate.getTime() + 86400000); break;
      case 'weekly': advanced = new Date(nextDate.getTime() + 7 * 86400000); break;
      case 'yearly': advanced = advanceMonth(12); break;
      default: advanced = advanceMonth(1); break;
    }
    const nextDueDateStr = advanced.toISOString().split('T')[0];

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
