const Order = require("../models/Order");
const Expense = require("../models/Expense");

const getReport = async (req, res) => {
  try {
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

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getReport,
};