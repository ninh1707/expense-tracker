import {
  ITransaction,
  IBudget,
  ISavingsGoal,
  IRecurringPayment,
  DashboardSummary,
  FinancialReport,
  IUser
} from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || 'Request failed');
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Auth
  auth: {
    async register(data: { name: string; email: string; password: string; currency?: string; language?: string }) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse<{ user: IUser; token: string }>(res);
    },

    async login(data: { email: string; password: string }) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse<{ user: IUser; token: string }>(res);
    },

    async demoLogin() {
      const res = await fetch(`${API_BASE}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return handleResponse<{ user: IUser; token: string }>(res);
    },

    async getProfile() {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: getHeaders()
      });
      return handleResponse<IUser>(res);
    },

    async updateProfile(data: Partial<IUser>) {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<IUser>(res);
    },

    async changePassword(currentPassword: string, newPassword: string) {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      return handleResponse<{ message: string }>(res);
    },

    async resetData() {
      const res = await fetch(`${API_BASE}/auth/reset-data`, {
        method: 'POST',
        headers: getHeaders()
      });
      return handleResponse<{ message: string }>(res);
    }
  },

  // Transactions
  transactions: {
    async getAll(params: Record<string, any> = {}) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      const res = await fetch(`${API_BASE}/transactions?${query.toString()}`, {
        headers: getHeaders()
      });
      return handleResponse<ITransaction[]>(res);
    },

    async getSummary(month?: string) {
      const query = month ? `?month=${month}` : '';
      const res = await fetch(`${API_BASE}/transactions/summary${query}`, {
        headers: getHeaders()
      });
      return handleResponse<DashboardSummary>(res);
    },

    async create(data: Partial<ITransaction>) {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<ITransaction>(res);
    },

    async update(id: string, data: Partial<ITransaction>) {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<ITransaction>(res);
    },

    async delete(id: string) {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse<{ message: string }>(res);
    }
  },

  // Budgets
  budgets: {
    async getAll(month?: string) {
      const query = month ? `?month=${month}` : '';
      const res = await fetch(`${API_BASE}/budgets${query}`, {
        headers: getHeaders()
      });
      return handleResponse<IBudget[]>(res);
    },

    async getAlerts() {
      const res = await fetch(`${API_BASE}/budgets/alerts`, {
        headers: getHeaders()
      });
      return handleResponse<any[]>(res);
    },

    async create(data: Partial<IBudget>) {
      const res = await fetch(`${API_BASE}/budgets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<IBudget>(res);
    },

    async update(id: string, data: Partial<IBudget>) {
      const res = await fetch(`${API_BASE}/budgets/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<IBudget>(res);
    },

    async delete(id: string) {
      const res = await fetch(`${API_BASE}/budgets/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse<{ message: string }>(res);
    }
  },

  // Savings Goals
  savings: {
    async getAll() {
      const res = await fetch(`${API_BASE}/savings`, {
        headers: getHeaders()
      });
      return handleResponse<ISavingsGoal[]>(res);
    },

    async create(data: Partial<ISavingsGoal>) {
      const res = await fetch(`${API_BASE}/savings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<ISavingsGoal>(res);
    },

    async update(id: string, data: Partial<ISavingsGoal>) {
      const res = await fetch(`${API_BASE}/savings/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<ISavingsGoal>(res);
    },

    async action(id: string, data: { amount: number; type: 'deposit' | 'withdraw'; note?: string; recordTransaction?: boolean }) {
      const res = await fetch(`${API_BASE}/savings/${id}/action`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<ISavingsGoal>(res);
    },

    async delete(id: string) {
      const res = await fetch(`${API_BASE}/savings/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse<{ message: string }>(res);
    }
  },

  // Recurring Payments
  recurring: {
    async getAll() {
      const res = await fetch(`${API_BASE}/recurring`, {
        headers: getHeaders()
      });
      return handleResponse<IRecurringPayment[]>(res);
    },

    async getReminders() {
      const res = await fetch(`${API_BASE}/recurring/reminders`, {
        headers: getHeaders()
      });
      return handleResponse<IRecurringPayment[]>(res);
    },

    async create(data: Partial<IRecurringPayment>) {
      const res = await fetch(`${API_BASE}/recurring`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<IRecurringPayment>(res);
    },

    async update(id: string, data: Partial<IRecurringPayment>) {
      const res = await fetch(`${API_BASE}/recurring/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<IRecurringPayment>(res);
    },

    async markPaid(id: string, options?: { paidDate?: string; recordTransaction?: boolean } | string) {
      const body = typeof options === 'string'
        ? { paidDate: options }
        : { paidDate: options?.paidDate, recordTransaction: options?.recordTransaction };
      const res = await fetch(`${API_BASE}/recurring/${id}/pay`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      return handleResponse<IRecurringPayment>(res);
    },

    async delete(id: string) {
      const res = await fetch(`${API_BASE}/recurring/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse<{ message: string }>(res);
    }
  },

  // Reports
  reports: {
    async getPeriodReport(startDate?: string, endDate?: string) {
      const query = new URLSearchParams();
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);
      const res = await fetch(`${API_BASE}/reports/period?${query.toString()}`, {
        headers: getHeaders()
      });
      return handleResponse<FinancialReport>(res);
    },

    async getAnalytics(period: string = 'month') {
      const now = new Date();
      let startDate: string;
      const endDate = now.toISOString().split('T')[0];

      if (period === 'quarter') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        startDate = threeMonthsAgo.toISOString().split('T')[0];
      } else if (period === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        startDate = startOfYear.toISOString().split('T')[0];
      } else {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = startOfMonth.toISOString().split('T')[0];
      }

      const report = await this.getPeriodReport(startDate, endDate);

      const dailyMap: Record<string, { income: number; expense: number }> = {};
      report.transactions?.forEach((tx) => {
        if (!dailyMap[tx.date]) {
          dailyMap[tx.date] = { income: 0, expense: 0 };
        }
        if (tx.type === 'income') {
          dailyMap[tx.date].income += tx.amount;
        } else {
          dailyMap[tx.date].expense += tx.amount;
        }
      });

      const dailyTrend = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, vals]) => ({ date, ...vals }));

      return {
        ...report,
        savingsRate: report.summary?.savingsRate || 0,
        avgDailyExpense: report.summary?.dailyAverageExpense || 0,
        netSavings: report.summary?.netSavings || 0,
        categoryBreakdown: report.categoryAnalysis?.map(c => ({
          category: c.category,
          amount: c.total,
          percentage: c.percentage
        })) || [],
        dailyTrend,
        financialHealth: {
          score: Math.min(100, Math.max(30, Math.round(50 + ((report.summary?.savingsRate || 0) * 1.5)))),
          status: (report.summary?.savingsRate || 0) >= 20 ? 'Tài chính vững mạnh & Lành mạnh' : 'Cần tối ưu và giảm chi tiêu',
          recommendation: (report.summary?.savingsRate || 0) >= 20
            ? 'Tỷ lệ tích lũy của bạn đạt mức khuyến nghị quốc tế (≥ 20%). Hãy tiếp tục phân bổ thặng dư vào các mục tiêu tiết kiệm dài hạn.'
            : 'Chi tiêu tháng này đang chiếm tỷ trọng cao so với thu nhập. Hãy xem xét cắt giảm ở các khoản ăn ngoài hoặc giải trí để gia tăng tỷ lệ tích lũy an toàn.'
        }
      };
    },

    async exportCSV(_period?: string) {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/reports/export?format=csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    },

    async exportJSON() {
      const res = await fetch(`${API_BASE}/reports/export?format=json`, {
        headers: getHeaders()
      });
      return handleResponse<any>(res);
    }
  }
};
