const express = require("express");
const router = express.Router();

const { getTimeline, updateEventStatus } = require("../controllers/decisionEventController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getTimeline);
router.patch("/:id", protect, updateEventStatus);

module.exports = router;
