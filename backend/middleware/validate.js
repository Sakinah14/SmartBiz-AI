// Small, dependency-free request-body validator. Not a general-purpose
// schema library — just enough to reject obviously malformed requests
// (missing fields, wrong type, bad email format) before they reach a
// controller or the database, with a clear 400 instead of a confusing
// downstream failure.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateBody(rules) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body ? req.body[field] : undefined;
      const isEmpty = value === undefined || value === null || value === "";

      if (rule.required && isEmpty) {
        errors.push(`${field} is required`);
        continue;
      }
      if (isEmpty) continue;

      if (rule.type === "number" && typeof value !== "number") {
        errors.push(`${field} must be a number`);
      } else if (rule.type === "email" && typeof value === "string" && !EMAIL_RE.test(value)) {
        errors.push(`${field} must be a valid email address`);
      } else if (rule.type === "number" && typeof value === "number" && rule.min !== undefined && value < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    next();
  };
}

module.exports = validateBody;
