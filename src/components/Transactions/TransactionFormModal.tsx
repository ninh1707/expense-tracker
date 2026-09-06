import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Calendar,
  CreditCard,
  Tag,
  Check
} from 'lucide-react';
import { ITransaction, TransactionType } from '../../types';
import { CATEGORIES, PAYMENT_METHODS } from '../../utils/categories';
import { useLanguage } from '../../contexts/LanguageContext';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Partial<ITransaction>) => Promise<void>;
  initialData?: ITransaction | null;
  currency: string;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currency
}) => {
  const { t, language } = useLanguage();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number | string>('');
  const [category, setCategory] = useState<string>('food');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount);
      setCategory(initialData.category);
      setDate(initialData.date);
      setDescription(initialData.description || '');
      setPaymentMethod(initialData.paymentMethod || 'bank_transfer');
      setTagsInput(initialData.tags?.join(', ') || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory('food');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setPaymentMethod('bank_transfer');
      setTagsInput('');
    }
    setError('');
  }, [initialData, isOpen]);

  // If type changes, ensure valid default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income' && category === 'food') {
      setCategory('salary');
    } else if (newType === 'expense' && (category === 'salary' || category === 'freelance')) {
      setCategory('food');
    }
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = Number(amount) || 0;
    setAmount(current + addValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError(language === 'vi' ? 'Vui lòng nhập số tiền hợp lệ (> 0)' : 'Please enter a valid amount (> 0)');
      return;
    }
    if (!category) {
      setError(language === 'vi' ? 'Vui lòng chọn danh mục' : 'Please select a category');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    setError('');
    try {
      await onSave({
        type,
        amount: numAmount,
        category,
        date,
        description: description.trim(),
        paymentMethod,
        tags
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu giao dịch');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = CATEGORIES.filter(c => c.type === 'both' || c.type === type);

  return (
    <div
      id="transaction-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="transaction-modal-card"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <span>{initialData ? t('tx.edit') : t('tx.add_new')}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              id="tx-type-expense-btn"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>{t('tx.filter_expense')}</span>
            </button>
            <button
              type="button"
              id="tx-type-income-btn"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{t('tx.filter_income')}</span>
            </button>
          </div>

          {/* Amount input & presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('tx.amount')} ({currency}) *
            </label>
            <div className="relative">
              <input
                id="tx-amount-input"
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                className="w-full text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                {currency}
              </span>
            </div>

            {/* Quick addition chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[50000, 100000, 200000, 500000, 1000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors"
                >
                  +{val >= 1000000 ? `${val / 1000000}tr` : `${val / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('tx.category')} *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
              {filteredCategories.map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full mb-1"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-[11px] leading-tight line-clamp-2">
                      {language === 'vi' ? c.labelVi : c.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('tx.date')}</span>
              </label>
              <input
                id="tx-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('tx.payment_method')}</span>
              </label>
              <select
                id="tx-payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-emerald-500 outline-none"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {language === 'vi' ? pm.labelVi : pm.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('tx.description')}
            </label>
            <input
              id="tx-description-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Cà phê sáng, Lương tháng 9, Mua quần áo..."
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Gắn thẻ (phân cách bằng dấu phẩy)</span>
            </label>
            <input
              id="tx-tags-input"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="VD: bạn bè, gia đình, công tác, dự án"
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              id="tx-submit-btn"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-semibold rounded-xl shadow-sm shadow-emerald-600/20 disabled:opacity-50 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? t('common.loading') : t('common.save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
