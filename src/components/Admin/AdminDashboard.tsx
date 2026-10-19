import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, CheckCircle2, ChevronRight,
  CircleDollarSign, FolderKanban, LayoutDashboard, LockKeyhole, Menu, Wallet,
  Plus, RefreshCw, Search, ShieldCheck, ShieldUser, Users, X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type Tab = 'stats' | 'users' | 'categories' | 'logs';
type User = { _id: string; name?: string; email?: string; role?: string; disabled?: boolean };
type Category = { _id: string; name: string; type: 'income' | 'expense'; active: boolean; detected?:boolean; transactionCount?:number;totalAmount?:number };
type Log = {
  _id: string; actorId: string; actorName?: string; actorEmail?: string;
  action: string; target: string; targetType?: 'user' | 'category';
  targetName?: string; targetEmail?: string; createdAt: string;
};
type Stats = { users: number; transactions: number; income: number; expense: number };

const vnd = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount || 0);
const nav: { id: Tab; name: string; hint: string; icon: typeof LayoutDashboard }[] = [
  { id: 'stats', name: 'Tổng quan', hint: 'Số liệu hệ thống', icon: LayoutDashboard },
  { id: 'users', name: 'Người dùng', hint: 'Tài khoản & phân quyền', icon: Users },
  { id: 'categories', name: 'Danh mục chung', hint: 'Cấu hình danh mục', icon: FolderKanban },
  { id: 'logs', name: 'Nhật ký hoạt động', hint: 'Theo dõi quản trị', icon: Activity },
];
const card = 'bg-white rounded-2xl border border-slate-200 shadow-sm';
const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600';

