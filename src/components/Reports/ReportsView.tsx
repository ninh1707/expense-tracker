import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Award,
  CreditCard,
  PieChart as PieIcon,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../../services/api';
import { CATEGORIES, PAYMENT_METHODS, formatCurrency, getCategoryById } from '../../utils/categories';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { downloadVietnameseReport } from '../../utils/pdfReport';
import PeriodCategoryReport from './PeriodCategoryReport';

interface ReportsViewProps {
  currency: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ currency }) => {
  const { t, language } = useLanguage();
  const { addToast } = useNotification();

  const [period, setPeriod] = useState<string>('month');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const data = await api.reports.getAnalytics(period);
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setReportData(null);
      addToast('Lỗi', 'Không tải được dữ liệu báo cáo. Vui lòng thử lại.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  const handleExportCSV = async () => {
    try {
      await api.reports.exportCSV(period);
      addToast('Thành công', 'Đã tải xuống file CSV báo cáo tài chính', 'success');
    } catch (err) {
      addToast('Lỗi', 'Không thể xuất file CSV', 'error');
    }
  };

  const handleExportPDF = () => {
    try {
      if (!reportData) { addToast('Thông báo','Chưa có dữ liệu báo cáo để xuất','error'); return; }
      downloadVietnameseReport(reportData,period,currency);
      addToast('Thành công','Đã xuất PDF có hỗ trợ tiếng Việt','success');
    } catch(err){console.error(err);addToast('Lỗi','Không thể tạo file PDF','error');}
  };

  const handlePrint = () => {
    window.print();
  };

  const categoryPieData = reportData?.categoryBreakdown?.map((c: any) => {
    const cat = getCategoryById(c.category);
    return {
      name: language === 'vi' ? cat.labelVi : cat.labelEn,
      value: c.amount,
      color: cat.color,
      percentage: c.percentage
    };
  }) || [];

  const comparisonBarData = reportData?.dailyTrend?.map((d: any) => ({
    date: d.date.split('-').slice(1).join('/'),
    'Thu nhập': d.income,
    'Chi tiêu': d.expense
  })) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('rep.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('rep.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Select */}
          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
            {[
              { id: 'month', label: t('rep.period_month') },
              { id: 'quarter', label: t('rep.period_quarter') },
              { id: 'year', label: t('rep.period_year') }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  period === p.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV / Excel</span>
          </button>

          <button
            id="export-pdf-btn"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất PDF</span>
          </button>

          <button
            id="print-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In</span>
          </button>
        </div>
      </div>

      <PeriodCategoryReport token={localStorage.getItem('auth_token') || ''} />
      {/* Financial Health & Insights Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Đánh giá sức khỏe tài chính & Khuyến nghị</span>
          </div>
          <h3 className="text-lg font-bold">
            {reportData?.financialHealth?.status || 'Tình hình tài chính cân bằng'}
          </h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-2xl">
            {reportData?.financialHealth?.recommendation ||
              'Tỷ lệ tiết kiệm và chi tiêu của bạn đang ở mức hợp lý. Hãy duy trì hạn mức ngân sách và tiếp tục tích lũy vào quỹ khẩn cấp để đảm bảo an toàn tài chính.'}
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Tỷ lệ tích lũy</span>
              <strong className="text-emerald-400 text-base font-black">
                {reportData?.savingsRate || 0}%
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Chi tiêu trung bình/ngày</span>
              <strong className="text-white text-base font-black">
                {formatCurrency(reportData?.avgDailyExpense || 0, currency)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Chênh lệch ròng</span>
              <strong
                className={`text-base font-black ${
                  (reportData?.netSavings || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(reportData?.netSavings || 0, currency)}
              </strong>
            </div>
          </div>
        </div>

        {/* Health Score Gauge */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
          <Award className="w-10 h-10 text-emerald-600 mb-2" />
          <span className="text-3xl font-black text-slate-900">
            {reportData?.financialHealth?.score ?? 0}/100
          </span>
          <span className="text-xs font-bold text-emerald-700 mt-1">Điểm sức khỏe tài chính</span>
          <p className="text-[11px] text-slate-400 mt-1">Điểm tham khảo dựa trên tỷ lệ tích lũy; chưa tính mức tuân thủ ngân sách</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="min-w-0 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {t('rep.income_vs_expense')}
              </h3>
              <p className="text-xs text-slate-500">Biểu đồ so sánh dòng tiền theo từng mốc thời gian</p>
            </div>
          </div>

          <div className="h-64 w-full min-w-0">
            {comparisonBarData.length > 0 ? (
                <BarChart width={700} height={256} style={{ width: '100%', height: '100%' }} data={comparisonBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickFormatter={(val) => (val >= 1000000 ? `${val / 1000000}tr` : `${val / 1000}k`)}
                  />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), currency)}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Thu nhập" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Chi tiêu" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">Không đủ dữ liệu cho chu kỳ này</div>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="min-w-0 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {t('rep.category_distribution')}
              </h3>
              <p className="text-xs text-slate-500">Tỷ trọng chi tiêu giữa các danh mục</p>
            </div>
          </div>

          <div className="h-64 w-full min-w-0 flex items-center justify-center">
            {categoryPieData.length > 0 ? (
                <PieChart width={500} height={256} style={{ width: '100%', height: '100%' }}>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), currency)}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">Chưa có dữ liệu chi tiêu</div>
            )}
          </div>
        </div>
      </div>

      {/* Ranked Category Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">
            Chi tiết phân bổ chi tiêu theo nhóm
          </h3>
          <p className="text-xs text-slate-500">Xếp hạng các nhóm phát sinh nhiều chi phí nhất</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-6">Danh mục</th>
                <th className="py-3 px-4 text-right">Tổng chi</th>
                <th className="py-3 px-4 text-right">Tỷ lệ %</th>
                <th className="py-3 px-6 text-center">Tiến độ chi tiêu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {categoryPieData.map((c: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-6 flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="font-bold text-slate-800">{c.name}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    {formatCurrency(c.value, currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-700">
                    {c.percentage}%
                  </td>
                  <td className="py-3 px-6">
                    <div className="w-36 mx-auto bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ backgroundColor: c.color, width: `${c.percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
