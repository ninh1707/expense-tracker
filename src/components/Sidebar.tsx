import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Repeat,
  FileBarChart2,
  Settings,
  ShieldCheck,
  X
} from 'lucide-react';
import { AppTab } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';

interface SidebarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile
}) => {
  const { t } = useLanguage();
  const { unreadCount } = useNotification();

  const navItems: { tab: AppTab; labelKey: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { tab: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { tab: 'transactions', labelKey: 'nav.transactions', icon: Receipt },
    { tab: 'budgets', labelKey: 'nav.budgets', icon: PieChart },
    { tab: 'savings', labelKey: 'nav.savings', icon: Target },
    { tab: 'recurring', labelKey: 'nav.recurring', icon: Repeat, badge: unreadCount },
    { tab: 'reports', labelKey: 'nav.reports', icon: FileBarChart2 },
    { tab: 'settings', labelKey: 'nav.settings', icon: Settings }
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 z-50 lg:z-10 h-screen lg:h-[calc(100vh-61px)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-6 px-4 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-sm">Menu điều hướng</span>
            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.tab;

              return (
                <button
                  key={item.tab}
                  id={`nav-tab-${item.tab}`}
                  onClick={() => {
                    onSelectTab(item.tab);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{t(item.labelKey)}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Security / Privacy badge */}
        <div className="pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Bảo mật đa tầng</p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Dữ liệu tài chính được bảo vệ riêng biệt theo tài khoản của bạn.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
