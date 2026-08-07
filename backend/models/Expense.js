const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Rent", "Salary", "Utilities", "Electricity", "Internet",
        "Marketing", "Supplies", "Transport", "Other",
        "rent", "salary", "utilities", "electricity", "internet",
        "marketing", "supplies", "transport", "other"
      ],
      default: "Other",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expense", expenseSchema);