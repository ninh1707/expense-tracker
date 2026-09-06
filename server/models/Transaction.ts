import { loadData, saveData } from '../config/db';

export type TransactionType = 'income' | 'expense';

export interface ITransaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: string;
  tags?: string[];
  recurringPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export const TransactionModel = {
  async find(filter: { userId: string; [key: string]: any }): Promise<ITransaction[]> {
    const data = loadData();
    return data.transactions
      .filter((t: ITransaction) => {
        if (t.userId !== filter.userId) return false;
        if (filter.type && t.type !== filter.type) return false;
        if (filter.category && t.category !== filter.category) return false;
        if (filter.startDate && t.date < filter.startDate) return false;
        if (filter.endDate && t.date > filter.endDate) return false;
        if (filter.search) {
          const s = filter.search.toLowerCase();
          const matchDesc = (t.description || '').toLowerCase().includes(s);
          const matchCat = (t.category || '').toLowerCase().includes(s);
          if (!matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a: ITransaction, b: ITransaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async findById(id: string): Promise<ITransaction | null> {
    const data = loadData();
    const item = data.transactions.find((t: ITransaction) => t._id === id);
    return item ? { ...item } : null;
  },

  async create(txData: Omit<ITransaction, '_id' | 'createdAt' | 'updatedAt'>): Promise<ITransaction> {
    const data = loadData();
    const now = new Date().toISOString();
    const newTx: ITransaction = {
      _id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      ...txData,
      createdAt: now,
      updatedAt: now
    };
    data.transactions.push(newTx);
    saveData(data);
    return { ...newTx };
  },

  async findByIdAndUpdate(id: string, update: Partial<ITransaction>): Promise<ITransaction | null> {
    const data = loadData();
    const index = data.transactions.findIndex((t: ITransaction) => t._id === id);
    if (index === -1) return null;

    data.transactions[index] = {
      ...data.transactions[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    saveData(data);
    return { ...data.transactions[index] };
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    const data = loadData();
    const initialLen = data.transactions.length;
    data.transactions = data.transactions.filter((t: ITransaction) => t._id !== id);
    if (data.transactions.length !== initialLen) {
      saveData(data);
      return true;
    }
    return false;
  }
};
