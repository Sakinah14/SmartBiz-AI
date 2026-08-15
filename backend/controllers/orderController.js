const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

// Add Order
const createOrder = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ owner: req.user.id })
      .populate("customer")
      .populate("products.product");

    const formatted = orders.map((o) => {
      const obj = o.toObject();
      obj.status = obj.status || obj.orderStatus || "Pending";
      return obj;
    });

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, orderStatus } = req.body;
    const newStatus = status || orderStatus;

    if (!newStatus) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findOne({ _id: req.params.id, owner: req.user.id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = newStatus;
    order.orderStatus = newStatus;
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, owner: req.user.id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
};