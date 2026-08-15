const Customer = require("../models/Customer");

// Add Customer
const addCustomer = async (req, res) => {
  try {
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

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      owner: req.user.id,
    });

    res.status(200).json(customers);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// Update Customer
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, owner: req.user.id });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true }
    );

    res.status(200).json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// Delete Customer
const deleteCustomer = async (req, res) => {
  try {
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

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  addCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
};