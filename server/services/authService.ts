import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/User';
import { TransactionModel } from '../models/Transaction';
import { BudgetModel } from '../models/Budget';
import { SavingsGoalModel } from '../models/SavingsGoal';
import { RecurringPaymentModel } from '../models/RecurringPayment';

import { getJwtSecret } from '../utils/jwtSecret';

export class AuthService {
  static async register(name: string, email: string, password: string, currency = 'VND', language = 'vi') {
    const existing = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw new Error('Email đã được sử dụng');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
      currency: currency || 'VND',
      language: language || 'vi',
      monthlyIncomeTarget: 25000000
    });

    const token = jwt.sign({ userId: user._id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });
    const { password: _, ...userWithoutPass } = user;
    return { user: userWithoutPass, token };
  }

  static async login(email: string, password: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // Chỉ thông báo khóa tài khoản sau khi mật khẩu đúng, tránh dò email tồn tại.
    if (user.disabled) {
      throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });
    const { password: _, ...userWithoutPass } = user;
    return { user: userWithoutPass, token };
  }

  static async getProfile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    const { password: _, ...userWithoutPass } = user;
    return userWithoutPass;
  }

  static async updateProfile(userId: string, data: Partial<IUser>) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    const updatePayload: Partial<IUser> = {};
    if (data.name) updatePayload.name = data.name.trim();
    if (data.currency) updatePayload.currency = data.currency;
    if (data.language) updatePayload.language = data.language;
    if (data.monthlyIncomeTarget !== undefined) updatePayload.monthlyIncomeTarget = Number(data.monthlyIncomeTarget);

    const updated = await UserModel.findByIdAndUpdate(userId, updatePayload);
    if (!updated) throw new Error('Không tìm thấy người dùng');
    const { password: _, ...userWithoutPass } = updated;
    return userWithoutPass;
  }

  /**
   * Seeds demo user with realistic sample transactions, budgets, savings, and bills
   * so user can immediately test all dashboard features with high fidelity!
   */
  static async seedDemoUser() {
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEMO_LOGIN !== 'true') {
      throw new Error('Chức năng đăng nhập thử không được bật.');
    }
    const demoEmail = 'demo@taichinh.vn';
    let user = await UserModel.findOne({ email: demoEmail });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      user = await UserModel.create({
        name: 'Nguyễn Văn An',
        email: demoEmail,
        password: hashedPassword,
        currency: 'VND',
        language: 'vi',
        monthlyIncomeTarget: 30000000
      });

      const uid = user._id;

      // Seed sample transactions for current month and previous weeks
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const todayDate = now.toISOString().split('T')[0];

      const sampleTx = [
        { userId: uid, type: 'income', amount: 28000000, category: 'salary', date: `${currentYear}-${currentMonth}-05`, description: 'Lương tháng công ty công nghệ', paymentMethod: 'bank_transfer', tags: ['cố định', 'lương'] },
        { userId: uid, type: 'income', amount: 4500000, category: 'freelance', date: `${currentYear}-${currentMonth}-12`, description: 'Thiết kế website freelance', paymentMethod: 'bank_transfer', tags: ['thêm'] },
        { userId: uid, type: 'income', amount: 1200000, category: 'investment', date: `${currentYear}-${currentMonth}-18`, description: 'Cổ tức chứng khoán', paymentMethod: 'bank_transfer', tags: ['đầu tư'] },
        
        { userId: uid, type: 'expense', amount: 4500000, category: 'bills', date: `${currentYear}-${currentMonth}-02`, description: 'Tiền thuê căn hộ tháng này', paymentMethod: 'bank_transfer', tags: ['cố định', 'nhà'] },
        { userId: uid, type: 'expense', amount: 850000, category: 'bills', date: `${currentYear}-${currentMonth}-04`, description: 'Tiền điện & nước sinh hoạt', paymentMethod: 'e_wallet', tags: ['hóa đơn'] },
        { userId: uid, type: 'expense', amount: 250000, category: 'bills', date: `${currentYear}-${currentMonth}-05`, description: 'Cước Internet cáp quang FPT', paymentMethod: 'e_wallet', tags: ['mạng'] },
        { userId: uid, type: 'expense', amount: 320000, category: 'food', date: `${currentYear}-${currentMonth}-06`, description: 'Đi siêu thị WinMart cuối tuần', paymentMethod: 'credit_card', tags: ['thực phẩm'] },
        { userId: uid, type: 'expense', amount: 65000, category: 'food', date: `${currentYear}-${currentMonth}-08`, description: 'Cà phê sáng Highlands Coffee', paymentMethod: 'cash', tags: ['cà phê'] },
        { userId: uid, type: 'expense', amount: 150000, category: 'transport', date: `${currentYear}-${currentMonth}-09`, description: 'Đổ xăng xe máy Petrolimex', paymentMethod: 'cash', tags: ['xăng'] },
        { userId: uid, type: 'expense', amount: 480000, category: 'food', date: `${currentYear}-${currentMonth}-11`, description: 'Ăn tối liên hoan bạn bè Pizza 4P\'s', paymentMethod: 'credit_card', tags: ['bạn bè'] },
        { userId: uid, type: 'expense', amount: 1250000, category: 'shopping', date: `${currentYear}-${currentMonth}-14`, description: 'Mua giày thể thao chạy bộ mới', paymentMethod: 'credit_card', tags: ['thể thao'] },
        { userId: uid, type: 'expense', amount: 300000, category: 'health', date: `${currentYear}-${currentMonth}-16`, description: 'Thuốc bổ và vitamin tổng hợp', paymentMethod: 'e_wallet', tags: ['sức khỏe'] },
        { userId: uid, type: 'expense', amount: 1500000, category: 'education', date: `${currentYear}-${currentMonth}-20`, description: 'Khóa học tiếng Anh giao tiếp Udemy', paymentMethod: 'credit_card', tags: ['học tập'] },
        { userId: uid, type: 'expense', amount: 220000, category: 'entertainment', date: `${currentYear}-${currentMonth}-22`, description: 'Vé xem phim CGV IMAX cuối tuần', paymentMethod: 'e_wallet', tags: ['giải trí'] }
      ];

      for (const t of sampleTx) {
        await TransactionModel.create(t as any);
      }

      // Seed sample budgets
      const sampleBudgets = [
        { userId: uid, category: 'food', amount: 4000000, period: 'monthly', month: `${currentYear}-${currentMonth}`, alertThreshold: 80, notes: 'Ngân sách ăn uống sinh hoạt' },
        { userId: uid, category: 'bills', amount: 6000000, period: 'monthly', month: `${currentYear}-${currentMonth}`, alertThreshold: 90, notes: 'Hóa đơn & tiền nhà cố định' },
        { userId: uid, category: 'shopping', amount: 2000000, period: 'monthly', month: `${currentYear}-${currentMonth}`, alertThreshold: 75, notes: 'Mua sắm cá nhân' },
        { userId: uid, category: 'entertainment', amount: 1500000, period: 'monthly', month: `${currentYear}-${currentMonth}`, alertThreshold: 80, notes: 'Vui chơi giải trí cuối tuần' },
        { userId: uid, category: 'transport', amount: 1000000, period: 'monthly', month: `${currentYear}-${currentMonth}`, alertThreshold: 85, notes: 'Xăng xe & di chuyển' }
      ];

      for (const b of sampleBudgets) {
        await BudgetModel.create(b as any);
      }

      // Seed savings goals
      const sampleGoals = [
        {
          userId: uid,
          name: 'Quỹ dự phòng khẩn cấp',
          targetAmount: 50000000,
          currentAmount: 35000000,
          deadline: `${currentYear + 1}-06-30`,
          category: 'emergency',
          color: '#10b981',
          icon: 'ShieldCheck',
          notes: 'Dự phòng 3-6 tháng chi tiêu sinh hoạt'
        },
        {
          userId: uid,
          name: 'Mua Macbook Pro M3',
          targetAmount: 38000000,
          currentAmount: 24500000,
          deadline: `${currentYear}-12-25`,
          category: 'gadget',
          color: '#3b82f6',
          icon: 'Laptop',
          notes: 'Nâng cấp máy tính phục vụ công việc lập trình'
        },
        {
          userId: uid,
          name: 'Du lịch Đà Nẵng - Hội An',
          targetAmount: 12000000,
          currentAmount: 9000000,
          deadline: `${currentYear + 1}-04-30`,
          category: 'travel',
          color: '#f59e0b',
          icon: 'Plane',
          notes: 'Chuyến đi nghỉ mát cùng gia đình'
        }
      ];

      for (const g of sampleGoals) {
        await SavingsGoalModel.create(g as any);
      }

      // Seed recurring payments
      const sampleRecurring = [
        {
          userId: uid,
          title: 'Tiền thuê nhà chung cư',
          amount: 4500000,
          type: 'expense',
          category: 'bills',
          frequency: 'monthly',
          dueDate: 2,
          nextDueDate: `${currentYear}-${currentMonth}-02`,
          reminderDaysBefore: 3,
          autoRecordTransaction: true,
          status: 'active',
          notes: 'Chuyển khoản cho chủ nhà'
        },
        {
          userId: uid,
          title: 'Hóa đơn điện lực EVN',
          amount: 650000,
          type: 'expense',
          category: 'bills',
          frequency: 'monthly',
          dueDate: 15,
          nextDueDate: `${currentYear}-${currentMonth}-15`,
          reminderDaysBefore: 3,
          autoRecordTransaction: true,
          status: 'active',
          notes: 'Thanh toán qua ví điện tử'
        },
        {
          userId: uid,
          title: 'Gói xem phim Netflix Premium',
          amount: 260000,
          type: 'expense',
          category: 'entertainment',
          frequency: 'monthly',
          dueDate: 20,
          nextDueDate: `${currentYear}-${currentMonth}-20`,
          reminderDaysBefore: 2,
          autoRecordTransaction: true,
          status: 'active',
          notes: 'Trừ thẻ tín dụng tự động'
        }
      ];

      for (const r of sampleRecurring) {
        await RecurringPaymentModel.create(r as any);
      }
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });
    const { password: _, ...userWithoutPass } = user;
    return { user: userWithoutPass, token };
  }

  static async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Người dùng không tồn tại');

    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) {
      throw new Error('Mật khẩu hiện tại không chính xác');
    }

    if (!newPass || newPass.length < 8) {
      throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPass, salt);
    await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
    return { message: 'Đổi mật khẩu thành công' };
  }

  static async resetUserData(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Người dùng không tồn tại');

    // Delete all transactions, budgets, savings, recurring payments for this user
    const txs = await TransactionModel.find({ userId });
    for (const t of txs) {
      await TransactionModel.findByIdAndDelete(t._id);
    }

    const budgets = await BudgetModel.find({ userId });
    for (const b of budgets) {
      await BudgetModel.findByIdAndDelete(b._id);
    }

    const goals = await SavingsGoalModel.find({ userId });
    for (const g of goals) {
      await SavingsGoalModel.findByIdAndDelete(g._id);
    }

    const recurs = await RecurringPaymentModel.find({ userId });
    for (const r of recurs) {
      await RecurringPaymentModel.findByIdAndDelete(r._id);
    }

    return { message: 'Đã xóa toàn bộ dữ liệu tài chính thành công' };
  }
}
