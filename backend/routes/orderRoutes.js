const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");

// Create Order
router.post("/", protect, createOrder);

// Get All Orders
router.get("/", protect, getOrders);

// Update Order Status
router.put("/:id", protect, updateOrderStatus);

router.delete("/:id", protect, deleteOrder);
module.exports = router;