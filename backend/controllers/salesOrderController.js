const SalesOrder = require('../models/SalesOrder');
const Quotation = require('../models/Quotation');

const createSalesOrder = async (req, res) => {
  try {
    const { customer, orderItems, discount = 0, tax = 0, quotationId } = req.body;
    
    if (!customer || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Customer and order items are required' });
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

    const salesOrder = await SalesOrder.create(salesOrderData);

    if (quotationId) {
      await Quotation.findByIdAndUpdate(quotationId, { status: 'ACCEPTED' });
    }

    const populatedOrder = await SalesOrder.findById(salesOrder._id)
      .populate('customer', 'name email phone')
      .populate('orderItems.product', 'name price sku');

    res.status(201).json(populatedOrder);
  } catch (error) {
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
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['DRAFT', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const salesOrder = await SalesOrder.findById(req.params.id);
    if (!salesOrder) return res.status(404).json({ message: 'Sales order not found' });

    // Business rule for status transitions
    const currentStatus = salesOrder.orderStatus;
    if (currentStatus === 'CANCELLED' || currentStatus === 'COMPLETED') {
      return res.status(400).json({ message: `Cannot change status from ${currentStatus}` });
    }

    salesOrder.orderStatus = orderStatus;
    await salesOrder.save();

    const updatedOrder = await SalesOrder.findById(salesOrder._id)
      .populate('customer', 'name email phone')
      .populate('orderItems.product', 'name price sku');

    res.json(updatedOrder);
  } catch (error) {
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
