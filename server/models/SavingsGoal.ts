import { loadData, saveData } from '../config/db';

export interface ISavingsGoal {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  color?: string;
  icon?: string;
  notes?: string;
  history: {
    id: string;
    date: string;
    amount: number;
    type: 'deposit' | 'withdraw';
    note?: string;
  }[];
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SavingsGoalModel = {
  async find(filter: { userId: string }): Promise<ISavingsGoal[]> {
    const data = loadData();
    return data.savingsGoals
      .filter((s: ISavingsGoal) => s.userId === filter.userId)
      .sort((a: ISavingsGoal, b: ISavingsGoal) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  },

  async findById(id: string): Promise<ISavingsGoal | null> {
    const data = loadData();
    const item = data.savingsGoals.find((s: ISavingsGoal) => s._id === id);
    return item ? { ...item } : null;
  },

  async create(goalData: Omit<ISavingsGoal, '_id' | 'createdAt' | 'updatedAt' | 'history' | 'isCompleted'>): Promise<ISavingsGoal> {
    const data = loadData();
    const now = new Date().toISOString();
    const newGoal: ISavingsGoal = {
      _id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      ...goalData,
      currentAmount: goalData.currentAmount || 0,
      history: goalData.currentAmount ? [{
        id: 'hist_' + Date.now(),
        date: now.split('T')[0],
        amount: goalData.currentAmount,
        type: 'deposit',
        note: 'Initial deposit'
      }] : [],
      isCompleted: (goalData.currentAmount || 0) >= goalData.targetAmount,
      createdAt: now,
      updatedAt: now
    };
    data.savingsGoals.push(newGoal);
    saveData(data);
    return { ...newGoal };
  },

  async findByIdAndUpdate(id: string, update: Partial<ISavingsGoal>): Promise<ISavingsGoal | null> {
    const data = loadData();
    const index = data.savingsGoals.findIndex((s: ISavingsGoal) => s._id === id);
    if (index === -1) return null;

    data.savingsGoals[index] = {
      ...data.savingsGoals[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    saveData(data);
    return { ...data.savingsGoals[index] };
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    const data = loadData();
    const initialLen = data.savingsGoals.length;
    data.savingsGoals = data.savingsGoals.filter((s: ISavingsGoal) => s._id !== id);
    if (data.savingsGoals.length !== initialLen) {
      saveData(data);
      return true;
    }
    return false;
  }
};
