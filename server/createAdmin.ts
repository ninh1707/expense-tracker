/** Local, interactive administrator provisioning. Never exposed as an HTTP endpoint. */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { UserModel } from './models/User';
import { loadData, saveData, connectDB, isUsingMongo } from './config/db';
import { AuthService } from './services/authService';

async function run() {
  const intendedMongo = Boolean(process.env.MONGODB_URI?.startsWith('mongodb'));
  await connectDB();
  if (intendedMongo && !isUsingMongo()) throw new Error('MongoDB chưa kết nối; dừng để tránh vô tình tạo Admin trong JSON Store.');
  const cli = createInterface({ input, output });
  try {
    const email = (process.env.ADMIN_EMAIL || await cli.question('Email tài khoản quản trị: ')).trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || await cli.question('Mật khẩu quản trị mới (tối thiểu 12 ký tự, không dùng mật khẩu cá nhân): ');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('Email không hợp lệ.');
    if (password.length < 12) throw Error('Mật khẩu cần ít nhất 12 ký tự.');
    const hashedPassword = await bcrypt.hash(password, 12);
    const existing = await UserModel.findOne({ email });
    if (existing) {
      await UserModel.findByIdAndUpdate(existing._id, { role: 'admin', disabled: false, password: hashedPassword });
      console.log(`Đã cấp quyền ADMIN và thay mật khẩu cho ${email}.`);
    } else {
      await UserModel.create({ name: 'Quản trị hệ thống', email, password: hashedPassword, role: 'admin', disabled: false, currency: 'VND', language: 'vi' });
      console.log(`Đã tạo tài khoản ADMIN: ${email}.`);
    }
    // Mongo Admin accounts are created in the users collection above.
    // Do NOT read or copy the unrelated JSON Store when MongoDB is enabled.
    if (isUsingMongo()) {
      console.log('Admin đã được lưu trong MongoDB; đăng xuất rồi đăng nhập lại để cập nhật quyền.');
      return;
    }
    // Seed demo data only when explicitly enabled; admin provisioning must not
    // fail after creating an account just because demo login is disabled.
    if (process.env.ENABLE_DEMO_LOGIN === 'true' && process.env.NODE_ENV !== 'production') {
      await AuthService.seedDemoUser();
    }
    const db=loadData();const admin=db.users.find((u:any)=>u.email===email);
    const demo=db.users.find((u:any)=>u.email==='demo@taichinh.vn');
    if(admin && demo && admin._id!==demo._id){
      const sections=['transactions','budgets','savingsGoals','recurringPayments'] as const;
      let changed=false;
      for(const section of sections){
        if(!db[section].some((item:any)=>item.userId===admin._id)){
          const sample=db[section].filter((item:any)=>item.userId===demo._id);
          for(const item of sample){db[section].push({...item,_id:`${section}_admin_${Date.now()}_${Math.random().toString(36).slice(2)}`,userId:admin._id});changed=true;}
        }
      }
      if(changed){saveData(db);console.log('Đã bổ sung dữ liệu mẫu cho Admin (không ghi đè dữ liệu hiện có).');}
    }
    console.log('Tiếp theo: npm run dev → đăng xuất tài khoản đang dùng → đăng nhập bằng email/mật khẩu vừa tạo.');
  } finally {
    cli.close();
    if (isUsingMongo()) await mongoose.disconnect();
  }
}
run().catch((err) => { console.error('Không thể tạo Admin:', err.message); process.exitCode = 1; });
