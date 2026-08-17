const Order = require("../models/Order");
const Expense = require("../models/Expense");
const catchAsync = require("../middleware/catchAsync");

const getReport = catchAsync(async (req, res) => {
  const orders = await Order.find({ owner: req.user.id });
  const expenses = await Expense.find({ user: req.user.id });

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const profit = totalRevenue - totalExpenses;

  res.status(200).json({
    totalRevenue,
    totalExpenses,
    profit,
  });
});

module.exports = {
  getReport,
};
