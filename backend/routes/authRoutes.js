const express = require("express");
const router = express.Router();

const { registerUser, loginUser, forgotPassword, resetPassword } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const createRateLimiter = require("../middleware/rateLimiter");
const validateBody = require("../middleware/validate");

const resetRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many password reset requests. Please try again later.",
});

const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again later.",
});

router.post(
  "/register",
  validateBody({
    name: { required: true },
    email: { required: true, type: "email" },
  }),
  registerUser
);

router.post(
  "/login",
  loginRateLimiter,
  validateBody({
    email: { required: true, type: "email" },
    password: { required: true },
  }),
  loginUser
);

router.post("/forgot-password", resetRateLimiter, forgotPassword);

router.post("/reset-password", resetPassword);

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

module.exports = router;