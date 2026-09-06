import { CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'food',
    labelVi: 'Ăn uống & Cà phê',
    labelEn: 'Food & Dining',
    icon: 'Utensils',
    color: '#f97316',
    bgColor: '#fff7ed',
    type: 'expense'
  },
  {
    id: 'shopping',
    labelVi: 'Mua sắm cá nhân',
    labelEn: 'Shopping',
    icon: 'ShoppingBag',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    type: 'expense'
  },
  {
    id: 'transport',
    labelVi: 'Đi lại & Xăng xe',
    labelEn: 'Transportation',
    icon: 'Car',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    type: 'expense'
  },
  {
    id: 'bills',
    labelVi: 'Hóa đơn & Tiện ích',
    labelEn: 'Bills & Utilities',
    icon: 'FileText',
    color: '#ef4444',
    bgColor: '#fef2f2',
    type: 'expense'
  },
  {
    id: 'entertainment',
    labelVi: 'Giải trí & Phim ảnh',
    labelEn: 'Entertainment',
    icon: 'Gamepad2',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    type: 'expense'
  },
  {
    id: 'education',
    labelVi: 'Giáo dục & Học tập',
    labelEn: 'Education',
    icon: 'GraduationCap',
    color: '#06b6d4',
    bgColor: '#ecfeff',
    type: 'expense'
  },
  {
    id: 'health',
    labelVi: 'Y tế & Sức khỏe',
    labelEn: 'Healthcare',
    icon: 'HeartPulse',
    color: '#10b981',
    bgColor: '#ecfdf5',
    type: 'expense'
  },
  {
    id: 'housing',
    labelVi: 'Nhà cửa & Nội thất',
    labelEn: 'Housing & Home',
    icon: 'Home',
    color: '#6366f1',
    bgColor: '#eef2ff',
    type: 'expense'
  },
  {
    id: 'salary',
    labelVi: 'Lương & Thưởng',
    labelEn: 'Salary & Bonus',
    icon: 'Briefcase',
    color: '#059669',
    bgColor: '#ecfdf5',
    type: 'income'
  },
  {
    id: 'freelance',
    labelVi: 'Thu nhập thêm / Freelance',
    labelEn: 'Freelance & Side Gig',
    icon: 'Laptop',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    type: 'income'
  },
  {
    id: 'investment',
    labelVi: 'Đầu tư & Lãi suất',
    labelEn: 'Investment & Profit',
    icon: 'TrendingUp',
    color: '#14b8a6',
    bgColor: '#f0fdfa',
    type: 'income'
  },
  {
    id: 'savings',
    labelVi: 'Tích lũy & Tiết kiệm',
    labelEn: 'Savings & Deposit',
    icon: 'PiggyBank',
    color: '#d97706',
    bgColor: '#fffbeb',
    type: 'both'
  },
  {
    id: 'other',
    labelVi: 'Khoản thu chi khác',
    labelEn: 'Others',
    icon: 'MoreHorizontal',
    color: '#64748b',
    bgColor: '#f8fafc',
    type: 'both'
  }
];

export const getCategoryById = (id: string): CategoryInfo => {
  return (
    CATEGORIES.find(c => c.id === id) || {
      id: id || 'other',
      labelVi: id || 'Khác',
      labelEn: id || 'Other',
      icon: 'Tag',
      color: '#64748b',
      bgColor: '#f8fafc',
      type: 'both'
    }
  );
};

export const PAYMENT_METHODS = [
  { id: 'cash', labelVi: 'Tiền mặt', labelEn: 'Cash', icon: 'Banknote' },
  { id: 'bank_transfer', labelVi: 'Chuyển khoản', labelEn: 'Bank Transfer', icon: 'Building2' },
  { id: 'credit_card', labelVi: 'Thẻ tín dụng / Ghi nợ', labelEn: 'Credit / Debit Card', icon: 'CreditCard' },
  { id: 'e_wallet', labelVi: 'Ví điện tử (Momo, ZaloPay...)', labelEn: 'E-Wallet', icon: 'Smartphone' },
  { id: 'other', labelVi: 'Khác', labelEn: 'Other', icon: 'CircleDollarSign' }
];

export const formatCurrency = (amount: number, currency = 'VND'): string => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(amount / 25000); // approx conversion for display
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};
