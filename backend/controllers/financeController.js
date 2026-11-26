const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');
const mongoose = require('mongoose');

const createTransaction = async (req, res, type) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { category, amount, paymentMethod, paymentDate, paymentStatus, customer, salesOrder, invoice, description } = req.body;

    if (!category || !amount || !paymentMethod || !paymentStatus) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const transaction = new Transaction({
      type,
      category,
      amount,
      paymentMethod,
      paymentDate: paymentDate || Date.now(),
      paymentStatus,
      customer,
      salesOrder,
      invoice,
      description,
      createdBy: req.user._id
    });

    await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json(transaction);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

const addIncome = (req, res) => createTransaction(req, res, 'INCOME');
const addExpense = (req, res) => createTransaction(req, res, 'EXPENSE');

const getTransactions = async (req, res) => {
  try {
    const { type, category, paymentStatus, startDate, endDate, page = 1, limit = 10 } = req.query;
    let query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transactions = await Transaction.find(query)
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalTransactions: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFinanceSummary = async (req, res) => {
  try {
    const [transactionSummary, invoiceSummary] = await Promise.all([
      Transaction.aggregate([
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]),
      Invoice.aggregate([
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalPaid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$grandTotal', 0] } },
            totalPendingAmount: { $sum: { $cond: [{ $in: ['$paymentStatus', ['PENDING', 'PARTIALLY_PAID', 'OVERDUE']] }, '$balanceDue', 0] } }
          }
        }
      ])
    ]);

    const income = transactionSummary.find(s => s._id === 'INCOME')?.total || 0;
    const expenses = transactionSummary.find(s => s._id === 'EXPENSE')?.total || 0;

    const paidTransactions = await Transaction.countDocuments({ paymentStatus: 'PAID' });
    const pendingTransactions = await Transaction.countDocuments({ paymentStatus: 'PENDING' });
    const overdueTransactions = await Transaction.countDocuments({ paymentStatus: 'OVERDUE' });

    const invoiceData = invoiceSummary[0] || { totalInvoices: 0, totalPaid: 0, totalPendingAmount: 0 };

    res.json({
      income,
      expenses,
      netBalance: income - expenses,
      paidTransactions,
      pendingTransactions,
      overdueTransactions,
      totalInvoices: invoiceData.totalInvoices,
      paidInvoices: invoiceData.totalPaid,
      pendingInvoiceAmount: invoiceData.totalPendingAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addIncome, addExpense, getTransactions, getFinanceSummary };
