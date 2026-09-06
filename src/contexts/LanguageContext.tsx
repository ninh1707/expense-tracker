import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Navigation
    'nav.dashboard': 'Tổng quan',
    'nav.transactions': 'Sổ giao dịch',
    'nav.budgets': 'Ngân sách',
    'nav.savings': 'Mục tiêu tiết kiệm',
    'nav.recurring': 'Chi phí định kỳ',
    'nav.reports': 'Báo cáo tài chính',
    'nav.settings': 'Cài đặt',
    'nav.add_transaction': '+ Giao dịch mới',

    // Dashboard
    'dash.welcome': 'Xin chào,',
    'dash.welcome_sub': 'Dưới đây là tóm tắt tình hình tài chính của bạn trong tháng này.',
    'dash.total_income': 'Tổng thu nhập',
    'dash.total_expense': 'Tổng chi tiêu',
    'dash.net_balance': 'Số dư khả dụng',
    'dash.savings_rate': 'Tỷ lệ tích lũy',
    'dash.trend_title': 'Xu hướng Thu - Chi 6 tháng gần nhất',
    'dash.category_title': 'Cơ cấu chi tiêu theo danh mục',
    'dash.recent_transactions': 'Giao dịch gần đây',
    'dash.budget_overview': 'Tình trạng ngân sách tháng này',
    'dash.upcoming_bills': 'Khoản thanh toán sắp đến hạn',
    'dash.view_all': 'Xem tất cả',
    'dash.no_transactions': 'Chưa có giao dịch nào trong tháng này.',

    // Transactions
    'tx.title': 'Quản lý Giao dịch',
    'tx.subtitle': 'Thêm, tìm kiếm và phân loại các khoản thu chi của bạn',
    'tx.search_placeholder': 'Tìm kiếm theo mô tả, danh mục, ghi chú...',
    'tx.filter_all': 'Tất cả',
    'tx.filter_income': 'Thu nhập (+)',
    'tx.filter_expense': 'Chi tiêu (-)',
    'tx.all_categories': 'Tất cả danh mục',
    'tx.payment_method': 'Phương thức thanh toán',
    'tx.date': 'Ngày thực hiện',
    'tx.amount': 'Số tiền',
    'tx.category': 'Danh mục',
    'tx.description': 'Mô tả / Ghi chú',
    'tx.actions': 'Thao tác',
    'tx.add_new': 'Thêm khoản thu chi mới',
    'tx.edit': 'Chỉnh sửa giao dịch',
    'tx.delete_confirm': 'Bạn có chắc chắn muốn xóa giao dịch này không?',
    'tx.delete_success': 'Đã xóa giao dịch thành công',
    'tx.no_results': 'Không tìm thấy giao dịch nào phù hợp với bộ lọc.',

    // Budgets
    'bgt.title': 'Thiết lập & Kiểm soát Ngân sách',
    'bgt.subtitle': 'Giữ chi tiêu luôn trong tầm kiểm soát để đạt mục tiêu tài chính',
    'bgt.add_new': '+ Tạo ngân sách mới',
    'bgt.spent': 'Đã chi',
    'bgt.limit': 'Hạn mức',
    'bgt.remaining': 'Còn lại',
    'bgt.exceeded': 'Vượt ngân sách',
    'bgt.warning': 'Gần chạm mức cảnh báo',
    'bgt.safe': 'Trong tầm kiểm soát',
    'bgt.alert_threshold': 'Ngưỡng cảnh báo (%)',
    'bgt.no_budgets': 'Bạn chưa thiết lập ngân sách nào cho tháng này. Hãy bắt đầu ngay!',

    // Savings
    'svg.title': 'Mục tiêu Tiết kiệm',
    'svg.subtitle': 'Theo dõi tiến độ tích lũy cho những dự định quan trọng của bạn',
    'svg.add_new': '+ Tạo mục tiêu mới',
    'svg.target': 'Mục tiêu',
    'svg.accumulated': 'Đã tích lũy',
    'svg.deadline': 'Hạn chót',
    'svg.days_left': 'ngày còn lại',
    'svg.deposit': 'Gửi tiền vào',
    'svg.withdraw': 'Rút tiền',
    'svg.completed': 'Chúc mừng! Đã đạt mục tiêu',
    'svg.no_goals': 'Chưa có mục tiêu tiết kiệm nào. Hãy tạo mục tiêu đầu tiên của bạn!',

    // Recurring
    'rec.title': 'Hóa đơn & Chi trả định kỳ',
    'rec.subtitle': 'Nhắc nhở hóa đơn tiền điện, nước, tiền nhà, học phí, dịch vụ định kỳ',
    'rec.add_new': '+ Thêm khoản định kỳ',
    'rec.due_date': 'Ngày đến hạn',
    'rec.frequency': 'Chu kỳ',
    'rec.mark_paid': 'Đánh dấu đã thanh toán',
    'rec.overdue': 'Quá hạn',
    'rec.due_soon': 'Sắp đến hạn',
    'rec.auto_record': 'Tự động tạo giao dịch khi xác nhận thanh toán',

    // Reports
    'rep.title': 'Báo cáo Tài chính & Phân tích',
    'rep.subtitle': 'Đánh giá thói quen sử dụng tiền và hiệu quả quản lý chi tiêu',
    'rep.this_month': 'Tháng này',
    'rep.last_month': 'Tháng trước',
    'rep.this_year': 'Năm nay',
    'rep.custom': 'Tùy chọn',
    'rep.export_csv': 'Xuất CSV (Excel)',
    'rep.export_json': 'Xuất JSON',
    'rep.print': 'In báo cáo',
    'rep.insights_title': 'Đánh giá thói quen tài chính',
    'rep.top_expenses': 'Top 5 khoản chi tiêu lớn nhất',

    // General
    'common.save': 'Lưu thay đổi',
    'common.cancel': 'Hủy bỏ',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.success': 'Thành công',
    'common.error': 'Có lỗi xảy ra',
    'common.loading': 'Đang tải dữ liệu...',
    'common.currency': 'Tiền tệ',
    'common.demo_mode': 'Tài khoản thử nghiệm (Demo)',
    'common.logout': 'Đăng xuất',
    'common.login': 'Đăng nhập',
    'common.register': 'Đăng ký tài khoản'
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.budgets': 'Budgets',
    'nav.savings': 'Savings Goals',
    'nav.recurring': 'Recurring Bills',
    'nav.reports': 'Financial Reports',
    'nav.settings': 'Settings',
    'nav.add_transaction': '+ New Transaction',

    // Dashboard
    'dash.welcome': 'Welcome,',
    'dash.welcome_sub': "Here is your monthly financial summary and balance tracking.",
    'dash.total_income': 'Total Income',
    'dash.total_expense': 'Total Expenses',
    'dash.net_balance': 'Net Balance',
    'dash.savings_rate': 'Savings Rate',
    'dash.trend_title': '6-Month Income & Expense Trend',
    'dash.category_title': 'Expenses by Category',
    'dash.recent_transactions': 'Recent Transactions',
    'dash.budget_overview': 'Monthly Budget Status',
    'dash.upcoming_bills': 'Upcoming Bills & Payments',
    'dash.view_all': 'View All',
    'dash.no_transactions': 'No transactions recorded for this period.',

    // Transactions
    'tx.title': 'Transactions Manager',
    'tx.subtitle': 'Add, search, and categorize your income and expenses',
    'tx.search_placeholder': 'Search by description, category, tags...',
    'tx.filter_all': 'All',
    'tx.filter_income': 'Income (+)',
    'tx.filter_expense': 'Expense (-)',
    'tx.all_categories': 'All Categories',
    'tx.payment_method': 'Payment Method',
    'tx.date': 'Date',
    'tx.amount': 'Amount',
    'tx.category': 'Category',
    'tx.description': 'Description / Notes',
    'tx.actions': 'Actions',
    'tx.add_new': 'Record New Transaction',
    'tx.edit': 'Edit Transaction',
    'tx.delete_confirm': 'Are you sure you want to delete this transaction?',
    'tx.delete_success': 'Transaction deleted successfully',
    'tx.no_results': 'No transactions match the selected filters.',

    // Budgets
    'bgt.title': 'Budgeting & Spending Control',
    'bgt.subtitle': 'Keep expenses under control to meet your financial goals',
    'bgt.add_new': '+ Create New Budget',
    'bgt.spent': 'Spent',
    'bgt.limit': 'Budget Limit',
    'bgt.remaining': 'Remaining',
    'bgt.exceeded': 'Over Budget',
    'bgt.warning': 'Near Warning Limit',
    'bgt.safe': 'On Track',
    'bgt.alert_threshold': 'Alert Threshold (%)',
    'bgt.no_budgets': 'No budgets set for this month yet. Start now!',

    // Savings
    'svg.title': 'Savings Goals',
    'svg.subtitle': 'Track your accumulation progress toward major life goals',
    'svg.add_new': '+ Create Goal',
    'svg.target': 'Target',
    'svg.accumulated': 'Accumulated',
    'svg.deadline': 'Target Date',
    'svg.days_left': 'days left',
    'svg.deposit': 'Deposit Funds',
    'svg.withdraw': 'Withdraw',
    'svg.completed': 'Congratulations! Goal Achieved',
    'svg.no_goals': 'No savings goals created yet. Set your first goal!',

    // Recurring
    'rec.title': 'Recurring Bills & Subscriptions',
    'rec.subtitle': 'Manage electricity, rent, tuition, internet and subscriptions',
    'rec.add_new': '+ Add Recurring Bill',
    'rec.due_date': 'Due Day',
    'rec.frequency': 'Cycle',
    'rec.mark_paid': 'Mark as Paid',
    'rec.overdue': 'Overdue',
    'rec.due_soon': 'Due Soon',
    'rec.auto_record': 'Auto-record transaction upon payment confirmation',

    // Reports
    'rep.title': 'Financial Reports & Analytics',
    'rep.subtitle': 'Review spending habits and financial health metrics',
    'rep.this_month': 'This Month',
    'rep.last_month': 'Last Month',
    'rep.this_year': 'This Year',
    'rep.custom': 'Custom Range',
    'rep.export_csv': 'Export CSV',
    'rep.export_json': 'Export JSON',
    'rep.print': 'Print Report',
    'rep.insights_title': 'Financial Habits & Insights',
    'rep.top_expenses': 'Top 5 Largest Expenses',

    // General
    'common.save': 'Save Changes',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.success': 'Success',
    'common.error': 'An error occurred',
    'common.loading': 'Loading data...',
    'common.currency': 'Currency',
    'common.demo_mode': 'Demo Account',
    'common.logout': 'Sign Out',
    'common.login': 'Sign In',
    'common.register': 'Create Account'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'vi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[language][key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
