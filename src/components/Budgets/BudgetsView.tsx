import React, { useState, useEffect } from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit,
  PieChart as PieChartIcon,
  X,
  Check,
  ShieldAlert,
  BellRing
} from 'lucide-react';
import { IBudget } from '../../types';
import { api } from '../../services/api';
import { CATEGORIES, formatCurrency, getCategoryById } from '../../utils/categories';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';

interface BudgetsViewProps {
  currency: string;
  refreshTrigger: number;
  onBudgetUpdated: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  currency,
  refreshTrigger,
  onBudgetUpdated
}) => {
  const { t, language } = useLanguage();
  const { addToast, refreshNotifications } = useNotification();

  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<IBudget | null>(null);
  const [category, setCategory] = useState<string>('food');
  const [amount, setAmount] = useState<number | string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [notes, setNotes] = useState<string>('');
  const [modalError, setModalError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBudgets = async () => {
    setIsLoading(true);
    try {
      const data = await api.budgets.getAll(selectedMonth);
      setBudgets(data);
    } catch (err) {
      console.error('Error loading budgets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, refreshTrigger]);

  const openCreateModal = () => {
    setEditingBudget(null);
    setCategory('food');
    setAmount('');
    setAlertThreshold(80);
    setNotes('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: IBudget) => {
    setEditingBudget(b);
    setCategory(b.category);
    setAmount(b.amount);
    setAlertThreshold(b.alertThreshold || 80);
    setNotes(b.notes || '');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setModalError('Hạn mức ngân sách phải lớn hơn 0');
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      if (editingBudget) {
        await api.budgets.update(editingBudget._id, {
          amount: numAmount,
          alertThreshold,
          notes
        });
        addToast('Thành công', 'Đã cập nhật ngân sách', 'success');
      } else {
        await api.budgets.create({
          category,
          amount: numAmount,
          month: selectedMonth,
          alertThreshold,
          notes,
          period: 'monthly'
        });
        addToast('Thành công', 'Đã tạo ngân sách mới', 'success');
      }
      setIsModalOpen(false);
      fetchBudgets();
      onBudgetUpdated();
      refreshNotifications();
    } catch (err: any) {
      setModalError(err.message || 'Lỗi lưu ngân sách');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ngân sách này?')) return;
    try {
      await api.budgets.delete(id);
      addToast('Thành công', 'Đã xóa ngân sách', 'success');
      fetchBudgets();
      onBudgetUpdated();
      refreshNotifications();
    } catch (err: any) {
      addToast('Lỗi', err.message || 'Xóa ngân sách thất bại', 'error');
    }
  };

  // Aggregated totals
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const overallPercentage = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('bgt.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('bgt.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-emerald-500"
          />

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('bgt.add_new')}</span>
          </button>
        </div>
      </div>

      {/* Monthly Budget Summary Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Tổng ngân sách tháng {selectedMonth}
            </h3>
            <p className="text-xs text-slate-500">
              Đã chi {formatCurrency(totalSpent, currency)} / {formatCurrency(totalBudgeted, currency)}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`text-2xl font-black ${
                overallPercentage >= 100
                  ? 'text-rose-600'
                  : overallPercentage >= 80
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {overallPercentage}%
            </span>
            <span className="text-xs text-slate-400 block font-medium">Hạn mức đã dùng</span>
          </div>
        </div>

        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercentage >= 100
                ? 'bg-rose-500'
                : overallPercentage >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-slate-600 font-semibold mt-2.5">
          <span>Còn lại: {formatCurrency(Math.max(0, totalBudgeted - totalSpent), currency)}</span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            Hệ thống tự động cảnh báo khi chi tiêu đạt ngưỡng
          </span>
        </div>
      </div>

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">{t('common.loading')}</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          <PieChartIcon className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-600" />
          <p className="text-sm font-bold text-slate-700">{t('bgt.no_budgets')}</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            {t('bgt.add_new')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const cat = getCategoryById(b.category);
            const percent = b.percentage || 0;
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b._id}
                className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                  isExceeded
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isWarning
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar: Icon, Name & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.labelVi.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {language === 'vi' ? cat.labelVi : cat.labelEn}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          Cảnh báo ở mức {b.alertThreshold}%
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                        isExceeded
                          ? 'bg-rose-100 text-rose-700'
                          : isWarning
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isExceeded ? (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>Vượt {percent - 100}%</span>
                        </>
                      ) : isWarning ? (
                        <>
                          <BellRing className="w-3 h-3" />
                          <span>Cảnh báo</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>An toàn</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Numbers */}
                  <div className="flex items-baseline justify-between text-xs mt-3 mb-1.5">
                    <span className="text-slate-500">
                      Đã chi: <strong className="text-slate-900">{formatCurrency(b.spent || 0, currency)}</strong>
                    </span>
                    <span className="text-slate-500">
                      Hạn mức: <strong className="text-slate-900">{formatCurrency(b.amount, currency)}</strong>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>

                  {/* Remaining / Exceeded text */}
                  <p className="text-[11px] font-medium mt-2">
                    {isExceeded ? (
                      <span className="text-rose-600">
                        Đã vượt quá hạn mức {formatCurrency(Math.abs((b.remaining || 0)), currency)}
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Còn lại có thể chi:{' '}
                        <strong className="text-emerald-700">
                          {formatCurrency(b.remaining || 0, currency)}
                        </strong>
                      </span>
                    )}
                  </p>

                  {b.notes && (
                    <p className="text-[11px] text-slate-400 italic mt-2 line-clamp-2">
                      &quot;{b.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 pt-3 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(b._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingBudget ? 'Chỉnh sửa ngân sách' : 'Thiết lập ngân sách mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveBudget} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Danh mục chi tiêu *
                </label>
                <select
                  value={category}
                  disabled={!!editingBudget}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 disabled:opacity-60"
                >
                  {CATEGORIES.filter(c => c.type === 'expense' || c.type === 'both').map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'vi' ? c.labelVi : c.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hạn mức ngân sách ({currency}) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="VD: 3000000"
                  required
                  className="w-full text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Alert threshold */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Ngưỡng thông báo nhắc nhở</span>
                  <span className="text-emerald-700 font-bold">{alertThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Hệ thống sẽ gửi cảnh báo khi chi tiêu danh mục này đạt đến {alertThreshold}% hạn mức.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú mục tiêu
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Tiết kiệm để cuối năm mua xe"
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? t('common.loading') : t('common.save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
