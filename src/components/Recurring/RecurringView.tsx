import React, { useState, useEffect } from 'react';
import {
  Plus,
  Repeat,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  X,
  CreditCard,
  BellRing,
  ArrowRight
} from 'lucide-react';
import { IRecurringPayment } from '../../types';
import { RecurringTable } from './RecurringTable';
import { api } from '../../services/api';
import { CATEGORIES, formatCurrency, getCategoryById } from '../../utils/categories';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { CategoryIcon } from '../common/CategoryIcon';

interface RecurringViewProps {
  currency: string;
  refreshTrigger: number;
  onRecurringUpdated: () => void;
}

export const RecurringView: React.FC<RecurringViewProps> = ({
  currency,
  refreshTrigger,
  onRecurringUpdated
}) => {
  const { t, language } = useLanguage();
  const { addToast, refreshNotifications } = useNotification();

  const [bills, setBills] = useState<IRecurringPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<IRecurringPayment | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [category, setCategory] = useState('bills');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [reminderDays, setReminderDays] = useState(3);
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pay Modal
  const [payingBill, setPayingBill] = useState<IRecurringPayment | null>(null);
  const [recordTransaction, setRecordTransaction] = useState(true);

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      const data = await api.recurring.getAll();
      setBills(data);
    } catch (err) {
      console.error('Error loading recurring bills:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [refreshTrigger]);

  const openCreateModal = () => {
    setEditingBill(null);
    setTitle('');
    setAmount('');
    setCategory('bills');
    setFrequency('monthly');
    const d = new Date();
    d.setDate(d.getDate() + 5);
    setNextDueDate(d.toISOString().split('T')[0]);
    setReminderDays(3);
    setNotes('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: IRecurringPayment) => {
    setEditingBill(b);
    setTitle(b.title);
    setAmount(b.amount);
    setCategory(b.category);
    setFrequency(b.frequency);
    setNextDueDate(b.nextDueDate);
    setReminderDays(b.reminderDaysBefore ?? b.reminderDays ?? 3);
    setNotes(b.notes || '');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setModalError('Số tiền hóa đơn phải lớn hơn 0');
      return;
    }
    if (!title.trim()) {
      setModalError('Vui lòng nhập tên hóa đơn/khoản thanh toán');
      return;
    }
    if (!nextDueDate) {
      setModalError('Vui lòng chọn ngày đến hạn');
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      if (editingBill) {
        await api.recurring.update(editingBill._id, {
          title: title.trim(),
          amount: numAmount,
          category,
          frequency,
          nextDueDate,
          reminderDaysBefore: reminderDays,
          notes
        });
        addToast('Thành công', 'Đã cập nhật lịch thanh toán', 'success');
      } else {
        await api.recurring.create({
          title: title.trim(),
          amount: numAmount,
          category,
          frequency,
          nextDueDate,
          reminderDaysBefore: reminderDays,
          notes,
          status: 'active'
        });
        addToast('Thành công', 'Đã thêm nhắc nhở định kỳ', 'success');
      }
      setIsModalOpen(false);
      fetchBills();
      onRecurringUpdated();
      refreshNotifications();
    } catch (err: any) {
      setModalError(err.message || 'Lỗi lưu dữ liệu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPay = async () => {
    if (!payingBill) return;
    try {
      await api.recurring.markPaid(payingBill._id, { recordTransaction });
      addToast('Thành công', `Đã xác nhận thanh toán "${payingBill.title}"`, 'success');
      setPayingBill(null);
      fetchBills();
      onRecurringUpdated();
      refreshNotifications();
    } catch (err: any) {
      addToast('Lỗi', err.message || 'Lỗi xử lý', 'error');
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch thanh toán định kỳ này?')) return;
    try {
      await api.recurring.delete(id);
      addToast('Thành công', 'Đã xóa khoản thanh toán', 'success');
      fetchBills();
      onRecurringUpdated();
      refreshNotifications();
    } catch (err: any) {
      addToast('Lỗi', err.message || 'Xóa thất bại', 'error');
    }
  };

  const dueSoonOrOverdueCount = bills.filter(b => b.isDueSoon || b.isOverdue).length;
  const paidThisMonthCount = bills.filter(b => {
    if (!b.lastPaidDate) return false;
    const date = new Date(b.lastPaidDate);
    const today = new Date();
    return !Number.isNaN(date.getTime()) && date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
  }).length;
  const categories: string[] = Array.from(
    new Set<string>(bills.map(b => String(b.category ?? '')).filter(Boolean))
  ).sort();
  const visibleBills = bills.filter(b => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('vi');
    const matchesQuery = !normalizedQuery || [b.title, b.notes || '', getCategoryById(b.category).labelVi].some(value => value.toLocaleLowerCase('vi').includes(normalizedQuery));
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'overdue' && b.isOverdue) || (statusFilter === 'due' && b.isDueSoon && !b.isOverdue) || (statusFilter === 'normal' && !b.isDueSoon && !b.isOverdue);
    return matchesQuery && matchesCategory && matchesStatus;
  });

  return (
    <div className="ft-page ft-recurring space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('rec.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('rec.subtitle')}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('rec.add_new')}</span>
        </button>
      </div>

      <div className="ft-summary-grid">
        <div className="ft-stat-card"><div className="ft-stat-icon bg-emerald-50 text-emerald-600"><Repeat className="w-5 h-5" /></div><div><p className="ft-stat-label">Tổng khoản định kỳ</p><strong className="ft-stat-value">{bills.length}</strong><p className="ft-stat-caption">khoản đã khai báo</p></div></div>
        <div className="ft-stat-card"><div className="ft-stat-icon bg-amber-50 text-amber-600"><Calendar className="w-5 h-5" /></div><div><p className="ft-stat-label">Đến hạn / Quá hạn</p><strong className="ft-stat-value">{dueSoonOrOverdueCount}</strong><p className="ft-stat-caption">khoản cần chú ý</p></div></div>
        <div className="ft-stat-card"><div className="ft-stat-icon bg-blue-50 text-blue-600"><CheckCircle2 className="w-5 h-5" /></div><div><p className="ft-stat-label">Đã thanh toán tháng này</p><strong className="ft-stat-value">{paidThisMonthCount}</strong><p className="ft-stat-caption">dựa trên ngày thanh toán gần nhất</p></div></div>
      </div>
      <div className="ft-filters" role="search" aria-label="Lọc khoản chi định kỳ">
        <input aria-label="Tìm khoản chi" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm theo tên, danh mục hoặc ghi chú..." />
        <select aria-label="Lọc danh mục" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option value="all">Tất cả danh mục</option>{categories.map(c => <option key={c} value={c}>{getCategoryById(c).labelVi}</option>)}</select>
        <select aria-label="Lọc trạng thái" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="overdue">Quá hạn</option><option value="due">Sắp đến hạn</option><option value="normal">Đang theo dõi</option></select>
      </div>

      {/* Reminder Alert Banner if any overdue or due soon */}
      {dueSoonOrOverdueCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
            <div>
              <p className="text-xs font-bold">
                Có {dueSoonOrOverdueCount} khoản thanh toán đang đến hạn hoặc quá hạn!
              </p>
              <p className="text-[11px] text-amber-700">
                Hãy kiểm tra và thanh toán đúng hạn để tránh phát sinh lãi phạt hoặc gián đoạn dịch vụ.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Một nguồn dữ liệu + một bộ handler cho cả bảng desktop và card mobile. */}
      {!isLoading && bills.length > 0 && visibleBills.length > 0 && (
        <RecurringTable bills={visibleBills} currency={currency} language={language}
          onPay={bill => { setPayingBill(bill); setRecordTransaction(true); }}
          onEdit={openEditModal} onDelete={handleDeleteBill} />
      )}
      {!isLoading && bills.length > 0 && visibleBills.length === 0 && (
        <div className="ft-empty-filter">Không có khoản chi định kỳ nào phù hợp bộ lọc. <button type="button" onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setStatusFilter('all'); }} className="text-emerald-700 font-semibold underline underline-offset-2">Xóa bộ lọc</button></div>
      )}
      {/* Bills Grid / List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">{t('common.loading')}</p>
        </div>
      ) : bills.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          <Repeat className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-600" />
          <p className="text-sm font-bold text-slate-700">{t('rec.no_bills')}</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            {t('rec.add_new')}
          </button>
        </div>
      ) : (
        <div className="ft-recurring-list grid grid-cols-1 lg:hidden gap-4">
          {visibleBills.map((bill) => {
            const cat = getCategoryById(bill.category);
            const isOverdue = bill.isOverdue;
            const isDueSoon = bill.isDueSoon;

            const freqLabels = {
              daily: 'Hàng ngày',
              weekly: 'Hàng tuần',
              monthly: 'Hàng tháng',
              yearly: 'Hàng năm'
            };

            return (
              <div
                key={bill._id}
                className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                  isOverdue
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isDueSoon
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CategoryIcon categoryId={bill.category} className="w-10 h-10" size={20} />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{bill.title}</h4>
                        <span className="text-[11px] text-slate-400 block font-medium">
                          {freqLabels[bill.frequency]} • {language === 'vi' ? cat.labelVi : cat.labelEn}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                        isOverdue
                          ? 'bg-rose-100 text-rose-700'
                          : isDueSoon
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isOverdue ? 'Đã quá hạn' : isDueSoon ? 'Sắp đến hạn' : 'Đang theo dõi'}
                    </span>
                  </div>

                  {/* Amount & Due Date */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Số tiền định kỳ:</span>
                      <strong className="text-slate-900 text-sm font-black">
                        {formatCurrency(bill.amount, currency)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Hạn tiếp theo:
                      </span>
                      <strong className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                        {bill.nextDueDate}
                      </strong>
                    </div>
                  </div>

                  {bill.lastPaidDate && (
                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Thanh toán gần nhất: {bill.lastPaidDate}</span>
                    </p>
                  )}

                  {bill.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-1.5 line-clamp-2">
                      &quot;{bill.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setPayingBill(bill);
                      setRecordTransaction(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('rec.mark_paid')}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(bill)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
                      title="Sửa"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBill(bill._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Pay Confirmation Modal */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base mb-2">
              Xác nhận thanh toán
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Thanh toán hóa đơn <strong>{payingBill.title}</strong> với số tiền{' '}
              <strong className="text-emerald-700">{formatCurrency(payingBill.amount, currency)}</strong>?
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordTransaction}
                  onChange={(e) => setRecordTransaction(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Tự động lưu vào sổ chi tiêu tháng này
                </span>
              </label>
            </div>

            <p className="text-[11px] text-slate-400 mb-5">
              Sau khi xác nhận, ngày hạn tiếp theo sẽ được tự động lùi sang chu kỳ sau.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setPayingBill(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmPay}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                Đã thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Bill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingBill ? 'Chỉnh sửa khoản định kỳ' : 'Thêm khoản thanh toán định kỳ'}
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

            <form onSubmit={handleSaveBill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên khoản thanh toán *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Tiền điện, Tiền internet, Tiền nhà, Netflix..."
                  required
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số tiền ({currency}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="VD: 500000"
                    required
                    className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chu kỳ lặp lại
                  </label>
                  <select
                    value={frequency}
                    onChange={(e: any) => setFrequency(e.target.value)}
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
                  >
                    <option value="monthly">Hàng tháng</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="yearly">Hàng năm</option>
                    <option value="daily">Hàng ngày</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Danh mục
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.filter(c => c.type === 'expense' || c.type === 'both').map((c) => (
                      <option key={c.id} value={c.id}>
                        {language === 'vi' ? c.labelVi : c.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày đến hạn tới *
                  </label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    required
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nhắc trước bao nhiêu ngày?
                </label>
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(Number(e.target.value))}
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
                >
                  <option value={1}>1 ngày trước hạn</option>
                  <option value={3}>3 ngày trước hạn (Khuyên dùng)</option>
                  <option value={5}>5 ngày trước hạn</option>
                  <option value={7}>7 ngày trước hạn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mã khách hàng, hợp đồng, chi nhánh..."
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

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
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
