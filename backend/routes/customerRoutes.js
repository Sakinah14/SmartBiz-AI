const express = require("express");
const router = express.Router();

const {
  addCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const protect = require("../middleware/authMiddleware");

// Add Customer
router.post("/", protect, addCustomer);

// Get All Customers
router.get("/", protect, getCustomers);
router.put("/:id", protect, updateCustomer);
router.delete("/:id", protect, deleteCustomer);

module.exports = router;