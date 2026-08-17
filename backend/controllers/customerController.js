const Customer = require("../models/Customer");
const catchAsync = require("../middleware/catchAsync");

// Add Customer
const addCustomer = catchAsync(async (req, res) => {
  const { name, phone, email, address } = req.body;

  const customer = await Customer.create({
    name,
    phone,
    email,
    address,
    owner: req.user.id,
  });

  res.status(201).json({
    message: "Customer added successfully",
    customer,
  });
});

// Get All Customers
const getCustomers = catchAsync(async (req, res) => {
  const customers = await Customer.find({
    owner: req.user.id,
  });

  res.status(200).json(customers);
});

// Update Customer
const updateCustomer = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, owner: req.user.id });

  if (!customer) {
    return res.status(404).json({
      message: "Customer not found",
    });
  }

  const updatedCustomer = await Customer.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: "Customer updated successfully",
    customer: updatedCustomer,
  });
});

// Delete Customer
const deleteCustomer = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, owner: req.user.id });

  if (!customer) {
    return res.status(404).json({
      message: "Customer not found",
    });
  }

  await Customer.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

  res.status(200).json({
    message: "Customer deleted successfully",
  });
});

module.exports = {
  addCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
};