export default function AdminDashboard({ token }: { token: string }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>(() => {
    // Giữ tab Admin khi trình duyệt tải lại hoặc Vite cập nhật giao diện.
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('fintrack_admin_tab') : null;
    return saved === 'users' || saved === 'categories' || saved === 'logs' ? saved : 'stats';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const actionLocked = useRef(false);
  const [search, setSearch] = useState('');
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'income' | 'expense'>('expense');

  const api = useCallback(async (path: string, init: RequestInit = {}) => {
    const res = await fetch('/api/admin' + path, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.message || `Yêu cầu thất bại (${res.status})`);
    return payload;
  }, [token]);

  const refresh = useCallback(async () => {
    setBusy(true); setError('');
    try {
      if (tab === 'stats') setStats(await api('/stats'));
      else if (tab === 'users') setUsers((await api('/users')).items || []);
      else if (tab === 'categories') setCategories((await api('/categories')).items || []);
      else setLogs((await api('/logs')).items || []);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }, [api, tab]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { sessionStorage.setItem('fintrack_admin_tab', tab); setMessage(''); setSearch(''); }, [tab]);

  const perform = async (action: () => Promise<unknown>, success: string) => {
    if (actionLocked.current) return;
    actionLocked.current = true;
    setBusy(true);
    try { setError(''); setMessage(''); await action(); await refresh(); setMessage(success); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thể hoàn tất thao tác.'); }
    finally { actionLocked.current = false; setBusy(false); }
  };
  const editUser = (u: User) => {
    const name = window.prompt('Tên hiển thị mới', u.name || '');
    if (name === null) return;
    if (name.trim().length < 2) { setError('Tên phải có ít nhất 2 ký tự.'); return; }
    void perform(() => api('/users/' + encodeURIComponent(u._id), { method: 'PATCH', body: JSON.stringify({ name: name.trim() }) }), 'Đã cập nhật người dùng.');
  };
  const changeRole = (u: User) => {
    if (u._id === user?._id) { setError('Không thể tự thay đổi quyền quản trị của chính mình.'); return; }
    const role = u.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Đổi quyền của ${u.email} thành ${role === 'admin' ? 'Quản trị viên' : 'Người dùng'}?`)) return;
    void perform(() => api('/users/' + encodeURIComponent(u._id), { method: 'PATCH', body: JSON.stringify({ role }) }), 'Đã cập nhật quyền.');
  };
  const toggleUser = (u: User) => {
    if (u._id === user?._id) { setError('Không thể tự khóa tài khoản đang đăng nhập.'); return; }
    if (!window.confirm(`${u.disabled ? 'Mở khóa' : 'Khóa'} tài khoản ${u.email}?`)) return;
    void perform(() => api('/users/' + encodeURIComponent(u._id), { method: 'PATCH', body: JSON.stringify({ disabled: !u.disabled }) }), 'Đã cập nhật trạng thái tài khoản.');
  };
  const createCategory = (e: React.FormEvent) => {
    e.preventDefault();
    void perform(async () => {
      await api('/categories', { method: 'POST', body: JSON.stringify({ name: catName.trim(), type: catType }) });
      setCatName('');
    }, 'Đã thêm danh mục mới.');
  };
  const editCategory = (c: Category) => {
    const name = window.prompt('Tên danh mục mới', c.name);
    if (name === null) return;
    if (name.trim().length < 2) { setError('Tên danh mục phải có ít nhất 2 ký tự.'); return; }
    void perform(() => api('/categories/' + encodeURIComponent(c._id), { method: 'PATCH', body: JSON.stringify({ name: name.trim() }) }), 'Đã sửa danh mục.');
  };
  const toggleCategory = (c: Category) => {
    if (!window.confirm(`${c.active ? 'Ngừng sử dụng' : 'Kích hoạt lại'} danh mục ${c.name}?`)) return;
    void perform(() => api('/categories/' + encodeURIComponent(c._id), { method: 'PATCH', body: JSON.stringify({ active: !c.active }) }), 'Đã cập nhật danh mục.');
  };
  const visibleUsers = users.filter(u => `${u.name || ''} ${u.email || ''}`.toLowerCase().includes(search.toLowerCase()));
  const visibleCategories = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const visibleLogs = logs.filter(l =>
    `${l.action} ${l.target} ${l.targetName || ''} ${l.targetEmail || ''} ${l.actorName || ''} ${l.actorEmail || ''}`
      .toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))
  );
  const selected = nav.find(x => x.id === tab)!;

  return (
    <div className="fintrack-admin-ui min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <header className="h-[65px] sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Mở menu quản trị" onClick={() => setMenuOpen(true)}><Menu size={20}/></button>
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 flex items-center justify-center"><Wallet size={20}/></div>
            <div className="min-w-0"><p className="font-bold text-lg tracking-tight leading-5">FinTrack <span className="text-emerald-600">VN</span></p><p className="text-[11px] text-slate-500 font-semibold tracking-wide">TRUNG TÂM QUẢN TRỊ</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-2 items-center text-sm text-slate-600"><ShieldCheck size={16} className="text-emerald-600"/><span className="font-medium">{user?.name || user?.email || 'Quản trị viên'}</span></div>
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">Admin</span>
            <button className={`${button} border border-slate-200 hover:bg-slate-50 text-slate-700`} type="button" onClick={logout}><LockKeyhole size={16}/> <span className="hidden sm:inline">Đăng xuất</span></button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 w-full mx-auto">
        {menuOpen && <div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />}
        <aside className={`fixed lg:sticky top-0 lg:top-[65px] left-0 z-50 lg:z-10 h-screen lg:h-[calc(100vh-65px)] w-64 shrink-0 bg-white border-r border-slate-200 px-4 py-6 transition-transform ${menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex lg:hidden items-center justify-between mb-5"><strong>Quản trị hệ thống</strong><button aria-label="Đóng menu" onClick={() => setMenuOpen(false)}><X/></button></div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 px-3 mb-3">Điều hướng</p>
          <nav aria-label="Điều hướng quản trị" className="space-y-1.5">{nav.map(({id,name,icon:Icon}) => <button key={id} type="button" onClick={() => {setTab(id);setMenuOpen(false);}} className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${tab===id ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Icon size={18} className={tab===id?'text-emerald-600':'text-slate-400'}/>{name}{tab===id&&<ChevronRight size={15} className="ml-auto"/>}</button>)}</nav>
          <div className="mt-8 rounded-2xl p-4 border border-emerald-100 bg-emerald-50"><div className="flex gap-2 items-center text-emerald-800 font-bold text-sm"><ShieldUser size={18}/> Quyền quản trị</div><p className="mt-2 text-xs text-emerald-700 leading-relaxed">Quản lý tài khoản và danh mục chung. Dữ liệu riêng tư được bảo vệ bằng phân quyền API.</p></div>
        </aside>
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-1">Khu vực quản trị</p><h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{selected.name}</h1><p className="text-sm text-slate-500 mt-1">{selected.hint} · FinTrack VN</p></div>
            <button type="button" disabled={busy} onClick={() => void refresh()} className={`${button} bg-white border border-slate-200 shadow-sm hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50`}><RefreshCw size={16} className={busy?'animate-spin':''}/> Làm mới</button>
          </div>
          {error && <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
          {message && <div role="status" className="flex gap-2 items-center p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm"><CheckCircle2 size={17}/>{message}</div>}
          {tab==='stats' && <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {([
                {label:'Tài khoản hoạt động',value:stats ? stats.users.toLocaleString('vi-VN') : '—',icon:Users,tone:'emerald'},
                {label:'Tổng giao dịch',value:stats ? stats.transactions.toLocaleString('vi-VN') : '—',icon:BarChart3,tone:'sky'},
                {label:'Tổng thu nhập',value:stats ? vnd(stats.income) : '—',icon:ArrowUpRight,tone:'emerald'},
                {label:'Tổng chi tiêu',value:stats ? vnd(stats.expense) : '—',icon:ArrowDownRight,tone:'rose'},
              ] as const).map(item=><div key={item.label} className={`${card} p-5`}><div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold text-slate-500">{item.label}</p><div className={`p-2 rounded-xl ${item.tone==='emerald'?'bg-emerald-50 text-emerald-600':item.tone==='sky'?'bg-sky-50 text-sky-600':'bg-rose-50 text-rose-600'}`}><item.icon size={18}/></div></div><p className="text-xl sm:text-2xl mt-3 font-extrabold tracking-tight break-all">{item.value}</p></div>)}
            </div>
            <div className={`${card} p-6`}><h2 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Activity className="text-emerald-600" size={20}/> Tổng hợp toàn hệ thống</h2><p className="text-sm text-slate-500 mt-2">Các số liệu trên được tính từ dữ liệu của các tài khoản trong hệ thống. Khác với trang Tổng quan của người dùng thường, đây là số liệu quản trị toàn hệ thống.</p>{stats && <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Chênh lệch tổng thu – tổng chi</p><p className="text-xl font-bold text-emerald-700 mt-1">{vnd(stats.income-stats.expense)}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Trạng thái dữ liệu</p><p className="text-sm font-semibold text-slate-700 mt-2">Đã kết nối API thống kê quản trị</p></div></div>}</div>
          </>}
          {(tab==='users'||tab==='categories'||tab==='logs') && <div className={`${card} overflow-hidden`}>
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-800">{selected.name}</h2><p className="text-xs text-slate-500 mt-1">{tab==='users'?`${users.length} tài khoản`:tab==='categories'?`${categories.length} danh mục`:`${logs.length} bản ghi gần nhất`}</p></div><label className="relative flex items-center"><Search size={17} className="absolute left-3 text-slate-400"/><input aria-label="Tìm kiếm" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm kiếm..." className="pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm w-full sm:w-64 outline-none focus:ring-2 focus:ring-emerald-300" /></label></div>
            {tab==='users' && <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-slate-500 bg-slate-50 text-xs uppercase"><tr>{['Người dùng','Vai trò','Trạng thái','Thao tác'].map(x=><th key={x} className="px-5 py-4 font-bold">{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visibleUsers.map(u=><tr key={u._id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="font-bold text-slate-800">{u.name||'Chưa có tên'}</div><div className="text-slate-500 text-xs mt-0.5">{u.email}</div></td><td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role==='admin'?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{u.role==='admin'?'Quản trị viên':'Người dùng'}</span></td><td className="px-5 py-4"><span className={`text-xs font-semibold ${u.disabled?'text-rose-600':'text-emerald-700'}`}>{u.disabled?'Bị khóa':'Hoạt động'}</span></td><td className="px-5 py-4"><div className="flex flex-wrap gap-2"><button type="button" className={`${button} bg-slate-100 hover:bg-slate-200 text-slate-700`} disabled={busy} onClick={()=>editUser(u)}>Sửa</button><button type="button" className={`${button} bg-emerald-50 hover:bg-emerald-100 text-emerald-700`} disabled={busy} onClick={()=>changeRole(u)}>Đổi quyền</button><button type="button" className={`${button} bg-rose-50 hover:bg-rose-100 text-rose-700`} disabled={busy} onClick={()=>toggleUser(u)}>{u.disabled?'Mở khóa':'Khóa'}</button></div></td></tr>)}</tbody></table>{visibleUsers.length===0&&<p className="text-center text-sm text-slate-500 p-8">Không tìm thấy tài khoản phù hợp.</p>}</div>}
            {tab==='categories' && <><form className="p-5 bg-slate-50/50 flex flex-wrap items-end gap-3" onSubmit={createCategory}><label className="text-xs font-semibold text-slate-600 flex-1 min-w-44">Tên danh mục<input required minLength={2} maxLength={80} value={catName} onChange={e=>setCatName(e.target.value)} placeholder="Ví dụ: Cà phê" className="mt-2 w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-300"/></label><label className="text-xs font-semibold text-slate-600">Loại<select value={catType} onChange={e=>setCatType(e.target.value as 'income'|'expense')} className="mt-2 block px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"><option value="expense">Chi tiêu</option><option value="income">Thu nhập</option></select></label><button type="submit" disabled={busy} className={`${button} bg-emerald-600 hover:bg-emerald-700 text-white`}><Plus size={17}/> Thêm danh mục</button></form><div className="divide-y divide-slate-100">{visibleCategories.map(c=><div key={c._id} className="flex flex-wrap items-center justify-between p-4 sm:px-5 gap-3 hover:bg-slate-50"><div><p className="font-bold text-sm text-slate-800">{c.name}</p><p className="text-xs text-slate-500 mt-1">{c.type==='income'?'Thu nhập':'Chi tiêu'} · <span className={c.active?'text-emerald-700':'text-rose-600'}>{c.active?'Đang sử dụng':'Ngừng sử dụng'}</span>{c.detected?' · Phát hiện từ giao dịch':''}{typeof c.transactionCount==='number'?` · ${c.transactionCount} giao dịch · ${c.totalAmount?.toLocaleString('vi-VN') || 0}đ`:''}</p></div><div className="flex gap-2"><button type="button" disabled={busy} onClick={()=>c.detected ? window.alert('Đây là danh mục phát hiện từ giao dịch. Hãy tạo danh mục chung tương ứng trước khi chỉnh sửa.') : editCategory(c)} className={`${button} bg-slate-100 hover:bg-slate-200 text-slate-700`}>Sửa</button><button type="button" disabled={busy} onClick={()=>c.detected ? window.alert('Danh mục phát hiện từ giao dịch chưa thể ngừng dùng trực tiếp.') : toggleCategory(c)} className={`${button} ${c.active?'bg-rose-50 text-rose-700 hover:bg-rose-100':'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>{c.active?'Ngừng dùng':'Kích hoạt'}</button></div></div>)}{visibleCategories.length===0&&<p className="text-center text-sm text-slate-500 p-8">Chưa có danh mục phù hợp.</p>}</div></>}
            {tab==='logs' && <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-4 sm:px-5">Thời gian</th>
                    <th className="p-4 sm:px-5">Hoạt động</th>
                    <th className="p-4 sm:px-5">Đối tượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleLogs.map(l => {
                    const knownName = typeof l.targetName === 'string' && l.targetName.trim().length > 0;
                    const resolved = knownName || Boolean(l.targetEmail);
                    const targetLabel = l.targetName || l.targetEmail || (l.targetType === 'category' || l.action.includes('DANH MỤC')
                        ? 'Danh mục không xác định'
                        : 'Người dùng không xác định');
                    const actor = l.actorName || l.actorEmail;
                    return <tr key={l._id} className="hover:bg-slate-50">
                      <td className="p-4 sm:px-5 text-slate-500 whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-4 sm:px-5">
                        <div className="font-semibold text-slate-800">{l.action}</div>
                        {actor && <div className="text-xs text-slate-500 mt-1">Thực hiện bởi: {actor}</div>}
                      </td>
                      <td className="p-4 sm:px-5 text-slate-700" title={`Mã định danh: ${l.target}`}>
                        <div className="font-semibold">{targetLabel}</div>
                        {knownName && l.targetEmail && <div className="text-xs text-slate-500 mt-1 break-all">{l.targetEmail}</div>}
                        {!resolved && <div className="text-xs text-slate-400 mt-1">Không tìm thấy thông tin đối tượng; di chuột để xem ID</div>}
                      </td>
                    </tr>;
                  })}
                </tbody>
              </table>
              {visibleLogs.length===0 && <p className="text-center p-8 text-slate-500">Chưa có nhật ký phù hợp.</p>}
            </div>}
          </div>}
          <footer className="text-center text-xs text-slate-400 py-4">FinTrack VN · Quản trị hệ thống</footer>
        </main>
      </div>
    </div>
  );
}
