const express = require("express");
const router = express.Router();

const { getCustomerSegments } = require("../controllers/customerSegmentController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getCustomerSegments);

module.exports = router;
