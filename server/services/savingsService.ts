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

    if (!Number.isFinite(initialVal) || initialVal < 0) throw new Error('Số tiền ban đầu không hợp lệ');
    return await SavingsGoalModel.create({
      userId,
      name: data.name,
      targetAmount: Number(data.targetAmount),
      currentAmount: initialVal,
      deadline: data.deadline,
      category: data.category || 'general',
      notes: data.notes,
      icon: data.icon,
      color: data.color
    });
  }

  static async update(userId: string, id: string, data: Partial<ISavingsGoal>) {
    const goal = await SavingsGoalModel.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new Error('Mục tiêu tiết kiệm không tồn tại');
    }

    // currentAmount/history chỉ được thay qua depositOrWithdraw, không qua update.
    const payload: Partial<ISavingsGoal> = {};
    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || !data.name.trim()) throw new Error('Tên mục tiêu không hợp lệ');
      payload.name = data.name.trim();
    }
    if (data.targetAmount !== undefined) {
      const target = Number(data.targetAmount);
      if (!Number.isFinite(target) || target <= 0) throw new Error('Số tiền mục tiêu phải lớn hơn 0');
      payload.targetAmount = target;
      payload.isCompleted = goal.currentAmount >= target;
    }
    if (data.deadline !== undefined) {
      if (typeof data.deadline !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.deadline)) throw new Error('Hạn chót không hợp lệ');
      payload.deadline = data.deadline;
    }
    for (const key of ['category', 'notes', 'icon', 'color'] as const) {
      const value = data[key];
      if (value !== undefined) {
        if (typeof value !== 'string') throw new Error('Thông tin mục tiêu không hợp lệ');
        payload[key] = value;
      }
    }
    if (!Object.keys(payload).length) throw new Error('Không có trường được phép cập nhật');
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

    if (!Number.isFinite(amount) || amount <= 0) {
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
