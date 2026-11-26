const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const StockMovement = require('../models/StockMovement');

const getProducts = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (category) query.category = category;
    if (status && status !== 'ALL') query.status = status;

    let products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name companyName')
      .sort({ createdAt: -1 });

    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.SKU.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description')
      .populate('supplier', 'name email phone companyName address');

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      SKU,
      description,
      category,
      supplier,
      purchasePrice,
      sellingPrice,
      currentStock = 0,
      minimumStockLevel = 5,
      status
    } = req.body;

    if (!name || !SKU || !category || !supplier || purchasePrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({ message: 'Name, SKU, category, supplier, purchase price, and selling price are required' });
    }

    if (purchasePrice < 0 || sellingPrice < 0 || currentStock < 0 || minimumStockLevel < 0) {
      return res.status(400).json({ message: 'Prices and stock values cannot be negative' });
    }

    const existingSKU = await Product.findOne({ SKU: SKU.trim() });
    if (existingSKU) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    const catExists = await Category.findById(category);
    if (!catExists) return res.status(400).json({ message: 'Invalid category reference' });

    const supExists = await Supplier.findById(supplier);
    if (!supExists) return res.status(400).json({ message: 'Invalid supplier reference' });

    const product = await Product.create({
      name,
      SKU: SKU.trim(),
      description,
      category,
      supplier,
      purchasePrice,
      sellingPrice,
      currentStock,
      minimumStockLevel,
      status
    });

    // If initial stock > 0, create stock movement
    if (currentStock > 0) {
      await StockMovement.create({
        product: product._id,
        movementType: 'STOCK_IN',
        quantity: currentStock,
        previousStock: 0,
        newStock: currentStock,
        referenceDocument: 'INITIAL_STOCK',
        createdBy: req.user._id,
        remarks: 'Initial stock creation'
      });
    }

    const populated = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('supplier', 'name companyName');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      name,
      SKU,
      description,
      category,
      supplier,
      purchasePrice,
      sellingPrice,
      minimumStockLevel,
      status
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (SKU && SKU.trim() !== product.SKU) {
      const existingSKU = await Product.findOne({ SKU: SKU.trim() });
      if (existingSKU) {
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }
      product.SKU = SKU.trim();
    }

    if (category) {
      const catExists = await Category.findById(category);
      if (!catExists) return res.status(400).json({ message: 'Invalid category reference' });
      product.category = category;
    }

    if (supplier) {
      const supExists = await Supplier.findById(supplier);
      if (!supExists) return res.status(400).json({ message: 'Invalid supplier reference' });
      product.supplier = supplier;
    }

    if (purchasePrice !== undefined) {
      if (purchasePrice < 0) return res.status(400).json({ message: 'Purchase price cannot be negative' });
      product.purchasePrice = purchasePrice;
    }

    if (sellingPrice !== undefined) {
      if (sellingPrice < 0) return res.status(400).json({ message: 'Selling price cannot be negative' });
      product.sellingPrice = sellingPrice;
    }

    if (minimumStockLevel !== undefined) {
      if (minimumStockLevel < 0) return res.status(400).json({ message: 'Minimum stock level cannot be negative' });
      product.minimumStockLevel = minimumStockLevel;
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (status !== undefined) product.status = status;

    await product.save();

    const populated = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('supplier', 'name companyName');

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
