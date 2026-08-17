// Shared business-analytics helpers used by Dashboard and Reports so both
// pages compute monthly revenue/expense/profit trends the same way, from
// real order and expense records instead of hardcoded sample data.

/**
 * Buckets orders and expenses into the last `monthCount` calendar months
 * (oldest first) and sums revenue (order totalAmount) and expenses
 * (expense amount) per month. Revenue matches the same definition already
 * used by the backend's /dashboard and /reports endpoints: the sum of
 * totalAmount across all orders, regardless of status.
 */
export function getMonthlySeries(orders = [], expenses = [], monthCount = 6) {
  const now = new Date();
  const months = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }

  const revenueByKey = {};
  orders.forEach((order) => {
    if (!order.createdAt) return;
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    revenueByKey[key] = (revenueByKey[key] || 0) + (order.totalAmount || 0);
  });

  const expensesByKey = {};
  expenses.forEach((expense) => {
    const raw = expense.date || expense.createdAt;
    if (!raw) return;
    const d = new Date(raw);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    expensesByKey[key] = (expensesByKey[key] || 0) + (expense.amount || 0);
  });

  return months.map(({ key, label }) => {
    const revenue = revenueByKey[key] || 0;
    const monthExpenses = expensesByKey[key] || 0;
    return {
      month: label,
      revenue,
      expenses: monthExpenses,
      profit: revenue - monthExpenses,
    };
  });
}

/**
 * Compares this-period-vs-last-period from a monthly series and returns a
 * { trend, trendValue } pair ready to pass to StatCard.
 */
export function computeTrend(current, previous) {
  if (!previous) {
    if (!current) return { trend: "up", trendValue: "0%" };
    return { trend: "up", trendValue: "New" };
  }
  const pct = ((current - previous) / previous) * 100;
  const trend = pct >= 0 ? "up" : "down";
  const trendValue = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  return { trend, trendValue };
}
