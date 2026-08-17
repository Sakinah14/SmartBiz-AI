// Populates a demo account with realistic sample data so the app can be
// evaluated immediately without manual data entry. Safe to re-run — it
// wipes only the data owned by the fixed demo account before recreating it.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Expense = require("../models/Expense");
const DecisionEvent = require("../models/DecisionEvent");

const DEMO_EMAIL = "demo@smartbiz.ai";
const DEMO_PASSWORD = "Demo@12345";

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    console.log("Removing existing demo account data...");
    await Promise.all([
      Product.deleteMany({ user: existing._id }),
      Customer.deleteMany({ owner: existing._id }),
      Order.deleteMany({ owner: existing._id }),
      Expense.deleteMany({ user: existing._id }),
      DecisionEvent.deleteMany({ owner: existing._id }),
      User.deleteOne({ _id: existing._id }),
    ]);
  }

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await User.create({ name: "Demo Owner", email: DEMO_EMAIL, password: hashedPassword });
  console.log("Created demo user:", DEMO_EMAIL);

  const productDefs = [
    { name: "Wireless Mouse", category: "Electronics", price: 799, quantity: 60 },
    { name: "Mechanical Keyboard", category: "Electronics", price: 3499, quantity: 25 },
    { name: "USB-C Hub", category: "Electronics", price: 1299, quantity: 4 },
    { name: "Laptop Stand", category: "Accessories", price: 1899, quantity: 18 },
    { name: "Desk Lamp", category: "Home", price: 999, quantity: 0 },
    { name: "Notebook Set", category: "Stationery", price: 349, quantity: 120 },
    { name: "Ceramic Mug", category: "Home", price: 449, quantity: 3 },
    { name: "Bluetooth Speaker", category: "Electronics", price: 2199, quantity: 32 },
  ];
  const products = await Product.insertMany(
    productDefs.map((p) => ({ ...p, user: user._id }))
  );
  console.log(`Created ${products.length} products`);

  const customerDefs = [
    { name: "Ananya Rao", phone: "9876543210", email: "ananya@example.com", address: "Bengaluru, KA" },
    { name: "Vikram Singh", phone: "9123456780", email: "vikram@example.com", address: "Delhi, DL" },
    { name: "Priya Nair", phone: "9988776655", email: "priya@example.com", address: "Kochi, KL" },
    { name: "Rahul Mehta", phone: "9765432109", email: "rahul@example.com", address: "Pune, MH" },
    { name: "Sana Sheikh", phone: "9012345678", email: "sana@example.com", address: "Hyderabad, TS" },
  ];
  const customers = await Customer.insertMany(
    customerDefs.map((c) => ({ ...c, owner: user._id }))
  );
  console.log(`Created ${customers.length} customers`);

  const paymentMethods = ["Cash", "UPI", "Credit Card", "Debit Card", "Bank Transfer"];
  const orderPlan = [
    { productIdx: 0, qty: 3, status: "Completed", daysBack: 55 },
    { productIdx: 1, qty: 2, status: "Completed", daysBack: 48 },
    { productIdx: 7, qty: 4, status: "Completed", daysBack: 40 },
    { productIdx: 0, qty: 5, status: "Completed", daysBack: 30 },
    { productIdx: 3, qty: 1, status: "Completed", daysBack: 22 },
    { productIdx: 7, qty: 2, status: "Completed", daysBack: 15 },
    { productIdx: 1, qty: 1, status: "Completed", daysBack: 8 },
    { productIdx: 0, qty: 2, status: "Completed", daysBack: 3 },
    { productIdx: 2, qty: 1, status: "Pending", daysBack: 6 },
    { productIdx: 6, qty: 1, status: "Processing", daysBack: 4 },
    { productIdx: 5, qty: 6, status: "Cancelled", daysBack: 20 },
  ];

  const orders = [];
  for (let i = 0; i < orderPlan.length; i++) {
    const plan = orderPlan[i];
    const product = products[plan.productIdx];
    const customer = customers[i % customers.length];
    const totalAmount = product.price * plan.qty;
    const createdAt = daysAgo(plan.daysBack);

    orders.push({
      owner: user._id,
      customer: customer._id,
      products: [{ product: product._id, quantity: plan.qty, price: product.price }],
      totalAmount,
      paymentMethod: paymentMethods[i % paymentMethods.length],
      status: plan.status,
      orderStatus: plan.status,
      createdAt,
      updatedAt: createdAt,
    });
  }
  const createdOrders = await Order.insertMany(orders);
  console.log(`Created ${createdOrders.length} orders`);

  const expenseDefs = [
    { title: "Office Rent", category: "Rent", amount: 25000, daysBack: 50 },
    { title: "Staff Salary", category: "Salary", amount: 60000, daysBack: 45 },
    { title: "Electricity Bill", category: "Electricity", amount: 3200, daysBack: 35 },
    { title: "Internet Subscription", category: "Internet", amount: 1499, daysBack: 30 },
    { title: "Social Media Ads", category: "Marketing", amount: 8000, daysBack: 18 },
    { title: "Packaging Supplies", category: "Supplies", amount: 4500, daysBack: 10 },
    { title: "Courier & Transport", category: "Transport", amount: 2200, daysBack: 5 },
  ];
  const expenses = await Expense.insertMany(
    expenseDefs.map((e) => ({
      ...e,
      date: daysAgo(e.daysBack),
      user: user._id,
    }))
  );
  console.log(`Created ${expenses.length} expenses`);

  console.log("\nSeed complete. Log in with:");
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
