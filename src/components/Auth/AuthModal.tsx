import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, canClose = true }) => {
  const { login, register, demoLogin } = useAuth();
  const { t } = useLanguage();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        if (!name.trim()) {
          throw new Error('Vui lòng nhập họ và tên');
        }
        if (!email.trim()) {
          throw new Error('Vui lòng nhập email');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          throw new Error('Email không đúng định dạng');
        }
        if (!password || password.length < 6) {
          throw new Error('Mật khẩu tối thiểu phải từ 6 ký tự');
        }
        if (password !== confirmPassword) {
          throw new Error('Mật khẩu xác nhận không khớp');
        }
        setLoading(true);
        await register(name.trim(), email.trim(), password);
      } else {
        if (!email.trim() || !password) {
          throw new Error('Vui lòng nhập đầy đủ email và mật khẩu');
        }
        setLoading(true);
        await login(email.trim(), password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Thao tác không thành công');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi vào tài khoản demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {isRegister ? 'Tạo tài khoản mới' : 'Đăng nhập FinTrack'}
              </h3>
              <p className="text-xs text-slate-500">Quản lý chi tiêu cá nhân thông minh</p>
            </div>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Quick Demo Button */}
        <button
          type="button"
          onClick={handleDemo}
          disabled={loading}
          className="w-full mb-4 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Vào nhanh bằng tài khoản Demo có sẵn dữ liệu</span>
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-semibold uppercase">
            hoặc email
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Tối thiểu 6 ký tự)"
                required
                minLength={6}
                className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Xác nhận mật khẩu *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                  minLength={6}
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 mt-2"
          >
            {loading ? 'Đang xử lý...' : isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            {isRegister
              ? 'Đã có tài khoản? Đăng nhập tại đây'
              : 'Chưa có tài khoản? Đăng ký ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};
