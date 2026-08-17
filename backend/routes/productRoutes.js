const express = require("express");
const router = express.Router();

const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  importProducts,
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");
const uploadCsv = require("../middleware/uploadCsv");

router.post("/", protect, addProduct);
router.get("/", protect, getProducts);
router.post("/import", protect, uploadCsv("file"), importProducts);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;