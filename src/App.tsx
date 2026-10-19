import React, { useState } from 'react';
import { AppTab, ITransaction } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { TransactionsView } from './components/Transactions/TransactionsView';
import { BudgetsView } from './components/Budgets/BudgetsView';
import { SavingsView } from './components/Savings/SavingsView';
import { RecurringView } from './components/Recurring/RecurringView';
import { ReportsView } from './components/Reports/ReportsView';
import AdminDashboard from './components/Admin/AdminDashboard';
import { SettingsView } from './components/Settings/SettingsView';
import { TransactionFormModal } from './components/Transactions/TransactionFormModal';
import { AuthModal } from './components/Auth/AuthModal';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const { addToast, refreshNotifications } = useNotification();

  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');
  const [currency, setCurrency] = useState<string>(() => localStorage.getItem('app_currency') || 'VND');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Refresh Trigger for data synchronization
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    refreshNotifications();
  };

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleCurrencyChange = (newCur: string) => {
    setCurrency(newCur);
    localStorage.setItem('app_currency', newCur);
    addToast(t('common.success'), `Đã đổi đơn vị tiền tệ sang ${newCur}`, 'info');
  };

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: ITransaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = async (txData: Partial<ITransaction>) => {
    if (editingTransaction) {
      await api.transactions.update(editingTransaction._id, txData);
      addToast(t('common.success'), t('tx.edit_success'), 'success');
    } else {
      await api.transactions.create(txData);
      addToast(t('common.success'), t('tx.add_success'), 'success');
    }
    triggerRefresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Đang khởi động FinTrack...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fintrack-auth-shell min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
        <Navbar
          onOpenNewTransaction={() => setIsAuthModalOpen(true)}
          onToggleMobileSidebar={() => {}}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          onNavigateTab={() => {}}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <AuthModal
            isOpen={true}
            onClose={() => {}}
            canClose={false}
          />
        </div>
      </div>
    );
  }

  if (user?.role === 'admin' && token) {
    return <AdminDashboard token={token} />;
  }

  return (
    <div className="fintrack-ui min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenNewTransaction={handleOpenNewTransaction}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              currency={currency}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenNewTransaction={handleOpenNewTransaction}
              refreshTrigger={refreshTrigger}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              currency={currency}
              onOpenNewTransaction={handleOpenNewTransaction}
              onEditTransaction={handleEditTransaction}
              refreshTrigger={refreshTrigger}
              onTransactionsUpdated={triggerRefresh}
            />
          )}

          {currentTab === 'budgets' && (
            <BudgetsView
              currency={currency}
              refreshTrigger={refreshTrigger}
              onBudgetUpdated={triggerRefresh}
            />
          )}

          {currentTab === 'savings' && (
            <SavingsView
              currency={currency}
              refreshTrigger={refreshTrigger}
              onGoalUpdated={triggerRefresh}
            />
          )}

          {currentTab === 'recurring' && (
            <RecurringView
              currency={currency}
              refreshTrigger={refreshTrigger}
              onRecurringUpdated={triggerRefresh}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView currency={currency} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              onResetData={triggerRefresh}
            />
          )}
        </main>
      </div>

      {/* Transaction Add / Edit Modal */}
      <TransactionFormModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        currency={currency}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
