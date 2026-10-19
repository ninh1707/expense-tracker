import React from 'react';
import { CalendarDays, CheckCircle2, Edit, Trash2 } from 'lucide-react';
import { IRecurringPayment } from '../../types';
import { formatCurrency, getCategoryById } from '../../utils/categories';
import { CategoryIcon } from '../common/CategoryIcon';

interface RecurringTableProps {
  bills: IRecurringPayment[];
  currency: string;
  language: string;
  onPay: (bill: IRecurringPayment) => void;
  onEdit: (bill: IRecurringPayment) => void;
  onDelete: (id: string) => void;
}

const frequencyLabels: Record<IRecurringPayment['frequency'], string> = {
  daily: 'Hằng ngày',
  weekly: 'Hằng tuần',
  monthly: 'Hằng tháng',
  yearly: 'Hằng năm'
};

// Presentation-only table: receives the same API records and business handlers as the mobile cards.
export const RecurringTable: React.FC<RecurringTableProps> = ({
  bills, currency, language, onPay, onEdit, onDelete
}) => (
  <div className="hidden lg:block ft-recurring-table-wrap overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table className="w-full min-w-[850px] text-left text-sm">
      <thead>
        <tr className="text-[11px] uppercase tracking-wider text-slate-500">
          <th className="p-4">Khoản chi</th>
          <th className="p-4">Số tiền</th>
          <th className="p-4">Danh mục</th>
          <th className="p-4">Chu kỳ</th>
          <th className="p-4">Ngày đến hạn</th>
          <th className="p-4">Nhắc trước</th>
          <th className="p-4">Trạng thái</th>
          <th className="p-4">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {bills.map(bill => {
          const cat = getCategoryById(bill.category);
          const status = bill.isOverdue ? 'Quá hạn' : bill.isDueSoon ? 'Sắp đến hạn' : 'Đang theo dõi';
          const statusStyle = bill.isOverdue ? 'bg-rose-50 text-rose-700' : bill.isDueSoon ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700';
          return (
            <tr key={bill._id} className="hover:bg-slate-50/70">
              <td className="p-4"><div className="flex items-center gap-2.5"><CategoryIcon categoryId={bill.category} size={18} className="h-9 w-9" /><div className="min-w-0"><div className="font-semibold text-slate-900">{bill.title}</div><div className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-44">{bill.notes || 'Khoản thanh toán định kỳ'}</div></div></div></td>
              <td className="p-4 font-bold text-slate-900 tabular-nums whitespace-nowrap">{formatCurrency(bill.amount, currency)}</td>
              <td className="p-4"><span className="inline-flex rounded-lg px-2 py-1 text-xs font-medium" style={{ backgroundColor: cat.bgColor, color: cat.color }}><CategoryIcon categoryId={bill.category} variant="inline" size={13} className="mr-1.5" />{language === 'vi' ? cat.labelVi : cat.labelEn}</span></td>
              <td className="p-4 text-xs text-slate-600 whitespace-nowrap">{frequencyLabels[bill.frequency]}</td>
              <td className="p-4 text-xs text-slate-800 whitespace-nowrap"><span className="inline-flex gap-1 items-center"><CalendarDays className="h-3.5 w-3.5 text-slate-400" />{bill.nextDueDate}</span></td>
              <td className="p-4 text-xs text-slate-600 whitespace-nowrap">{bill.reminderDays ?? bill.reminderDaysBefore ?? 3} ngày</td>
              <td className="p-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${statusStyle}`}>{status}</span></td>
              <td className="p-4"><div className="flex items-center gap-1.5">
                <button type="button" onClick={() => onPay(bill)} title="Xác nhận thanh toán" className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-2 text-xs font-bold inline-flex items-center gap-1"><CheckCircle2 size={14}/> Thanh toán</button>
                <button type="button" onClick={() => onEdit(bill)} title="Sửa khoản chi" className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 p-2"><Edit size={15}/></button>
                <button type="button" onClick={() => onDelete(bill._id)} title="Xóa khoản chi" className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 p-2"><Trash2 size={15}/></button>
              </div></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
