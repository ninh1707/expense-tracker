import { TransactionModel, ITransaction } from '../models/Transaction';
import { BudgetModel } from '../models/Budget';
import { SavingsGoalModel } from '../models/SavingsGoal';

export class ReportService {
  static async getPeriodReport(userId: string, startDate?: string, endDate?: string) {
    const all = await TransactionModel.find({ userId });
    
    const now = new Date();
    const defaultStart = startDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const defaultEnd = endDate || now.toISOString().split('T')[0];

    const filtered = all.filter(t => t.date >= defaultStart && t.date <= defaultEnd);

    const totalIncome = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    // Calculate daily average expense
    const startObj = new Date(defaultStart);
    const endObj = new Date(defaultEnd);
    const dayDiff = Math.max(1, Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 3600 * 24)) + 1);
    const dailyAverageExpense = Math.round(totalExpense / dayDiff);

    // Group expenses by category
    const categoryMap: Record<string, { total: number; count: number }> = {};
    filtered.filter(t => t.type === 'expense').forEach(t => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { total: 0, count: 0 };
      }
      categoryMap[t.category].total += t.amount;
      categoryMap[t.category].count += 1;
    });

    const categoryAnalysis = Object.entries(categoryMap)
      .map(([category, info]) => ({
        category,
        total: info.total,
        count: info.count,
        percentage: totalExpense > 0 ? Math.round((info.total / totalExpense) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total);

    // Group by payment method
    const paymentMethodMap: Record<string, number> = {};
    filtered.forEach(t => {
      paymentMethodMap[t.paymentMethod] = (paymentMethodMap[t.paymentMethod] || 0) + t.amount;
    });

    // Top 5 largest expenses
    const topExpenses = [...filtered]
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Spending habit insights (evaluation)
    const insights: { type: 'positive' | 'warning' | 'info'; textVi: string; textEn: string }[] = [];

    if (savingsRate >= 20) {
      insights.push({
        type: 'positive',
        textVi: `Tỷ lệ tiết kiệm đạt ${savingsRate}% (mục tiêu chuẩn tài chính là trên 20%). Thói quen tích lũy của bạn rất tốt!`,
        textEn: `Savings rate reached ${savingsRate}% (standard benchmark is >20%). Excellent financial accumulation!`
      });
    } else if (savingsRate > 0) {
      insights.push({
        type: 'info',
        textVi: `Tỷ lệ tiết kiệm đạt ${savingsRate}%. Bạn có thể cân nhắc cắt giảm chi tiêu không thiết yếu để đạt mốc 20%.`,
        textEn: `Savings rate is ${savingsRate}%. Consider cutting non-essential spending to reach the 20% mark.`
      });
    } else {
      insights.push({
        type: 'warning',
        textVi: `Chi tiêu đang vượt quá thu nhập trong giai đoạn này (${Math.abs(netSavings).toLocaleString()} đ âm). Hãy kiểm tra lại ngân sách!`,
        textEn: `Expenses exceed income during this period. Please review your budget closely!`
      });
    }

    const foodBills = (categoryMap['food']?.total || 0) + (categoryMap['bills']?.total || 0);
    const essentialRatio = totalExpense > 0 ? Math.round((foodBills / totalExpense) * 100) : 0;
    if (essentialRatio > 70) {
      insights.push({
        type: 'info',
        textVi: `Chi phí thiết yếu (ăn uống, hóa đơn, nhà cửa) chiếm ${essentialRatio}% tổng chi tiêu.`,
        textEn: `Essential costs (food, bills, housing) account for ${essentialRatio}% of total spending.`
      });
    }

    const shoppingEntertainment = (categoryMap['shopping']?.total || 0) + (categoryMap['entertainment']?.total || 0);
    const leisureRatio = totalExpense > 0 ? Math.round((shoppingEntertainment / totalExpense) * 100) : 0;
    if (leisureRatio > 35) {
      insights.push({
        type: 'warning',
        textVi: `Chi tiêu cho mua sắm và giải trí chiếm ${leisureRatio}% tổng chi tiêu, hơi cao so với mức khuyến nghị (khoảng 20-30%).`,
        textEn: `Shopping and entertainment account for ${leisureRatio}% of spending, higher than recommended.`
      });
    }

    return {
      period: {
        startDate: defaultStart,
        endDate: defaultEnd,
        days: dayDiff
      },
      summary: {
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate,
        dailyAverageExpense,
        transactionCount: filtered.length
      },
      categoryAnalysis,
      paymentMethodMap,
      topExpenses,
      insights,
      transactions: filtered
    };
  }

  static async exportData(userId: string, format: 'json' | 'csv') {
    const transactions = await TransactionModel.find({ userId });
    const budgets = await BudgetModel.find({ userId });
    const goals = await SavingsGoalModel.find({ userId });

    if (format === 'json') {
      return {
        exportedAt: new Date().toISOString(),
        transactions,
        budgets,
        savingsGoals: goals
      };
    }

    // CSV format for transactions
    const headers = ['Mã giao dịch', 'Loại', 'Số tiền', 'Danh mục', 'Ngày', 'Phương thức', 'Mô tả'];
    const rows = transactions.map(t => [
      t._id,
      t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
      t.amount,
      t.category,
      t.date,
      t.paymentMethod,
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    return csvContent;
  }
}
