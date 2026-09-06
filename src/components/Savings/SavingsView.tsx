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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
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

      {/* Savings Summary Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 rounded-3xl p-6 text-white shadow-lg shadow-teal-950/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-emerald-200 font-semibold uppercase tracking-wider block">
              Tổng tiền tích lũy hiện có
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">
              {formatCurrency(totalAccumulated, currency)}
            </h3>
            <p className="text-xs text-emerald-100/80 mt-1">
              Mục tiêu tổng: {formatCurrency(totalTarget, currency)} across {goals.length} mục tiêu
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
              <span className="text-2xl font-black block">
                {totalTarget > 0 ? Math.round((totalAccumulated / totalTarget) * 100) : 0}%
              </span>
              <span className="text-[11px] text-emerald-200">Tiến độ chung</span>
            </div>
          </div>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const percent = g.percentage || 0;
            const isCompleted = g.isCompleted || percent >= 100;

            return (
              <div
                key={g._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Top line: Name & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{g.name}</h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Hạn: {g.deadline}
                        </span>
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3 h-3" />
                        Đạt 100%
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                        {g.daysRemaining} ngày còn lại
                      </span>
                    )}
                  </div>

                  {/* Amounts */}
                  <div className="mt-3 mb-1.5 flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">
                      Tích lũy:{' '}
                      <strong className="text-emerald-700 font-extrabold text-sm">
                        {formatCurrency(g.currentAmount, currency)}
                      </strong>
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Mục tiêu: {formatCurrency(g.targetAmount, currency)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                    <span>Còn thiếu: {formatCurrency(Math.max(0, g.targetAmount - g.currentAmount), currency)}</span>
                    <span className="font-bold text-slate-800">{percent}%</span>
                  </div>

                  {g.notes && (
                    <p className="text-[11px] text-slate-400 italic mt-2 line-clamp-2">
                      &quot;{g.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Bottom Actions: Nạp/Rút & Lịch sử */}
                <div className="pt-3 mt-4 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setActiveActionGoal(g);
                        setActionType('deposit');
                        setActionAmount('');
                        setActionNote('');
                        setActionError('');
                      }}
                      className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('svg.deposit')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveActionGoal(g);
                        setActionType('withdraw');
                        setActionAmount('');
                        setActionNote('');
                        setActionError('');
                      }}
                      className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('svg.withdraw')}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                    <button
                      onClick={() => setHistoryGoal(g)}
                      className="flex items-center gap-1 hover:text-slate-700 text-[11px]"
                    >
                      <History className="w-3 h-3" />
                      <span>Lịch sử ({g.history?.length || 0})</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(g)}
                        className="hover:text-slate-700 p-1"
                        title="Sửa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(g._id)}
                        className="hover:text-rose-600 p-1"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
