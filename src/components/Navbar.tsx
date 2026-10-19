import React, { useState } from 'react';
import {
  Wallet,
  Bell,
  Globe,
  Plus,
  LogOut,
  User as UserIcon,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Check,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';

interface NavbarProps {
  onOpenNewTransaction: () => void;
  onToggleMobileSidebar: () => void;
  currency: string;
  onCurrencyChange: (c: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTransaction,
  onToggleMobileSidebar,
  currency,
  onCurrencyChange,
  onNavigateTab,
  onOpenAuth
}) => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotification();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-3 transition-colors"
    >
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-btn"
            onClick={onToggleMobileSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            id="app-brand"
            onClick={() => onNavigateTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight flex items-center gap-1.5">
                FinTrack <span className="text-emerald-600">VN</span>
              </span>
              <p className="text-[11px] text-slate-500 -mt-0.5 hidden sm:block font-medium">
                Quản lý chi tiêu thông minh
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Transaction Button */}
          <button
            id="nav-quick-add-btn"
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-3.5 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('nav.add_transaction')}</span>
            <span className="sm:hidden">Thu chi</span>
          </button>

          {/* Currency Selector */}
          <div className="relative">
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="appearance-none bg-slate-100 hover:bg-slate-200 border-0 text-slate-700 text-xs font-semibold py-2 pl-2.5 pr-6 rounded-lg cursor-pointer focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
            >
              <option value="VND">₫ VND</option>
              <option value="USD">$ USD</option>
            </select>
          </div>

          {/* Language Switcher */}
          <button
            id="lang-toggle-btn"
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Đổi ngôn ngữ / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'vi' ? 'VI' : 'EN'}</span>
          </button>

          {/* Notifications Dropdown Button */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                id="notifications-dropdown-menu"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 text-sm">Thông báo & Nhắc nhở</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] bg-rose-100 text-rose-700 font-medium px-1.5 py-0.2 rounded-full">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Đã đọc tất cả
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
                      <p className="text-xs">Không có cảnh báo ngân sách hay hóa đơn đến hạn</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.linkTab) onNavigateTab(n.linkTab);
                          setShowNotifications(false);
                        }}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                          !n.read ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'budget_exceeded' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                          ) : n.type === 'budget_warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                          <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100/80">
                            <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {!n.read && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
                                  title="Đánh dấu đã đọc"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Đã đọc</span>
                                </button>
                              )}
                              <button
                                onClick={() => clearNotification(n.id)}
                                className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-0.5 transition-colors"
                                title="Xóa thông báo"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Demo Switcher */}
          <div className="relative">
            {!isAuthenticated || !user ? (
              <button
                id="login-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            ) : (
              <>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="text-xs font-semibold text-slate-800 block truncate max-w-[120px]">
                      {user?.name || 'Tài khoản'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                      {user?.email || ''}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Tài khoản hoạt động</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigateTab('settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Hồ sơ & Mục tiêu thu nhập</span>
                      </button>

                      <button
                        onClick={async () => {
                          await demoLogin();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span>Nạp lại dữ liệu mẫu (Demo)</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>{t('common.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
