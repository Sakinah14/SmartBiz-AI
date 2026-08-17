const { parse } = require("csv-parse/sync");
const Product = require("../models/Product");
const catchAsync = require("../middleware/catchAsync");

const MAX_IMPORT_ROWS = 500;

// Add Product
const addProduct = catchAsync(async (req, res) => {
  const {
    name,
    category,
    price,
    quantity,
    description,
    imageUrl
  } = req.body;

  const product = await Product.create({
    name,
    category,
    price,
    quantity,
    description,
    imageUrl,
    user: req.user.id,
  });

  res.status(201).json({
    message: "Product added successfully",
    product,
  });
});

const getProducts = catchAsync(async (req, res) => {
  const products = await Product.find({ user: req.user.id });

  res.status(200).json(products);
});

// Update Product
const updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, user: req.user.id });

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const updatedProduct = await Product.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: "Product updated successfully",
    product: updatedProduct,
  });
});

// Delete Product
const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, user: req.user.id });

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  await Product.findOneAndDelete({ _id: req.params.id, user: req.user.id });

  res.status(200).json({
    message: "Product deleted successfully",
  });
});

// Import Products from CSV — expects a header row with name,category,price,quantity[,description]
const importProducts = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  let rows;
  try {
    rows = parse(req.file.buffer.toString("utf-8"), {
      columns: (header) => header.map((h) => h.trim().toLowerCase()),
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    return res.status(400).json({ message: `Could not parse CSV: ${err.message}` });
  }

  if (rows.length === 0) {
    return res.status(400).json({ message: "CSV file has no data rows" });
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return res.status(400).json({ message: `CSV has ${rows.length} rows — the limit is ${MAX_IMPORT_ROWS}` });
  }

  const toInsert = [];
  const errors = [];

  rows.forEach((row, i) => {
    const rowNum = i + 2; // account for the header row, 1-indexed
    const name = (row.name || "").trim();
    const category = (row.category || "").trim();
    const price = Number(row.price);
    const quantity = Number(row.quantity);
    const description = (row.description || "").trim();

    if (!name) {
      errors.push(`Row ${rowNum}: missing name`);
      return;
    }
    if (!category) {
      errors.push(`Row ${rowNum}: missing category`);
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      errors.push(`Row ${rowNum}: invalid price "${row.price}"`);
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      errors.push(`Row ${rowNum}: invalid quantity "${row.quantity}"`);
      return;
    }

    toInsert.push({ name, category, price, quantity, description, user: req.user.id });
  });

  let inserted = [];
  if (toInsert.length > 0) {
    inserted = await Product.insertMany(toInsert);
  }

  res.status(200).json({
    message: `Imported ${inserted.length} of ${rows.length} row${rows.length !== 1 ? "s" : ""}`,
    imported: inserted.length,
    skipped: errors.length,
    errors: errors.slice(0, 20),
  });
});

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  importProducts,
};
