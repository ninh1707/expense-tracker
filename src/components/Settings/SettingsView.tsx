import React, { useState } from 'react';
import {
  User,
  Shield,
  Coins,
  Globe,
  Database,
  Sparkles,
  Check,
  Download,
  AlertCircle,
  Lock,
  Bell,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { api } from '../../services/api';

interface SettingsViewProps {
  currency: string;
  onCurrencyChange: (c: string) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currency,
  onCurrencyChange,
  onResetData
}) => {
  const { user, updateProfile, demoLogin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { addToast } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState<number | string>(
    user?.monthlyIncomeTarget || ''
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Notification settings state
  const [budgetAlerts, setBudgetAlerts] = useState<boolean>(() => {
    return localStorage.getItem('fintrack_notif_budget') !== 'false';
  });
  const [billReminders, setBillReminders] = useState<boolean>(() => {
    return localStorage.getItem('fintrack_notif_bill') !== 'false';
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile({
        name: name.trim(),
        monthlyIncomeTarget: Number(monthlyIncomeTarget) || 0
      });
      addToast('Thành công', 'Đã cập nhật thông tin hồ sơ', 'success');
    } catch (err: any) {
      addToast('Lỗi', err.message || 'Cập nhật thất bại', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Mật khẩu mới tối thiểu phải từ 6 ký tự');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Mật khẩu mới xác nhận không khớp');
      return;
    }

    setIsChangingPass(true);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      addToast('Thành công', 'Đổi mật khẩu thành công', 'success');
    } catch (err: any) {
      setPasswordError(err.message || 'Đổi mật khẩu thất bại');
      addToast('Lỗi', err.message || 'Đổi mật khẩu thất bại', 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleToggleBudgetAlerts = (checked: boolean) => {
    setBudgetAlerts(checked);
    localStorage.setItem('fintrack_notif_budget', String(checked));
    addToast('Cài đặt', `Đã ${checked ? 'bật' : 'tắt'} cảnh báo vượt hạn mức ngân sách`, 'info');
  };

  const handleToggleBillReminders = (checked: boolean) => {
    setBillReminders(checked);
    localStorage.setItem('fintrack_notif_bill', String(checked));
    addToast('Cài đặt', `Đã ${checked ? 'bật' : 'tắt'} nhắc nhở hóa đơn định kỳ`, 'info');
  };

  const handleResetData = async () => {
    if (!window.confirm('CẢNH BÁO: Thao tác này sẽ xóa toàn bộ giao dịch, ngân sách và mục tiêu tiết kiệm. Bạn có chắc chắn muốn làm mới dữ liệu?')) {
      return;
    }
    try {
      await api.auth.resetData();
      onResetData();
      addToast('Thành công', 'Dữ liệu đã được làm mới thành công', 'success');
    } catch (err: any) {
      addToast('Lỗi', err.message || 'Không thể xóa dữ liệu', 'error');
    }
  };

  const handleReloadDemo = async () => {
    if (!window.confirm('Bạn có muốn nạp lại bộ dữ liệu mẫu tài chính đầy đủ?')) return;
    try {
      await demoLogin();
      onResetData();
      addToast('Thành công', 'Đã nạp lại dữ liệu tài chính mẫu chuẩn', 'success');
    } catch (err: any) {
      addToast('Lỗi', err.message || 'Không thể nạp dữ liệu mẫu', 'error');
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t('set.title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Quản lý tài khoản cá nhân, đơn vị tiền tệ, bảo mật và sao lưu dữ liệu
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Thông tin cá nhân</h3>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email tài khoản
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mục tiêu thu nhập mong muốn mỗi tháng ({currency})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={monthlyIncomeTarget}
              onChange={(e) => setMonthlyIncomeTarget(e.target.value)}
              placeholder="VD: 30000000"
              className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{isUpdating ? 'Đang lưu...' : 'Cập nhật hồ sơ'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Preferences Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Coins className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Tùy chọn hiển thị & Ngôn ngữ</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đơn vị tiền tệ hiển thị
            </label>
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
            >
              <option value="VND">₫ Việt Nam Đồng (VND)</option>
              <option value="USD">$ Đô la Mỹ (USD)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ngôn ngữ giao diện
            </label>
            <select
              value={language}
              onChange={(e: any) => setLanguage(e.target.value)}
              className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
            >
              <option value="vi">Tiếng Việt (Mặc định)</option>
              <option value="en">English (US)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Bell className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Cài đặt thông báo</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-800">Cảnh báo vượt hạn mức ngân sách</p>
              <p className="text-[11px] text-slate-500">Nhận thông báo khi chi tiêu danh mục chạm ngưỡng 80% hoặc 100%</p>
            </div>
            <input
              type="checkbox"
              checked={budgetAlerts}
              onChange={(e) => handleToggleBudgetAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-800">Nhắc nhở hóa đơn định kỳ</p>
              <p className="text-[11px] text-slate-500">Nhận cảnh báo khi các khoản định kỳ sắp đến ngày hạn thanh toán</p>
            </div>
            <input
              type="checkbox"
              checked={billReminders}
              onChange={(e) => handleToggleBillReminders(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Password Security */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Lock className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Đổi mật khẩu</h3>
        </div>

        {passwordError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu hiện tại *
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              required
              className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu mới *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
              minLength={6}
              className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Xác nhận mật khẩu mới *
            </label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
              minLength={6}
              className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPass}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>{isChangingPass ? 'Đang xử lý...' : 'Đổi mật khẩu'}</span>
          </button>
        </form>
      </div>

      {/* Data & Backup */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Dữ liệu & Quản lý</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Quản trị dữ liệu tài chính của bạn. Bạn có thể xóa toàn bộ dữ liệu để thiết lập lại từ đầu, hoặc nạp lại bộ dữ liệu mẫu chuẩn bất kỳ lúc nào để trải nghiệm toàn diện hệ thống.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleReloadDemo}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Nạp lại dữ liệu mẫu (Seed Data)</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Xóa toàn bộ dữ liệu (Reset Data)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
