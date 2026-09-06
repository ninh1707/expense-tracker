import { loadData, saveData } from '../config/db';

export interface IRecurringPayment {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dueDate: number; // day of the month (1-31) or day
  nextDueDate: string; // YYYY-MM-DD
  reminderDaysBefore: number;
  autoRecordTransaction: boolean;
  status: 'active' | 'paused';
  notes?: string;
  paymentHistory?: {
    date: string;
    amount: number;
    transactionId?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export const RecurringPaymentModel = {
  async find(filter: { userId: string }): Promise<IRecurringPayment[]> {
    const data = loadData();
    return data.recurringPayments
      .filter((r: IRecurringPayment) => r.userId === filter.userId)
      .sort((a: IRecurringPayment, b: IRecurringPayment) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  },

  async findById(id: string): Promise<IRecurringPayment | null> {
    const data = loadData();
    const item = data.recurringPayments.find((r: IRecurringPayment) => r._id === id);
    return item ? { ...item } : null;
  },

  async create(recData: Omit<IRecurringPayment, '_id' | 'createdAt' | 'updatedAt' | 'paymentHistory'>): Promise<IRecurringPayment> {
    const data = loadData();
    const now = new Date().toISOString();
    const newRec: IRecurringPayment = {
      _id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      ...recData,
      paymentHistory: [],
      createdAt: now,
      updatedAt: now
    };
    data.recurringPayments.push(newRec);
    saveData(data);
    return { ...newRec };
  },

  async findByIdAndUpdate(id: string, update: Partial<IRecurringPayment>): Promise<IRecurringPayment | null> {
    const data = loadData();
    const index = data.recurringPayments.findIndex((r: IRecurringPayment) => r._id === id);
    if (index === -1) return null;

    data.recurringPayments[index] = {
      ...data.recurringPayments[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    saveData(data);
    return { ...data.recurringPayments[index] };
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    const data = loadData();
    const initialLen = data.recurringPayments.length;
    data.recurringPayments = data.recurringPayments.filter((r: IRecurringPayment) => r._id !== id);
    if (data.recurringPayments.length !== initialLen) {
      saveData(data);
      return true;
    }
    return false;
  }
};
