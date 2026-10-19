import React, { useState, useEffect } from 'react';
import {
  Plus,
  Target,
  PiggyBank,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit,
  X,
  Sparkles,
  History
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ISavingsGoal } from '../../types';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/categories';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';

interface SavingsViewProps {
  currency: string;
  refreshTrigger: number;
  onGoalUpdated: () => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  currency,
  refreshTrigger,
  onGoalUpdated
}) => {
  const { t } = useLanguage();
  const { addToast } = useNotification();

  const [goals, setGoals] = useState<ISavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [goalFilter, setGoalFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ISavingsGoal | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | string>('');
  const [currentAmount, setCurrentAmount] = useState<number | string>('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('emergency');
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deposit/Withdraw modal
  const [activeActionGoal, setActiveActionGoal] = useState<ISavingsGoal | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [actionAmount, setActionAmount] = useState<number | string>('');
  const [actionNote, setActionNote] = useState('');
  const [recordTransaction, setRecordTransaction] = useState(true);
  const [actionError, setActionError] = useState('');

  // History viewer modal
  const [historyGoal, setHistoryGoal] = useState<ISavingsGoal | null>(null);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const data = await api.savings.getAll();
      setGoals(data);
    } catch (err) {
      console.error('Error loading savings goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [refreshTrigger]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline(new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setCategory('emergency');
    setNotes('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (g: ISavingsGoal) => {
    setEditingGoal(g);
    setName(g.name);
    setTargetAmount(g.targetAmount);
    setCurrentAmount(g.currentAmount);
    setDeadline(g.deadline);
    setCategory(g.category);
    setNotes(g.notes || '');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = Number(targetAmount);
    if (!numTarget || numTarget <= 0) {
      setModalError('Mục tiêu tiền phải lớn hơn 0');
      return;
    }
    if (!name.trim()) {
      setModalError('Vui lòng nhập tên mục tiêu');
      return;
    }
    if (!deadline) {
      setModalError('Vui lòng chọn hạn chót');
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      if (editingGoal) {
        await api.savings.update(editingGoal._id, {
          name: name.trim(),
          targetAmount: numTarget,
          deadline,
          category,
          notes
        });
        addToast('Thành công', 'Đã cập nhật mục tiêu', 'success');
      } else {
        await api.savings.create({
          name: name.trim(),
          targetAmount: numTarget,
          currentAmount: Number(currentAmount) || 0,
          deadline,
          category,
          notes
        });
        addToast('Thành công', 'Đã khởi tạo mục tiêu tiết kiệm mới', 'success');
      }
      setIsModalOpen(false);
      fetchGoals();
      onGoalUpdated();
    } catch (err: any) {
      setModalError(err.message || 'Lỗi khi lưu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepositWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionGoal) return;
    const amt = Number(actionAmount);
    if (!amt || amt <= 0) {
      setActionError('Số tiền phải lớn hơn 0');
      return;
    }
    if (actionType === 'withdraw' && amt > activeActionGoal.currentAmount) {
      setActionError('Số tiền rút vượt quá số tiền hiện có trong quỹ');
      return;
    }

    setActionError('');
    try {
      const updated = await api.savings.action(activeActionGoal._id, {
        amount: amt,
        type: actionType,
        note: actionNote.trim(),
        recordTransaction
      });

      // Celebration confetti if reached goal!
      if (updated.isCompleted && actionType === 'deposit') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        addToast('🎉 Xuất sắc!', `Bạn đã hoàn thành 100% mục tiêu "${activeActionGoal.name}"!`, 'success');
      } else {
        addToast(
          'Thành công',
          actionType === 'deposit' ? 'Đã thêm tiền vào mục tiêu' : 'Đã rút tiền từ mục tiêu',
          'success'
        );
      }

      setActiveActionGoal(null);
      setActionAmount('');
      setActionNote('');
      fetchGoals();
      onGoalUpdated();
    } catch (err: any) {
      setActionError(err.message || 'Thao tác thất bại');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa mục tiêu này?')) return;
    try {
      await api.savings.delete(id);
      addToast('Thành công', 'Đã xóa mục tiêu', 'success');
      fetchGoals();
      onGoalUpdated();
    } catch (err: any) {
      addToast('Lỗi', err.message || 'Lỗi xóa', 'error');
    }
  };

  const totalAccumulated = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const nearlyCompletedCount = goals.filter(g => !g.isCompleted && (g.daysRemaining ?? 9999) >= 0 && (g.daysRemaining ?? 9999) <= 30).length;
  const totalPercent = totalTarget > 0 ? Math.min(100, Math.round(totalAccumulated / totalTarget * 100)) : 0;
  const activeGoals = goals.filter(g => !g.isCompleted && (g.percentage ?? 0) < 100);
  const completedGoals = goals.filter(g => g.isCompleted || (g.percentage ?? 0) >= 100);
  const visibleGoals = goalFilter === 'all' ? goals : goalFilter === 'completed' ? completedGoals : activeGoals;

  return (
    <div className="ft-page ft-savings space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('svg.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('svg.subtitle')}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('svg.add_new')}</span>
        </button>
      </div>

      {/* Thống kê lấy trực tiếp từ dữ liệu API, không sử dụng số minh họa cố định. */}
      <div className="ft-summary-grid">
        <div className="ft-stat-card">
          <div className="ft-stat-icon bg-emerald-50 text-emerald-600"><Target className="w-5 h-5" /></div>
          <div><p className="ft-stat-label">Tổng mục tiêu</p><strong className="ft-stat-value">{goals.length}</strong><p className="ft-stat-caption">mục tiêu tiết kiệm</p></div>
        </div>
        <div className="ft-stat-card">
          <div className="ft-stat-icon bg-blue-50 text-blue-600"><PiggyBank className="w-5 h-5" /></div>
          <div><p className="ft-stat-label">Đã tiết kiệm</p><strong className="ft-stat-value">{formatCurrency(totalAccumulated, currency)}</strong><p className="ft-stat-caption">{totalPercent}% tổng số tiền mục tiêu</p></div>
        </div>
        <div className="ft-stat-card">
          <div className="ft-stat-icon bg-amber-50 text-amber-600"><Clock className="w-5 h-5" /></div>
          <div><p className="ft-stat-label">Sắp đến hạn</p><strong className="ft-stat-value">{nearlyCompletedCount}</strong><p className="ft-stat-caption">mục tiêu còn ≤ 30 ngày</p></div>
        </div>
      </div>
      <div className="ft-section-heading">
        <h3>Danh sách mục tiêu</h3>
        <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Lọc trạng thái mục tiêu tiết kiệm">
          {([
            ['all', `Tất cả (${goals.length})`],
            ['active', `Đang thực hiện (${activeGoals.length})`],
            ['completed', `Đã hoàn thành (${completedGoals.length})`]
          ] as const).map(([filter, title]) => (
            <button type="button" key={filter} onClick={() => setGoalFilter(filter)} aria-pressed={goalFilter === filter} className={`ft-filter-chip ${goalFilter === filter ? 'ft-filter-chip-active' : ''}`}>{title}</button>
          ))}
        </div>
      </div>

      {/* Goals Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">{t('common.loading')}</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          <PiggyBank className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-600" />
          <p className="text-sm font-bold text-slate-700">{t('svg.no_goals')}</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            {t('svg.add_new')}
          </button>
        </div>
      ) : visibleGoals.length === 0 ? (
        <div className="ft-panel p-8 text-center text-slate-500">Không có mục tiêu thuộc trạng thái đã chọn.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {visibleGoals.map((g) => {
            const percent = g.percentage || 0;
            const isCompleted = g.isCompleted || percent >= 100;

            return (
              <article key={g._id} className="ft-goal-card ft-panel p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(290px,.95fr)] gap-4 lg:gap-6 lg:items-center">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"><Target size={21} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-sm">{g.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{g.notes || 'Theo dõi tiến độ tiết kiệm của bạn'}</p>
                      </div>
                      {isCompleted && <span className="ft-status-pill ft-status-ok flex-shrink-0"><Sparkles size={12} className="inline mr-1" />Hoàn thành</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400"/>Hạn hoàn thành: <strong className="text-slate-800">{g.deadline?.split('-').reverse().join('/')}</strong></span>
                      <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-slate-400"/>Mục tiêu: <strong className="text-slate-800">{formatCurrency(g.targetAmount, currency)}</strong></span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <button type="button" onClick={() => setHistoryGoal(g)} className="inline-flex gap-1 text-xs text-slate-500 hover:text-emerald-700 items-center"><History size={13}/>Lịch sử ({g.history?.length || 0})</button>
                      <button type="button" onClick={() => handleDeleteGoal(g._id)} className="inline-flex gap-1 text-xs text-slate-400 hover:text-rose-600 items-center"><Trash2 size={13}/>Xóa mục tiêu</button>
                    </div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-end justify-between gap-3 mb-2">
                    <div><strong className="text-base text-emerald-600 font-extrabold">{formatCurrency(g.currentAmount, currency)}</strong><p className="text-xs text-slate-400">/{formatCurrency(g.targetAmount, currency)}</p></div>
                    <strong className="text-xs text-emerald-700">{Math.round(percent)}%</strong>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{width:`${Math.max(0, Math.min(100, percent))}%`}} /></div>
                  <div className="flex flex-wrap items-center justify-end gap-2 mt-3">
                    <button type="button" onClick={() => { setActiveActionGoal(g); setActionType('deposit'); setActionAmount(''); setActionNote(''); setActionError(''); }} className="ft-primary-button flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"><ArrowUpRight size={14}/>{t('svg.deposit')}</button>
                    <button type="button" onClick={() => openEditModal(g)} className="ft-secondary-button flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"><Edit size={14}/>Chỉnh sửa</button>
                    <button type="button" onClick={() => { setActiveActionGoal(g); setActionType('withdraw'); setActionAmount(''); setActionNote(''); setActionError(''); }} className="ft-secondary-button flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"><ArrowDownLeft size={14}/>{t('svg.withdraw')}</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Deposit / Withdraw Action Modal */}
      {activeActionGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {actionType === 'deposit' ? 'Gửi tiền vào mục tiêu' : 'Rút tiền từ quỹ'}
              </h3>
              <button
                onClick={() => setActiveActionGoal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl mb-4">
              Mục tiêu: {activeActionGoal.name} (Hiện có: {formatCurrency(activeActionGoal.currentAmount, currency)})
            </p>

            {actionError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
                {actionError}
              </div>
            )}

            <form onSubmit={handleDepositWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số tiền ({currency}) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full text-xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="VD: Trích từ lương tháng 9"
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recordTx"
                  checked={recordTransaction}
                  onChange={(e) => setRecordTransaction(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="recordTx" className="text-xs text-slate-600 cursor-pointer">
                  Tự động đồng bộ ghi nhận vào sổ giao dịch
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveActionGoal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingGoal ? 'Chỉnh sửa mục tiêu tiết kiệm' : 'Tạo mục tiêu tiết kiệm mới'}
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

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên mục tiêu *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Quỹ khẩn cấp, Mua xe máy, Du lịch Nhật Bản"
                  required
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số tiền mục tiêu ({currency}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="VD: 50000000"
                    required
                    className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số tiền ban đầu
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    disabled={!!editingGoal}
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hạn chót dự kiến *
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú mục tiêu
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kế hoạch trích 15% lương mỗi tháng..."
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

      {/* History Log Viewer Modal */}
      {historyGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Lịch sử tích lũy</h3>
                <p className="text-xs text-slate-500">{historyGoal.name}</p>
              </div>
              <button
                onClick={() => setHistoryGoal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
              {(!historyGoal.history || historyGoal.history.length === 0) ? (
                <p className="text-xs text-center text-slate-400 py-6">Chưa có lịch sử giao dịch quỹ</p>
              ) : (
                historyGoal.history.slice().reverse().map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {h.type === 'deposit' ? 'Gửi vào' : 'Rút ra'}
                      </span>
                      <span className="text-[10px] text-slate-400">{h.date} • {h.note || ''}</span>
                    </div>
                    <span
                      className={`font-black ${
                        h.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {h.type === 'deposit' ? '+' : '-'}{formatCurrency(h.amount, currency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
