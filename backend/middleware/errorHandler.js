// Centralized error handler. Every controller wrapped in catchAsync funnels
// its errors here instead of hand-writing `res.status(500).json(...)`
// individually — this is what maps Mongoose's own error types to the
// correct HTTP status instead of a blanket 500.
//
// Must be registered last, after all routes, and must keep all four
// parameters (err, req, res, next) — Express only treats a middleware as an
// error handler when it has exactly this arity.
const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ message: `That ${field} is already in use` });
  }

  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || "Internal server error" });
};

module.exports = errorHandler;
