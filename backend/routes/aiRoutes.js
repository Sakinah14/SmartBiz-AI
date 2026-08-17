const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");
const createRateLimiter = require("../middleware/rateLimiter");

// Keyed by user, not IP — every request here is already authenticated, and
// the point is capping how much of the Gemini quota one account can spend.
const aiChatRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "You're sending messages too quickly. Please wait a few minutes and try again.",
  keyFn: (req) => req.user?.id || req.ip || "unknown",
});

router.post("/chat", protect, aiChatRateLimiter, chat);

module.exports = router;
