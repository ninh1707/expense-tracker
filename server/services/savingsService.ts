import { SavingsGoalModel, ISavingsGoal } from '../models/SavingsGoal';
import { TransactionModel } from '../models/Transaction';

export class SavingsService {
  static async getAll(userId: string) {
    const goals = await SavingsGoalModel.find({ userId });
    const now = new Date();

    return goals.map(g => {
      const percentage = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
      const targetDate = new Date(g.deadline);
      const diffTime = targetDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...g,
        percentage,
        daysRemaining: daysRemaining >= 0 ? daysRemaining : 0,
        isOverdue: daysRemaining < 0 && !g.isCompleted
      };
    });
  }

  static async getById(userId: string, id: string) {
    const goal = await SavingsGoalModel.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new Error('Mục tiêu tiết kiệm không tồn tại');
    }
    return goal;
  }

  static async create(userId: string, data: Omit<ISavingsGoal, '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'history' | 'isCompleted'>) {
    if (!data.name) throw new Error('Tên mục tiêu không được để trống');
    if (!data.targetAmount || data.targetAmount <= 0) throw new Error('Mục tiêu tiền phải lớn hơn 0');
    if (!data.deadline) throw new Error('Hạn chót không được để trống');

    const initialVal = Number(data.currentAmount !== undefined ? data.currentAmount : (data as any).initialAmount || 0);

    return await SavingsGoalModel.create({
      ...data,
      userId,
      targetAmount: Number(data.targetAmount),
      currentAmount: initialVal,
      category: data.category || 'general'
    });
  }

  static async update(userId: string, id: string, data: Partial<ISavingsGoal>) {
    const goal = await SavingsGoalModel.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new Error('Mục tiêu tiết kiệm không tồn tại');
    }

    const payload: Partial<ISavingsGoal> = { ...data };
    if (data.targetAmount !== undefined) payload.targetAmount = Number(data.targetAmount);
    if (data.currentAmount !== undefined) {
      payload.currentAmount = Number(data.currentAmount);
      payload.isCompleted = payload.currentAmount >= (data.targetAmount || goal.targetAmount);
    }

    return await SavingsGoalModel.findByIdAndUpdate(id, payload);
  }

  static async depositOrWithdraw(
    userId: string,
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdraw',
    note?: string,
    recordTransaction = false
  ) {
    const goal = await SavingsGoalModel.findById(goalId);
    if (!goal || goal.userId !== userId) {
      throw new Error('Mục tiêu tiết kiệm không tồn tại');
    }

    if (!amount || amount <= 0) {
      throw new Error('Số tiền phải lớn hơn 0');
    }

    let newCurrent = goal.currentAmount;
    if (type === 'deposit') {
      newCurrent += amount;
    } else {
      if (amount > goal.currentAmount) {
        throw new Error('Số tiền rút vượt quá số dư tích lũy hiện tại');
      }
      newCurrent -= amount;
    }

    const newHistory = [
      ...(goal.history || []),
      {
        id: 'hist_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        amount,
        type,
        note: note || (type === 'deposit' ? 'Gửi tiền vào mục tiêu' : 'Rút tiền từ mục tiêu')
      }
    ];

    const isCompleted = newCurrent >= goal.targetAmount;

    const updated = await SavingsGoalModel.findByIdAndUpdate(goalId, {
      currentAmount: newCurrent,
      history: newHistory,
      isCompleted
    });

    // Optionally record an expense or income transaction
    if (recordTransaction) {
      await TransactionModel.create({
        userId,
        type: type === 'deposit' ? 'expense' : 'income',
        amount,
        category: 'savings',
        date: new Date().toISOString().split('T')[0],
        description: `${type === 'deposit' ? 'Tích lũy' : 'Rút tiết kiệm'}: ${goal.name}`,
        paymentMethod: 'bank_transfer',
        tags: ['tiết kiệm', goal.name]
      });
    }

    return updated;
  }

  static async delete(userId: string, id: string) {
    const goal = await SavingsGoalModel.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new Error('Mục tiêu tiết kiệm không tồn tại');
    }
    return await SavingsGoalModel.findByIdAndDelete(id);
  }
}
