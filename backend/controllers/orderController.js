const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const catchAsync = require("../middleware/catchAsync");

// Add Order
const createOrder = catchAsync(async (req, res) => {
  const { customer, products, paymentMethod } = req.body;

  const existingCustomer = await Customer.findOne({ _id: customer, owner: req.user.id });
  if (!existingCustomer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  let totalAmount = 0;

  for (const item of products) {
    const product = await Product.findOne({ _id: item.product, user: req.user.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.quantity < item.quantity) {
      return res.status(400).json({ message: `${product.name} is out of stock` });
    }
    totalAmount += product.price * item.quantity;
  }

  // Reduce stock
  for (const item of products) {
    const product = await Product.findOne({ _id: item.product, user: req.user.id });
    product.quantity -= item.quantity;
    await product.save();
  }

  const orderProducts = await Promise.all(
    products.map(async (item) => {
      const product = await Product.findOne({ _id: item.product, user: req.user.id });
      return {
        product: item.product,
        quantity: item.quantity,
        price: product.price,
      };
    })
  );

  // Save Order with Pending default status
  const order = await Order.create({
    owner: req.user.id,
    customer,
    products: orderProducts,
    totalAmount,
    paymentMethod,
    status: "Pending",
    orderStatus: "Pending",
  });

  res.status(201).json({
    message: "Order created successfully",
    order,
  });
});

// Get All Orders
const getOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ owner: req.user.id })
    .populate("customer")
    .populate("products.product");

  const formatted = orders.map((o) => {
    const obj = o.toObject();
    obj.status = obj.status || obj.orderStatus || "Pending";
    return obj;
  });

  res.status(200).json(formatted);
});

// Update Order Status
const updateOrderStatus = catchAsync(async (req, res) => {
  const { status, orderStatus } = req.body;
  const newStatus = status || orderStatus;

  if (!newStatus) {
    return res.status(400).json({ message: "Status is required" });
  }

  const order = await Order.findOne({ _id: req.params.id, owner: req.user.id });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const wasCancelled = (order.status || order.orderStatus || "").toLowerCase() === "cancelled";
  const willBeCancelled = newStatus.toLowerCase() === "cancelled";

  // Restore reserved stock the first time an order is cancelled.
  if (willBeCancelled && !wasCancelled) {
    for (const item of order.products) {
      await Product.updateOne(
        { _id: item.product, user: req.user.id },
        { $inc: { quantity: item.quantity } }
      );
    }
  }

  order.status = newStatus;
  order.orderStatus = newStatus;
  await order.save();

  res.status(200).json({
    message: "Order status updated successfully",
    order,
  });
});

// Delete Order
const deleteOrder = catchAsync(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, owner: req.user.id });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Restore stock unless it was already returned when this order was cancelled.
  const alreadyCancelled = (order.status || order.orderStatus || "").toLowerCase() === "cancelled";
  if (!alreadyCancelled) {
    for (const item of order.products) {
      await Product.updateOne(
        { _id: item.product, user: req.user.id },
        { $inc: { quantity: item.quantity } }
      );
    }
  }

  await Order.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

  res.status(200).json({ message: "Order deleted successfully" });
});

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
};
