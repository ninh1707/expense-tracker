export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet' | 'other';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  currency: string;
  language: string;
  monthlyIncomeTarget?: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITransaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: string;
  tags?: string[];
  recurringPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBudget {
  _id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  month?: string;
  alertThreshold: number;
  spent?: number;
  remaining?: number;
  percentage?: number;
  status?: 'normal' | 'warning' | 'exceeded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISavingsGoal {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  color?: string;
  icon?: string;
  notes?: string;
  history: {
    id: string;
    date: string;
    amount: number;
    type: 'deposit' | 'withdraw';
    note?: string;
  }[];
  isCompleted: boolean;
  percentage?: number;
  daysRemaining?: number;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IRecurringPayment {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  type?: 'expense' | 'income';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dueDate?: number;
  nextDueDate: string;
  reminderDaysBefore?: number;
  reminderDays?: number;
  autoRecordTransaction?: boolean;
  status: 'active' | 'paused';
  notes?: string;
  isDueSoon?: boolean;
  isOverdue?: boolean;
  lastPaidDate?: string;
  paymentHistory?: {
    date: string;
    amount: number;
    transactionId?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: string;
  labelVi: string;
  labelEn: string;
  icon: string;
  color: string;
  bgColor: string;
  type: 'expense' | 'income' | 'both';
}

export interface DashboardSummary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expense: number;
    balance: number;
  }[];
  recentTransactions: ITransaction[];
}

export interface FinancialReport {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    savingsRate: number;
    dailyAverageExpense: number;
    transactionCount: number;
  };
  categoryAnalysis: {
    category: string;
    total: number;
    count: number;
    percentage: number;
  }[];
  paymentMethodMap: Record<string, number>;
  topExpenses: ITransaction[];
  insights: {
    type: 'positive' | 'warning' | 'info';
    textVi: string;
    textEn: string;
  }[];
  transactions: ITransaction[];
}

export type AppTab = 'dashboard' | 'transactions' | 'budgets' | 'savings' | 'recurring' | 'reports' | 'settings';
