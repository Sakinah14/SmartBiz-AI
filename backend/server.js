const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const aiRoutes = require("./routes/aiRoutes");
const decisionEventRoutes = require("./routes/decisionEventRoutes");
const customerSegmentRoutes = require("./routes/customerSegmentRoutes");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Connect Database
connectDB();

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    // Allow requests with no Origin header (server-to-server, curl, mobile
    // clients). Disallowed browser origins get no CORS headers — cors()
    // still calls next() so the response isn't a noisy 500, it's just
    // unreadable by browser JS from that origin.
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/decision-events", decisionEventRoutes);
app.use("/api/customer-segments", customerSegmentRoutes);
app.get("/", (req, res) => {
  res.send("🚀 SmartBiz AI Backend Running");
});

// Must be registered after all routes — this is what actually receives
// errors forwarded by catchAsync().
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});