import React, { useEffect, useState } from 'react';
import { getCategoryById } from '../../utils/categories';
import { CategoryIcon } from '../common/CategoryIcon';
const fmt=(n:number)=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n);
const day=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
type Detail={type:'income'|'expense';category:string;amount:number;count:number};
type Report={from:string;to:string;income:number;expense:number;balance:number;details:Detail[]};
export default function PeriodCategoryReport({token}:{token:string}){
  const [from,setFrom]=useState(day(new Date()));const [to,setTo]=useState(day(new Date()));
  const [data,setData]=useState<Report|null>(null);const [error,setError]=useState('');const [loading,setLoading]=useState(false);
  const quick=(days:number)=>{const now=new Date(),start=new Date();start.setDate(now.getDate()-days+1);setFrom(day(start));setTo(day(now));};
  useEffect(()=>{
    if(!token)return;
    const ctrl=new AbortController();setLoading(true);setError('');setData(null);
    if (!from || !to || from > to) {setError('Vui lòng chọn khoảng ngày hợp lệ.');setLoading(false);return;}
    fetch(`/api/reports/by-period?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,{headers:{Authorization:`Bearer ${token}`},signal:ctrl.signal})
      .then(async r=>{const v=await r.json();if(!r.ok)throw Error(v.message||'Không lấy được dữ liệu');return v as Report;})
      .then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!ctrl.signal.aborted)setLoading(false)});
    return ()=>ctrl.abort();
  },[token,from,to]);
  return <section aria-label="Thống kê theo khoảng thời gian" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-bold text-slate-900">Thống kê thu chi theo thời gian</h2>
    <div className="flex gap-2 flex-wrap">{[1,3,7,30].map((n,i)=><button key={n} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100" onClick={()=>quick(n)}>{['Hôm nay','3 ngày','1 tuần','1 tháng'][i]}</button>)}</div>
    <div className="flex flex-wrap gap-3"><label>Từ ngày <input className="rounded-lg border border-slate-200 p-2 text-sm" type="date" value={from} max={to} onChange={e=>setFrom(e.target.value)}/></label><label>Đến ngày <input className="rounded-lg border border-slate-200 p-2 text-sm" type="date" value={to} min={from} onChange={e=>setTo(e.target.value)}/></label></div>
    {loading&&<p>Đang tải dữ liệu...</p>}{error&&<p role="alert" className="text-red-600">{error}</p>}
    {data&&<><div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 text-sm"><p>Tổng thu: <strong>{fmt(data.income)}</strong></p><p>Tổng chi: <strong>{fmt(data.expense)}</strong></p><p>Chênh lệch: <strong>{fmt(data.balance)}</strong></p></div>
    <h3 className="font-semibold">Chi tiết theo danh mục</h3>
    <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr><th className="border-b border-slate-100 p-3 text-left">Loại</th><th className="border-b border-slate-100 p-3 text-left">Danh mục</th><th className="border-b border-slate-100 p-3 text-left">Số giao dịch</th><th className="border-b border-slate-100 p-3 text-left">Tổng số tiền</th></tr></thead><tbody>{data.details.map((x,i)=><tr key={i}><td className="border-b border-slate-100 p-3 text-left">{x.type==='expense'?'Chi':'Thu'}</td><td className="border-b border-slate-100 p-3 text-left"><span className="inline-flex items-center gap-2"><CategoryIcon categoryId={x.category} variant="inline" size={16} />{getCategoryById(x.category).labelVi}</span></td><td className="border-b border-slate-100 p-3 text-left">{x.count}</td><td className="border-b border-slate-100 p-3 text-left">{fmt(x.amount)}</td></tr>)}</tbody></table></div>
    {data.details.length===0&&<p>Không có giao dịch trong khoảng đã chọn.</p>}</>}
  </section>;
}
