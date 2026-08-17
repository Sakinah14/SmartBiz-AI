const multer = require("multer");

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB — matches the existing product-image upload limit
  fileFilter: (req, file, cb) => {
    const isCsv = file.mimetype === "text/csv" || file.originalname.toLowerCase().endsWith(".csv");
    if (!isCsv) return cb(new Error("Only CSV files are allowed"));
    cb(null, true);
  },
});

// Wraps multer so its errors (wrong file type, file too large) come back as
// a normal 400 JSON response instead of an uncaught error.
const uploadCsv = (fieldName) => (req, res, next) => {
  multerUpload.single(fieldName)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

module.exports = uploadCsv;
