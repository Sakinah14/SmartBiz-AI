// Wraps an async route handler so a thrown/rejected error is forwarded to
// Express's error-handling middleware instead of crashing the process or
// needing a manual try/catch in every controller function.
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
