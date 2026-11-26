const Supplier = require('../models/Supplier');

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, companyName, address, status } = req.body;
    if (!name || !email || !phone || !companyName) {
      return res.status(400).json({ message: 'Name, email, phone, and company name are required' });
    }

    const existing = await Supplier.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Supplier with this email already exists' });
    }

    const supplier = await Supplier.create({ name, email, phone, companyName, address, status });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { name, email, phone, companyName, address, status } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    if (email && email.toLowerCase() !== supplier.email) {
      const existing = await Supplier.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: 'Supplier with this email already exists' });
      }
      supplier.email = email.toLowerCase();
    }

    if (name !== undefined) supplier.name = name;
    if (phone !== undefined) supplier.phone = phone;
    if (companyName !== undefined) supplier.companyName = companyName;
    if (address !== undefined) supplier.address = address;
    if (status !== undefined) supplier.status = status;

    await supplier.save();
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    // Check if any product is using this supplier
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ supplier: supplier._id });
    if (productCount > 0) {
      return res.status(400).json({ message: 'Cannot delete supplier with associated products' });
    }

    await supplier.deleteOne();
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
