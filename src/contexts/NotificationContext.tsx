import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface AppNotification {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'bill_due' | 'bill_overdue' | 'goal_achieved' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  refreshNotifications: () => Promise<void>;
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  toast: { title: string; message: string; type: 'success' | 'error' | 'info' } | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const [budgetAlerts, dueBills] = await Promise.all([
        api.budgets.getAlerts().catch(() => []),
        api.recurring.getReminders().catch(() => [])
      ]);

      const items: AppNotification[] = [];

      // Budget notifications
      budgetAlerts.forEach((b: any) => {
        items.push({
          id: `bgt_${b.id}_${b.status}`,
          type: b.status === 'exceeded' ? 'budget_exceeded' : 'budget_warning',
          title: b.status === 'exceeded' ? '⚠️ Vượt hạn mức ngân sách' : '⚡ Cảnh báo ngân sách',
          message: b.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          linkTab: 'budgets'
        });
      });

      // Recurring bills notifications
      dueBills.forEach((r: any) => {
        const isOverdue = r.isOverdue;
        items.push({
          id: `rec_${r._id}_${r.nextDueDate}`,
          type: isOverdue ? 'bill_overdue' : 'bill_due',
          title: isOverdue ? '🚨 Hóa đơn đã quá hạn' : '⏰ Nhắc nhở thanh toán đến hạn',
          message: `${r.title} - ${Number(r.amount).toLocaleString('vi-VN')} đ (Hạn: ${r.nextDueDate})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          linkTab: 'recurring'
        });
      });

      setNotifications(items);
    } catch (err) {
      console.error('Notification refresh error:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 60000); // 1 minute
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        refreshNotifications,
        addToast,
        toast
      }}
    >
      {children}
      {/* Toast popup */}
      {toast && (
        <div
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-md"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">{toast.title}</h4>
            <p className="text-xs text-slate-300 truncate">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white text-xs px-1.5 py-1 rounded"
          >
            ✕
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
