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
  BellRing,
  Search,
  Filter,
  Wallet,
  TrendingUp,
  ListFilter
} from 'lucide-react';
import { IBudget } from '../../types';
import { api } from '../../services/api';
import { CATEGORIES, formatCurrency, getCategoryById } from '../../utils/categories';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { CategoryIcon } from '../common/CategoryIcon';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warning' | 'exceeded' | 'unused'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
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

  // Phần trình bày và bộ lọc dùng cùng dữ liệu API. Không sửa công thức ở backend.
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent ?? 0), 0);
  const remainingBudget = Math.max(0, totalBudgeted - totalSpent);
  const percentOf = (budget: IBudget) => budget.amount > 0 ? (budget.spent ?? 0) / budget.amount * 100 : 0;
  const warningsCount = budgets.filter(budget => percentOf(budget) >= (budget.alertThreshold || 80)).length;
  const selectableCategories: string[] = Array.from(
    new Set<string>(budgets.map(b => String(b.category ?? '')).filter(Boolean))
  );
  const filterOptions: { id: typeof statusFilter; title: string }[] = [
    { id: 'all', title: 'Tất cả' },
    { id: 'active', title: 'Đang chi tiêu' },
    { id: 'warning', title: 'Gần vượt' },
    { id: 'exceeded', title: 'Đã vượt' },
    { id: 'unused', title: 'Chưa sử dụng' }
  ];
  const visibleBudgets = budgets.filter(budget => {
    const percent = percentOf(budget);
    const spent = budget.spent ?? 0;
    const name = getCategoryById(budget.category);
    const q = searchQuery.trim().toLocaleLowerCase('vi');
    const matchesText = !q || [name.labelVi, name.labelEn, budget.notes ?? ''].some(text => text.toLocaleLowerCase('vi').includes(q));
    const matchesCategory = categoryFilter === 'all' || budget.category === categoryFilter;
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'active' && spent > 0 && percent < (budget.alertThreshold || 80))
      || (statusFilter === 'warning' && percent >= (budget.alertThreshold || 80) && percent < 100)
      || (statusFilter === 'exceeded' && percent >= 100)
      || (statusFilter === 'unused' && spent === 0);
    return matchesText && matchesCategory && matchesStatus;
  });

  return (
    <div className="ft-page ft-budgets space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Quản lý Ngân sách</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Lập kế hoạch chi tiêu và theo dõi ngân sách theo từng danh mục</p>
        </div>
        <button type="button" onClick={openCreateModal} className="ft-primary-button flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Thêm ngân sách mới
        </button>
      </div>

      {/* Thanh lọc và tìm kiếm giống ảnh tham khảo; tháng được gửi trực tiếp vào API. */}
      <section aria-label="Tìm kiếm và lọc ngân sách" className="ft-panel p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative flex-1 min-w-[210px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input aria-label="Tìm kiếm ngân sách" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm kiếm theo tên danh mục, ghi chú..." className="ft-search-input w-full pl-10 pr-3 py-2.5 text-sm" />
          </label>
          <button type="button" onClick={() => setShowAdvancedFilter(show => !show)} aria-expanded={showAdvancedFilter} className="ft-secondary-button flex items-center gap-2 px-3 py-2.5 text-xs font-semibold">
            <Filter className="w-4 h-4" /> Bộ lọc nâng cao
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Trạng thái ngân sách">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">Trạng thái:</span>
            {filterOptions.map(option => (
              <button type="button" key={option.id} onClick={() => setStatusFilter(option.id)} aria-pressed={statusFilter === option.id}
                className={`ft-filter-chip ${statusFilter === option.id ? 'ft-filter-chip-active' : ''}`}>
                {option.title}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline">Tháng</span>
            <input aria-label="Chọn tháng ngân sách" type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="ft-search-input px-3 py-2 text-xs font-semibold" />
          </label>
        </div>
        {showAdvancedFilter && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <ListFilter className="w-4 h-4 text-emerald-600" />
            <label htmlFor="budget-category-filter" className="text-xs font-semibold text-slate-600">Danh mục</label>
            <select id="budget-category-filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="ft-search-input min-w-[190px] px-3 py-2 text-xs">
              <option value="all">Tất cả danh mục</option>
              {selectableCategories.map(id => <option key={id} value={id}>{getCategoryById(id).labelVi}</option>)}
            </select>
            <button type="button" className="text-xs text-emerald-700 font-semibold px-3 py-2" onClick={() => {setSearchQuery(''); setCategoryFilter('all'); setStatusFilter('all');}}>Xóa bộ lọc</button>
          </div>
        )}
      </section>

      <div className="ft-budget-stats" aria-label="Tổng quan ngân sách">
        <div className="ft-budget-stat-card"><div><p className="ft-stat-label">TỔNG NGÂN SÁCH</p><strong className="ft-budget-value text-emerald-600">{formatCurrency(totalBudgeted, currency)}</strong><p className="ft-stat-caption">Trong tháng này</p></div><span className="ft-budget-stat-icon bg-emerald-50 text-emerald-600"><Wallet size={20}/></span></div>
        <div className="ft-budget-stat-card"><div><p className="ft-stat-label">ĐÃ SỬ DỤNG</p><strong className="ft-budget-value text-slate-900">{formatCurrency(totalSpent, currency)}</strong><p className="ft-stat-caption">{totalBudgeted ? (totalSpent / totalBudgeted * 100).toFixed(1).replace('.', ',') : '0'}% tổng ngân sách</p></div><span className="ft-budget-stat-icon bg-blue-50 text-blue-600"><PieChartIcon size={20}/></span></div>
        <div className="ft-budget-stat-card"><div><p className="ft-stat-label">CÒN LẠI</p><strong className="ft-budget-value text-emerald-600">{formatCurrency(remainingBudget, currency)}</strong><p className="ft-stat-caption">{totalBudgeted ? (remainingBudget / totalBudgeted * 100).toFixed(1).replace('.', ',') : '0'}% tổng ngân sách</p></div><span className="ft-budget-stat-icon bg-emerald-50 text-emerald-600"><TrendingUp size={20}/></span></div>
        <div className="ft-budget-stat-card"><div><p className="ft-stat-label">CẢNH BÁO</p><strong className={`ft-budget-value ${warningsCount ? 'text-orange-600' : 'text-slate-900'}`}>{warningsCount} danh mục</strong><p className="ft-stat-caption">Đạt ngưỡng cảnh báo</p></div><span className="ft-budget-stat-icon bg-amber-50 text-amber-600"><BellRing size={20}/></span></div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-500"><div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />{t('common.loading')}</div>
      ) : budgets.length === 0 ? (
        <div className="ft-panel p-12 text-center text-slate-500"><PieChartIcon className="w-11 h-11 mx-auto mb-3 text-emerald-600 opacity-50" /><p className="font-semibold">Chưa có ngân sách trong tháng này</p><button type="button" className="ft-primary-button mt-4 px-4 py-2.5 text-sm" onClick={openCreateModal}>Tạo ngân sách đầu tiên</button></div>
      ) : visibleBudgets.length === 0 ? (
        <div className="ft-panel p-8 text-center text-slate-500"><p className="font-semibold">Không có ngân sách khớp bộ lọc.</p><button type="button" onClick={() => {setSearchQuery('');setCategoryFilter('all');setStatusFilter('all');}} className="text-emerald-700 font-semibold mt-3 text-sm">Đặt lại bộ lọc</button></div>
      ) : (
        <div className="space-y-3">
          {visibleBudgets.map(budget => {
            const cat = getCategoryById(budget.category);
            const spent = budget.spent ?? 0;
            const percentage = percentOf(budget);
            const remaining = Math.max(0, budget.amount - spent);
            const exceeded = percentage >= 100;
            const warning = !exceeded && percentage >= (budget.alertThreshold || 80);
            return (
              <article key={budget._id} className="ft-budget-row ft-panel">
                <div className="ft-budget-row-heading">
                  <CategoryIcon categoryId={budget.category} className="ft-budget-category-icon" size={22} />
                  <div className="min-w-0"><h3 className="text-sm font-extrabold text-slate-900">{language === 'vi' ? cat.labelVi : cat.labelEn}</h3><p className="text-[11px] text-slate-400 mt-1">{budget.notes || `Cảnh báo khi sử dụng ${budget.alertThreshold || 80}% hạn mức`}</p></div>
                </div>
                <div className="ft-budget-row-values">
                  <div><span>Ngân sách</span><strong>{formatCurrency(budget.amount, currency)}</strong></div>
                  <div><span>Đã sử dụng</span><strong className={exceeded ? 'text-rose-600' : 'text-emerald-600'}>{formatCurrency(spent, currency)}</strong></div>
                  <div><span>Còn lại</span><strong className="text-emerald-600">{formatCurrency(remaining, currency)}</strong></div>
                </div>
                <div className="ft-budget-row-status">
                  <span className={`ft-status-pill ${exceeded ? 'ft-status-danger' : warning ? 'ft-status-warning' : 'ft-status-ok'}`}>
                    {exceeded ? `Đã vượt ${Math.max(0, Math.round(percentage - 100))}%` : warning ? 'Gần vượt' : 'Đang chi tiêu'}
                  </span>
                  <div className="flex gap-1"><button type="button" onClick={() => openEditModal(budget)} aria-label={`Sửa ngân sách ${cat.labelVi}`} className="ft-icon-button"><Edit size={15} /><span>Sửa</span></button><button type="button" onClick={() => handleDeleteBudget(budget._id)} aria-label={`Xóa ngân sách ${cat.labelVi}`} className="ft-icon-button hover:text-rose-600"><Trash2 size={15}/><span>Xóa</span></button></div>
                </div>
                <div className="ft-budget-row-progress">
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex-1"><div className={`h-full rounded-full transition-all ${exceeded || warning ? 'bg-rose-400' : 'bg-emerald-500'}`} style={{width:`${Math.max(0, Math.min(100, percentage))}%`}} /></div>
                  <span className="text-[11px] font-semibold text-slate-500">{Math.round(percentage)}%</span>
                </div>
              </article>
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
