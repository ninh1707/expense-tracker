import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';
import { SavingsGoal } from '../models/SavingsGoal';
import { RecurringPayment } from '../models/RecurringPayment';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // 1. Tạo user demo
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    let user = await User.findOne({ email: 'demo@example.com' });
    if (!user) {
      user = await User.create({
        username: 'demo_user',
        email: 'demo@example.com',
        password: hashedPassword,
        currency: 'VND',
        createdAt: new Date('2026-09-01'),
      });
      console.log('✅ Demo user created');
    }

    // 2. Xóa dữ liệu cũ để seed lại
    await Transaction.deleteMany({ userId: user._id });
    await Budget.deleteMany({ userId: user._id });
    await SavingsGoal.deleteMany({ userId: user._id });
    await RecurringPayment.deleteMany({ userId: user._id });

    // 3. Tạo giao dịch mẫu (15 giao dịch)
    const now = new Date();
    const transactions = [
      // Thu nhập
      { userId: user._id, type: 'income', category: 'Lương', amount: 15000000, description: 'Lương tháng 9', date: new Date(now.getFullYear(), 8, 1) },
      { userId: user._id, type: 'income', category: 'Thưởng', amount: 3000000, description: 'Thưởng dự án', date: new Date(now.getFullYear(), 8, 15) },
      { userId: user._id, type: 'income', category: 'Đầu tư', amount: 2000000, description: 'Lợi nhuận cổ phiếu', date: new Date(now.getFullYear(), 8, 20) },
      
      // Chi tiêu - Ăn uống
      { userId: user._id, type: 'expense', category: 'Ăn uống', amount: 150000, description: 'Ăn trưa nhà hàng', date: new Date(now.getFullYear(), 8, 2) },
      { userId: user._id, type: 'expense', category: 'Ăn uống', amount: 45000, description: 'Cà phê sáng', date: new Date(now.getFullYear(), 8, 3) },
      { userId: user._id, type: 'expense', category: 'Ăn uống', amount: 250000, description: 'Tiệc cuối tuần', date: new Date(now.getFullYear(), 8, 10) },
      { userId: user._id, type: 'expense', category: 'Ăn uống', amount: 80000, description: 'Ăn tối', date: new Date(now.getFullYear(), 8, 15) },
      
      // Chi tiêu - Di chuyển
      { userId: user._id, type: 'expense', category: 'Di chuyển', amount: 50000, description: 'Xe buýt', date: new Date(now.getFullYear(), 8, 5) },
      { userId: user._id, type: 'expense', category: 'Di chuyển', amount: 200000, description: 'Grab đi làm', date: new Date(now.getFullYear(), 8, 12) },
      
      // Chi tiêu - Nhà ở
      { userId: user._id, type: 'expense', category: 'Nhà ở', amount: 3000000, description: 'Tiền thuê nhà', date: new Date(now.getFullYear(), 8, 1) },
      { userId: user._id, type: 'expense', category: 'Nhà ở', amount: 500000, description: 'Tiền điện', date: new Date(now.getFullYear(), 8, 20) },
      { userId: user._id, type: 'expense', category: 'Nhà ở', amount: 300000, description: 'Tiền nước', date: new Date(now.getFullYear(), 8, 20) },
      
      // Chi tiêu - Giải trí
      { userId: user._id, type: 'expense', category: 'Giải trí', amount: 100000, description: 'Xem phim', date: new Date(now.getFullYear(), 8, 8) },
      { userId: user._id, type: 'expense', category: 'Giải trí', amount: 500000, description: 'Concert', date: new Date(now.getFullYear(), 8, 22) },
      
      // Chi tiêu - Mua sắm
      { userId: user._id, type: 'expense', category: 'Mua sắm', amount: 2000000, description: 'Mua điện thoại mới', date: new Date(now.getFullYear(), 8, 18) },
    ];
    await Transaction.insertMany(transactions);
    console.log('✅ 15 transactions created');

    // 4. Tạo ngân sách mẫu
    const budgets = [
      { userId: user._id, category: 'Ăn uống', limit: 3000000, period: 'monthly', startDate: new Date(now.getFullYear(), 8, 1) },
      { userId: user._id, category: 'Di chuyển', limit: 1000000, period: 'monthly', startDate: new Date(now.getFullYear(), 8, 1) },
      { userId: user._id, category: 'Nhà ở', limit: 5000000, period: 'monthly', startDate: new Date(now.getFullYear(), 8, 1) },
      { userId: user._id, category: 'Giải trí', limit: 1500000, period: 'monthly', startDate: new Date(now.getFullYear(), 8, 1) },
      { userId: user._id, category: 'Mua sắm', limit: 2000000, period: 'monthly', startDate: new Date(now.getFullYear(), 8, 1) },
    ];
    await Budget.insertMany(budgets);
    console.log('✅ 5 budgets created');

    // 5. Tạo mục tiêu tiết kiệm mẫu
    const savings = [
      { 
        userId: user._id, 
        name: 'Du lịch Nhật Bản', 
        targetAmount: 20000000, 
        currentAmount: 5000000, 
        deadline: new Date(now.getFullYear() + 1, 0, 1),
        description: 'Chuyến du lịch mơ ước'
      },
      { 
        userId: user._id, 
        name: 'Mua laptop mới', 
        targetAmount: 15000000, 
        currentAmount: 8000000, 
        deadline: new Date(now.getFullYear(), 11, 1),
        description: 'MacBook Pro M3'
      },
      { 
        userId: user._id, 
        name: 'Quỹ dự phòng', 
        targetAmount: 30000000, 
        currentAmount: 10000000, 
        deadline: new Date(now.getFullYear() + 2, 0, 1),
        description: 'Quỹ dự phòng 6 tháng'
      },
    ];
    await SavingsGoal.insertMany(savings);
    console.log('✅ 3 savings goals created');

    // 6. Tạo thanh toán định kỳ mẫu
    const recurringPayments = [
      { 
        userId: user._id, 
        name: 'Tiền thuê nhà', 
        amount: 3000000, 
        category: 'Nhà ở', 
        frequency: 'monthly', 
        nextDueDate: new Date(now.getFullYear(), 9, 1),
        isActive: true
      },
      { 
        userId: user._id, 
        name: 'Hóa đơn internet', 
        amount: 300000, 
        category: 'Hóa đơn', 
        frequency: 'monthly', 
        nextDueDate: new Date(now.getFullYear(), 9, 15),
        isActive: true
      },
      { 
        userId: user._id, 
        name: 'Phí bảo hiểm', 
        amount: 500000, 
        category: 'Sức khỏe', 
        frequency: 'monthly', 
        nextDueDate: new Date(now.getFullYear(), 9, 10),
        isActive: true
      },
    ];
    await RecurringPayment.insertMany(recurringPayments);
    console.log('✅ 3 recurring payments created');

    console.log('✅ Database seeded successfully!');
    console.log('🔑 Demo: demo@example.com / demo123');
    
  } catch (error) {
    console.error('❌ Seed error:', error);
  }
};