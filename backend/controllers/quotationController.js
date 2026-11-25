const Quotation = require('../models/Quotation');
const SalesOrder = require('../models/SalesOrder');

const createQuotation = async (req, res) => {
  try {
    const { customer, products, discount, tax, validUntil } = req.body;
    
    let subtotal = 0;
    products.forEach(item => {
      subtotal += item.quantity * item.unitPrice;
    });
    
    const grandTotal = subtotal - discount + tax;
    const quotationNumber = `QT-${Date.now()}`;
    
    const quotation = await Quotation.create({
      quotationNumber, customer, products, subtotal, discount, tax, grandTotal, validUntil
    });
    
    res.status(201).json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().populate('customer', 'name');
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('customer', 'name');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json({ message: 'Quotation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const convertQuotationToOrder = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    if (quotation.status === 'ACCEPTED') return res.status(400).json({ message: 'Quotation already converted' });

    const orderNumber = `SO-${Date.now()}`;
    const salesOrder = await SalesOrder.create({
      orderNumber,
      customer: quotation.customer,
      orderItems: quotation.products,
      subtotal: quotation.subtotal,
      discount: quotation.discount,
      tax: quotation.tax,
      grandTotal: quotation.grandTotal,
      orderStatus: 'DRAFT',
      createdBy: req.user._id,
      quotation: quotation._id
    });

    quotation.status = 'ACCEPTED';
    await quotation.save();

    res.status(201).json(salesOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createQuotation, getQuotations, getQuotationById, updateQuotation, deleteQuotation, convertQuotationToOrder };
