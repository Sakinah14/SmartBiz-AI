const { GoogleGenerativeAI } = require("@google/generative-ai");
const Order = require("../models/Order");
const Expense = require("../models/Expense");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        message: "Gemini API key is missing. Please add GEMINI_API_KEY to backend/.env",
      });
    }

    // Gather business context safely
    const userId = req.user?.id;
    const orders = userId ? await Order.find({ owner: userId }) : [];
    const expenses = userId ? await Expense.find({ user: userId }) : [];
    const products = userId ? await Product.find({ user: userId }) : [];
    const customers = userId ? await Customer.find({ owner: userId }) : [];

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const profit = totalRevenue - totalExpenses;

    const businessContext = `
You are SmartBiz AI, an intelligent business assistant. Here is the current business data:
- Total Orders: ${orders.length}
- Total Revenue: ₹${totalRevenue.toFixed(2)}
- Total Expenses: ₹${totalExpenses.toFixed(2)}
- Net Profit: ₹${profit.toFixed(2)}
- Total Products: ${products.length}
- Total Customers: ${customers.length}
- Low Stock Products: ${products.filter((p) => p.quantity <= 5).length}

Respond concisely and helpfully to the following question about the business:
User: ${message}
    `.trim();

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try gemini-flash-latest first, then fallback model
    let responseText = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(businessContext);
      responseText = result.response.text();
    } catch (modelErr) {
      console.warn("gemini-flash-latest failed, trying gemini-flash-lite-latest:", modelErr.message);
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      const result = await fallbackModel.generateContent(businessContext);
      responseText = result.response.text();
    }

    res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error("AI Controller Error:", error.message);
    res.status(500).json({
      message: `AI service error: ${error.message}`,
      error: error.message,
    });
  }
};

module.exports = { chat };
