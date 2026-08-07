const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Expense = require("../models/Expense");

const getDashboard = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({
      user: req.user.id,
    });

    const totalCustomers = await Customer.countDocuments({
      owner: req.user.id,
    });

    const totalOrders = await Order.countDocuments({
      owner: req.user.id,
    });

    const orders = await Order.find({
      owner: req.user.id,
    });

    const expenses = await Expense.find({
      user: req.user.id,
    });

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
      totalProducts,
      totalCustomers,
      totalOrders,
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
  getDashboard,
};