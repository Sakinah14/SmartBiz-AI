const Expense = require("../models/Expense");
const catchAsync = require("../middleware/catchAsync");

// Add Expense
const addExpense = catchAsync(async (req, res) => {
  const {
    title,
    category,
    amount,
    date,
    description,
  } = req.body;

  const expense = await Expense.create({
    title,
    category,
    amount,
    date: date || undefined,
    description,
    user: req.user.id,
  });

  res.status(201).json({
    message: "Expense added successfully",
    expense,
  });
});

// Get All Expenses
const getExpenses = catchAsync(async (req, res) => {
  const expenses = await Expense.find({ user: req.user.id });

  res.status(200).json(expenses);
});

// Update Expense
const updateExpense = catchAsync(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });

  if (!expense) {
    return res.status(404).json({
      message: "Expense not found",
    });
  }

  const updatedExpense = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: "Expense updated successfully",
    expense: updatedExpense,
  });
});

// Delete Expense
const deleteExpense = catchAsync(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });

  if (!expense) {
    return res.status(404).json({
      message: "Expense not found",
    });
  }

  await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });

  res.status(200).json({
    message: "Expense deleted successfully",
  });
});

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};
