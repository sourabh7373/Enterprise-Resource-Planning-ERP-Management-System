const SalesOrder = require('../models/SalesOrder');
const Quotation = require('../models/Quotation');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { logActivity } = require('./activityLogController');
const mongoose = require('mongoose');

const createSalesOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customer, orderItems, discount = 0, tax = 0, quotationId } = req.body;
    
    if (!customer || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Customer and order items are required' });
    }

    // Validate product availability before creating sales order
    for (const item of orderItems) {
      const qty = Number(item.quantity) || 0;
      if (qty <= 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Order item quantity must be greater than zero' });
      }
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      if (product.currentStock < qty) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Insufficient stock for product ${product.name}. Current stock: ${product.currentStock}, requested: ${qty}` });
      }
    }

    let subtotal = 0;
    const processedItems = orderItems.map(item => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      subtotal += qty * price;
      return {
        product: item.product,
        quantity: qty,
        unitPrice: price
      };
    });

    const parsedDiscount = Number(discount) || 0;
    const parsedTax = Number(tax) || 0;
    const grandTotal = Math.max(0, subtotal - parsedDiscount + parsedTax);
    const orderNumber = `SO-${Date.now()}`;
    
    const salesOrderData = {
      orderNumber,
      customer,
      orderItems: processedItems,
      subtotal,
      discount: parsedDiscount,
      tax: parsedTax,
      grandTotal,
      orderStatus: 'DRAFT',
      createdBy: req.user._id
    };

    if (quotationId) {
      salesOrderData.quotation = quotationId;
    }

    const salesOrder = await SalesOrder.create([salesOrderData], { session });

    if (quotationId) {
      await Quotation.findByIdAndUpdate(quotationId, { status: 'ACCEPTED' }).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    await logActivity(req.user._id, 'CREATE', 'SALES_ORDER', `Created sales order ${salesOrder[0].orderNumber}`, { entityType: 'SalesOrder', entityId: salesOrder[0]._id });

    const populatedOrder = await SalesOrder.findById(salesOrder[0]._id)
      .populate('customer', 'name email phone')
      .populate('orderItems.product', 'name price sku');

    res.status(201).json(populatedOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

const getSalesOrders = async (req, res) => {
  try {
    const { search, status, startDate, endDate } = req.query;
    let query = {};

    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let salesOrders = await SalesOrder.find(query)
      .populate('customer', 'name email phone')
      .populate('orderItems.product', 'name price sku')
      .sort({ createdAt: -1 });

    if (search) {
      const searchLower = search.toLowerCase();
      salesOrders = salesOrders.filter(o => 
        o.orderNumber.toLowerCase().includes(searchLower) ||
        (o.customer && o.customer.name && o.customer.name.toLowerCase().includes(searchLower))
      );
    }

    res.json(salesOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSalesOrderById = async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('orderItems.product', 'name price sku description')
      .populate('createdBy', 'name email')
      .populate('quotation', 'quotationNumber');

    if (!salesOrder) return res.status(404).json({ message: 'Sales order not found' });
    res.json(salesOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['DRAFT', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(orderStatus)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const salesOrder = await SalesOrder.findById(req.params.id).session(session);
    if (!salesOrder) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Sales order not found' });
    }

    const currentStatus = salesOrder.orderStatus;
    if (currentStatus === 'CANCELLED' || currentStatus === 'COMPLETED') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: `Cannot change status from ${currentStatus}` });
    }

    // Inventory integration rules:
    // When transitioning from DRAFT/CONFIRMED to PROCESSING or COMPLETED, deduct inventory if not already deducted.
    // To prevent duplicate deductions, we can check if stock movements for this sales order reference already exist.
    const movingToFulfilled = (orderStatus === 'PROCESSING' || orderStatus === 'COMPLETED') && currentStatus !== 'PROCESSING' && currentStatus !== 'COMPLETED';
    const movingToCancelled = orderStatus === 'CANCELLED';

    if (movingToFulfilled) {
      // Check if ORDER_DEDUCTION already exists for this order
      const existingDeduction = await StockMovement.findOne({ referenceDocument: salesOrder.orderNumber, movementType: 'ORDER_DEDUCTION' }).session(session);
      if (!existingDeduction) {
        // Validate stock and deduct
        for (const item of salesOrder.orderItems) {
          const product = await Product.findById(item.product).session(session);
          if (!product) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: `Product not found: ${item.product}` });
          }
          if (product.currentStock < item.quantity) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `Insufficient stock for product ${product.name}. Current stock: ${product.currentStock}, required: ${item.quantity}` });
          }
          const previousStock = product.currentStock;
          const newStock = previousStock - item.quantity;
          product.currentStock = newStock;
          await product.save({ session });

          await StockMovement.create([{
            product: product._id,
            movementType: 'ORDER_DEDUCTION',
            quantity: item.quantity,
            previousStock,
            newStock,
            referenceDocument: salesOrder.orderNumber,
            createdBy: req.user._id,
            remarks: `Order deduction for ${salesOrder.orderNumber}`
          }], { session });
        }
      }
    } else if (movingToCancelled) {
      // If order was previously PROCESSING or COMPLETED (meaning inventory was deducted), restore stock upon cancellation
      const wasDeducted = currentStatus === 'PROCESSING' || currentStatus === 'COMPLETED' || await StockMovement.findOne({ referenceDocument: salesOrder.orderNumber, movementType: 'ORDER_DEDUCTION' }).session(session);
      
      // Check if already restored
      const alreadyRestored = await StockMovement.findOne({ referenceDocument: salesOrder.orderNumber, movementType: 'ORDER_RESTORE' }).session(session);

      if (wasDeducted && !alreadyRestored) {
        for (const item of salesOrder.orderItems) {
          const product = await Product.findById(item.product).session(session);
          if (product) {
            const previousStock = product.currentStock;
            const newStock = previousStock + item.quantity;
            product.currentStock = newStock;
            await product.save({ session });

            await StockMovement.create([{
              product: product._id,
              movementType: 'ORDER_RESTORE',
              quantity: item.quantity,
              previousStock,
              newStock,
              referenceDocument: salesOrder.orderNumber,
              createdBy: req.user._id,
              remarks: `Order cancellation stock restore for ${salesOrder.orderNumber}`
            }], { session });
          }
        }
      }
    }

    salesOrder.orderStatus = orderStatus;
    await salesOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    const updatedOrder = await SalesOrder.findById(salesOrder._id)
      .populate('customer', 'name email phone')
      .populate('orderItems.product', 'name price sku');

    res.json(updatedOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

const getCustomerOrderHistory = async (req, res) => {
  try {
    const salesOrders = await SalesOrder.find({ customer: req.params.customerId })
      .populate('customer', 'name')
      .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 });
    res.json(salesOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  updateOrderStatus,
  getCustomerOrderHistory
};
