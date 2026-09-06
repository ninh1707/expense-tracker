import { loadData, saveData } from '../config/db';

export interface IBudget {
  _id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  month?: string; // YYYY-MM
  alertThreshold: number; // e.g. 80 (%)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const BudgetModel = {
  async find(filter: { userId: string; month?: string }): Promise<IBudget[]> {
    const data = loadData();
    return data.budgets.filter((b: IBudget) => {
      if (b.userId !== filter.userId) return false;
      if (filter.month && b.month && b.month !== filter.month) return false;
      return true;
    });
  },

  async findById(id: string): Promise<IBudget | null> {
    const data = loadData();
    const item = data.budgets.find((b: IBudget) => b._id === id);
    return item ? { ...item } : null;
  },

  async create(budgetData: Omit<IBudget, '_id' | 'createdAt' | 'updatedAt'>): Promise<IBudget> {
    const data = loadData();
    const now = new Date().toISOString();
    const newBudget: IBudget = {
      _id: 'bgt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      ...budgetData,
      alertThreshold: budgetData.alertThreshold || 80,
      createdAt: now,
      updatedAt: now
    };
    data.budgets.push(newBudget);
    saveData(data);
    return { ...newBudget };
  },

  async findByIdAndUpdate(id: string, update: Partial<IBudget>): Promise<IBudget | null> {
    const data = loadData();
    const index = data.budgets.findIndex((b: IBudget) => b._id === id);
    if (index === -1) return null;

    data.budgets[index] = {
      ...data.budgets[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    saveData(data);
    return { ...data.budgets[index] };
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    const data = loadData();
    const initialLen = data.budgets.length;
    data.budgets = data.budgets.filter((b: IBudget) => b._id !== id);
    if (data.budgets.length !== initialLen) {
      saveData(data);
      return true;
    }
    return false;
  }
};
