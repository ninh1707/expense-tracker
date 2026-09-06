import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { DashboardSummary, IBudget, IRecurringPayment, AppTab } from '../../types';
import { api } from '../../services/api';
import { formatCurrency, getCategoryById } from '../../utils/categories';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardViewProps {
  currency: string;
  onNavigateTab: (tab: AppTab) => void;
  onOpenNewTransaction: () => void;
  refreshTrigger: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currency,
  onNavigateTab,
  onOpenNewTransaction,
  refreshTrigger
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [recurringBills, setRecurringBills] = useState<IRecurringPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [sumData, bgtData, recData] = await Promise.all([
        api.transactions.getSummary(),
        api.budgets.getAll(),
        api.recurring.getAll()
      ]);
      setSummary(sumData);
      setBudgets(bgtData);
      setRecurringBills(recData.filter(r => r.status === 'active' && (r.isDueSoon || r.isOverdue)));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [refreshTrigger]);

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const categoryChartData = summary?.categoryBreakdown?.map(item => {
    const cat = getCategoryById(item.category);
    return {
      name: language === 'vi' ? cat.labelVi : cat.labelEn,
      value: item.amount,
      color: cat.color,
      percentage: item.percentage
    };
  }) || [];

  const trendData = summary?.monthlyTrend?.map(m => ({
    name: m.month,
    Thu: m.income,
    Chi: m.expense,
    'Số dư': m.balance
  })) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-950/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/50 text-emerald-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tháng {summary?.month || new Date().toISOString().substring(0, 7)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('dash.welcome')} {user?.name || 'Bạn'}!
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-xl">
            {t('dash.welcome_sub')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewTransaction}
            className="bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow transition-all active:scale-95"
          >
            + {t('nav.add_transaction')}
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('dash.total_income')}
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              +{formatCurrency(summary?.totalIncome || 0, currency)}
            </h3>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Tháng này</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('dash.total_expense')}
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
              -{formatCurrency(summary?.totalExpense || 0, currency)}
            </h3>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {summary?.transactionCount || 0} giao dịch
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('dash.net_balance')}
            </p>
            <h3
              className={`text-xl sm:text-2xl font-black mt-1 ${
                (summary?.netBalance || 0) >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatCurrency(summary?.netBalance || 0, currency)}
            </h3>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Thu nhập trừ Chi tiêu</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('dash.savings_rate')}
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
              {summary?.savingsRate || 0}%
            </h3>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {(summary?.savingsRate || 0) >= 20 ? 'Rất tốt (≥ 20%)' : 'Cần tối ưu thêm'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {t('dash.trend_title')}
              </h3>
              <p className="text-xs text-slate-500">So sánh biến động tài chính theo thời gian</p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <span>{t('dash.view_all')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => (val >= 1000000 ? `${val / 1000000}tr` : `${val / 1000}k`)}
                />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val), currency)}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Thu" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="Chi" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {t('dash.category_title')}
            </h3>
            <p className="text-xs text-slate-500 mb-2">Tỷ lệ phân bổ chi phí</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), currency)}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Chưa có chi tiêu tháng này</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {categoryChartData.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-700 truncate font-medium">{c.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900">{c.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Budgets, Bills & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Budgets Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {t('dash.budget_overview')}
            </h3>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <span>{t('dash.view_all')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {budgets.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs">Chưa thiết lập ngân sách</p>
              </div>
            ) : (
              budgets.slice(0, 3).map((b) => {
                const cat = getCategoryById(b.category);
                const percent = b.percentage || 0;
                const isExceeded = b.status === 'exceeded';
                const isWarning = b.status === 'warning';

                return (
                  <div key={b._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">
                        {language === 'vi' ? cat.labelVi : cat.labelEn}
                      </span>
                      <span
                        className={`font-extrabold ${
                          isExceeded
                            ? 'text-rose-600'
                            : isWarning
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {percent}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isExceeded
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>Đã chi: {formatCurrency(b.spent || 0, currency)}</span>
                      <span>Hạn mức: {formatCurrency(b.amount, currency)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Bills Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {t('dash.upcoming_bills')}
            </h3>
            <button
              onClick={() => onNavigateTab('recurring')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <span>{t('dash.view_all')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recurringBills.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
                <p className="text-xs">Không có hóa đơn sắp đến hạn</p>
              </div>
            ) : (
              recurringBills.slice(0, 3).map((r) => (
                <div
                  key={r._id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    r.isOverdue
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{r.title}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>Đến hạn: {r.nextDueDate}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-900 block">
                      {formatCurrency(r.amount, currency)}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        r.isOverdue
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {r.isOverdue ? 'Quá hạn' : 'Sắp đến hạn'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {t('dash.recent_transactions')}
            </h3>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <span>{t('dash.view_all')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {(!summary?.recentTransactions || summary.recentTransactions.length === 0) ? (
              <div className="py-8 text-center text-slate-400">
                <p className="text-xs">{t('dash.no_transactions')}</p>
              </div>
            ) : (
              summary.recentTransactions.slice(0, 4).map((tItem) => {
                const cat = getCategoryById(tItem.category);
                const isIncome = tItem.type === 'income';

                return (
                  <div
                    key={tItem._id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        {isIncome ? '+' : '-'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {tItem.description || (language === 'vi' ? cat.labelVi : cat.labelEn)}
                        </p>
                        <span className="text-[10px] text-slate-400">{tItem.date}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold ${
                          isIncome ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(tItem.amount, currency)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
