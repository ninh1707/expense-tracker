import { UserModel } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { getJwtSecret } from '../utils/jwtSecret';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Vui lòng đăng nhập.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; email: string };
    const account = await UserModel.findById(decoded.userId);
    if (!account || account.disabled) { res.status(401).json({ success: false, message: 'Tài khoản đã bị khóa hoặc không tồn tại' }); return; }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
};
