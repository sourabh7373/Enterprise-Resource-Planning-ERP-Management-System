const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('customer', 'name').sort({ invoiceDate: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customer, salesOrder, invoiceItems, discount, tax, dueDate, subtotal: reqSubtotal, grandTotal: reqGrandTotal, balanceDue: reqBalanceDue } = req.body;
    
    // Validate inputs
    if (!customer || !salesOrder || !invoiceItems || invoiceItems.length === 0) {
      throw new Error('Missing required fields');
    }

    let subtotal = invoiceItems.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const discountVal = Number(discount) || 0;
    const taxVal = Number(tax) || 0;
    const grandTotal = subtotal - discountVal + taxVal;
    const balanceDue = grandTotal - (Number(req.body.amountPaid) || 0);

    if (subtotal !== Number(reqSubtotal) || grandTotal !== Number(reqGrandTotal) || balanceDue !== Number(reqBalanceDue)) {
      throw new Error('Calculation mismatch');
    }
    
    const invoice = new Invoice({
      invoiceNumber: `INV-${Date.now()}`,
      customer,
      salesOrder,
      invoiceItems,
      subtotal,
      discount: discountVal,
      tax: taxVal,
      grandTotal,
      balanceDue,
      dueDate,
      createdBy: req.user._id
    });

    await invoice.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json(invoice);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customer', 'name email');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateInvoicePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, paymentMethod, paymentDate } = req.body;
    const invoice = await Invoice.findById(req.params.id).session(session);
    
    if (!invoice) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.balanceDue < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Payment exceeds balance due' });
    }

    invoice.amountPaid += amount;
    invoice.balanceDue -= amount;
    invoice.paymentStatus = invoice.balanceDue === 0 ? 'PAID' : 'PARTIALLY_PAID';
    await invoice.save({ session });

    const transaction = new Transaction({
      type: 'INCOME',
      category: 'Invoice Payment',
      amount,
      paymentMethod,
      paymentDate: paymentDate || Date.now(),
      paymentStatus: 'PAID',
      customer: invoice.customer,
      salesOrder: invoice.salesOrder,
      invoice: invoice._id,
      description: `Payment for invoice ${invoice.invoiceNumber}`,
      createdBy: req.user._id
    });
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json(invoice);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getInvoices, createInvoice, getInvoiceById, updateInvoicePayment };
