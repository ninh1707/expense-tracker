import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  TrendingDown,
  TrendingUp,
  Calendar,
  CreditCard,
  Tag,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import { ITransaction, TransactionType } from '../../types';
import { api } from '../../services/api';
import { CATEGORIES, PAYMENT_METHODS, formatCurrency, getCategoryById } from '../../utils/categories';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';

interface TransactionsViewProps {
  currency: string;
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: ITransaction) => void;
  refreshTrigger: number;
  onTransactionsUpdated: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  currency,
  onOpenNewTransaction,
  onEditTransaction,
  refreshTrigger,
  onTransactionsUpdated
}) => {
  const { t, language } = useLanguage();
  const { addToast } = useNotification();

  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (paymentFilter !== 'all') params.paymentMethod = paymentFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await api.transactions.getAll(params);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, paymentFilter, startDate, endDate, refreshTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    try {
      await api.transactions.delete(id);
      addToast(t('common.success'), t('tx.delete_success'), 'success');
      setDeletingId(null);
      fetchTransactions();
      onTransactionsUpdated();
    } catch (err: any) {
      addToast(t('common.error'), err.message || 'Lỗi khi xóa', 'error');
    }
  };

  // Filter calculations
  const totalFilteredIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netFiltered = totalFilteredIncome - totalFilteredExpense;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('tx.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('tx.subtitle')}
          </p>
        </div>

        <button
          onClick={onOpenNewTransaction}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('tx.add_new')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('tx.search_placeholder')}
              className="w-full pl-9.5 pr-4 py-2 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition-colors ${
                showAdvancedFilters
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bộ lọc nâng cao</span>
            </button>
          </div>
        </form>

        {/* Quick Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-500 mr-1">Loại:</span>
          {[
            { id: 'all', label: t('tx.filter_all') },
            { id: 'income', label: t('tx.filter_income') },
            { id: 'expense', label: t('tx.filter_expense') }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTypeFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                typeFilter === item.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {t('tx.category')}
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
              >
                <option value="all">{t('tx.all_categories')}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'vi' ? cat.labelVi : cat.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {t('tx.payment_method')}
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
              >
                <option value="all">Tất cả phương thức</option>
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {language === 'vi' ? pm.labelVi : pm.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-emerald-950 text-white shadow-sm">
        <div>
          <span className="text-[11px] text-emerald-300 font-medium block">Tổng thu (theo bộ lọc)</span>
          <p className="text-base font-bold text-emerald-400 mt-0.5">
            +{formatCurrency(totalFilteredIncome, currency)}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-rose-300 font-medium block">Tổng chi (theo bộ lọc)</span>
          <p className="text-base font-bold text-rose-400 mt-0.5">
            -{formatCurrency(totalFilteredExpense, currency)}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-slate-300 font-medium block">Chênh lệch ròng</span>
          <p className="text-base font-bold text-white mt-0.5">
            {formatCurrency(netFiltered, currency)}
          </p>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">{t('common.loading')}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-600">{t('tx.no_results')}</p>
            <p className="text-xs text-slate-400 mt-1">Hãy thử xóa bớt điều kiện lọc hoặc tạo giao dịch mới</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">{t('tx.date')}</th>
                  <th className="py-3 px-4">{t('tx.category')}</th>
                  <th className="py-3 px-4">{t('tx.description')}</th>
                  <th className="py-3 px-4">{t('tx.payment_method')}</th>
                  <th className="py-3 px-4 text-right">{t('tx.amount')}</th>
                  <th className="py-3 px-4 sm:px-6 text-center">{t('tx.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transactions.map((tx) => {
                  const cat = getCategoryById(tx.category);
                  const isIncome = tx.type === 'income';

                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-600 whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: cat.bgColor, color: cat.color }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          {language === 'vi' ? cat.labelVi : cat.labelEn}
                        </span>
                      </td>

                      {/* Description & Tags */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate">
                          {tx.description || (language === 'vi' ? cat.labelVi : cat.labelEn)}
                        </p>
                        {tx.tags && tx.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tx.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {PAYMENT_METHODS.find(p => p.id === tx.paymentMethod)?.labelVi || tx.paymentMethod}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-black">
                        <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title={t('common.edit')}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(tx._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h4 className="font-bold text-slate-900 text-base mb-2">
              Xác nhận xóa giao dịch
            </h4>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              {t('tx.delete_confirm')}
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
