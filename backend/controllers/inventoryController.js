const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { logActivity } = require('./activityLogController');
const mongoose = require('mongoose');

const stockIn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { productId, quantity, referenceDocument, remarks } = req.body;

    if (!productId || quantity === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Quantity must be greater than zero' });
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousStock = product.currentStock;
    const newStock = previousStock + qty;

    product.currentStock = newStock;
    await product.save({ session });

    const movement = await StockMovement.create([{
      product: product._id,
      movementType: 'STOCK_IN',
      quantity: qty,
      previousStock,
      newStock,
      referenceDocument: referenceDocument || 'MANUAL_STOCK_IN',
      createdBy: req.user._id,
      remarks: remarks || 'Stock In operation'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    await logActivity(req.user._id, 'CREATE', 'INVENTORY', `Stock in for product ${product.name}`, { entityType: 'Product', entityId: product._id });

    // Check for low stock and notify managers
    if (product.currentStock <= product.minimumStockLevel) {
      const managers = await User.find({ role: 'INVENTORY_MANAGER' });
      for (const manager of managers) {
        await Notification.create({
          user: manager._id,
          title: 'Low Inventory Alert',
          message: `Product ${product.name} is low on stock: ${product.currentStock}`,
          type: 'INVENTORY',
          relatedEntity: { entityType: 'Product', entityId: product._id }
        });
      }
    }

    const populated = await StockMovement.findById(movement[0]._id)
      .populate('product', 'name SKU currentStock')
      .populate('createdBy', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

const stockOut = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { productId, quantity, referenceDocument, remarks } = req.body;

    if (!productId || quantity === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Quantity must be greater than zero' });
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousStock = product.currentStock;
    if (previousStock < qty) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: `Insufficient stock. Current stock is ${previousStock}, requested ${qty}` });
    }

    const newStock = previousStock - qty;
    product.currentStock = newStock;
    await product.save({ session });

    const movement = await StockMovement.create([{
      product: product._id,
      movementType: 'STOCK_OUT',
      quantity: qty,
      previousStock,
      newStock,
      referenceDocument: referenceDocument || 'MANUAL_STOCK_OUT',
      createdBy: req.user._id,
      remarks: remarks || 'Stock Out operation'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    await logActivity(req.user._id, 'CREATE', 'INVENTORY', `Stock out for product ${product.name}`, { entityType: 'Product', entityId: product._id });

    // Check for low stock and notify managers
    if (product.currentStock <= product.minimumStockLevel) {
      const managers = await User.find({ role: 'INVENTORY_MANAGER' });
      for (const manager of managers) {
        await Notification.create({
          user: manager._id,
          title: 'Low Inventory Alert',
          message: `Product ${product.name} is low on stock: ${product.currentStock}`,
          type: 'INVENTORY',
          relatedEntity: { entityType: 'Product', entityId: product._id }
        });
      }
    }

    const populated = await StockMovement.findById(movement[0]._id)
      .populate('product', 'name SKU currentStock')
      .populate('createdBy', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

const getStockMovements = async (req, res) => {
  try {
    const { productId, movementType, startDate, endDate } = req.query;
    let query = {};

    if (productId) query.product = productId;
    if (movementType && movementType !== 'ALL') query.movementType = movementType;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const movements = await StockMovement.find(query)
      .populate('product', 'name SKU currentStock')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLowStockAlerts = async (req, res) => {
  try {
    // Find products where currentStock <= minimumStockLevel
    const products = await Product.find({
      $expr: { $lte: ['$currentStock', '$minimumStockLevel'] },
      status: 'ACTIVE'
    })
      .populate('category', 'name')
      .populate('supplier', 'name companyName phone email')
      .sort({ currentStock: 1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  stockIn,
  stockOut,
  getStockMovements,
  getLowStockAlerts
};
