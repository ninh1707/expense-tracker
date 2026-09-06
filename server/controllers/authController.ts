import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, currency, language } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: 'Vui lòng nhập họ và tên' });
        return;
      }
      if (!email || !email.trim()) {
        res.status(400).json({ success: false, message: 'Vui lòng nhập email' });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        res.status(400).json({ success: false, message: 'Email không đúng định dạng' });
        return;
      }
      if (!password || password.length < 6) {
        res.status(400).json({ success: false, message: 'Mật khẩu tối thiểu 6 ký tự' });
        return;
      }
      const result = await AuthService.register(name, email, password, currency, language);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Đăng ký thất bại' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !email.trim() || !password) {
        res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ email và mật khẩu' });
        return;
      }
      const result = await AuthService.login(email, password);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message || 'Đăng nhập thất bại' });
    }
  }

  static async demoLogin(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.seedDemoUser();
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Không thể tạo tài khoản mẫu' });
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Chưa xác thực' });
        return;
      }
      const profile = await AuthService.getProfile(userId);
      res.json({ success: true, data: profile });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Không tìm thấy người dùng' });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Chưa xác thực' });
        return;
      }
      const updated = await AuthService.updateProfile(userId, req.body);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Cập nhật thông tin thất bại' });
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Chưa xác thực' });
        return;
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới' });
        return;
      }
      const result = await AuthService.changePassword(userId, currentPassword, newPassword);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Đổi mật khẩu thất bại' });
    }
  }

  static async resetData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Chưa xác thực' });
        return;
      }
      const result = await AuthService.resetUserData(userId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Không thể xóa dữ liệu' });
    }
  }
}
