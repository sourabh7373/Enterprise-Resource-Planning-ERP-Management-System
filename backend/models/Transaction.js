const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0.01 },
  paymentMethod: { type: String, required: true },
  paymentDate: { type: Date, required: true, default: Date.now },
  paymentStatus: { 
    type: String, 
    enum: ['PAID', 'PENDING', 'PARTIALLY_PAID', 'OVERDUE'], 
    required: true 
  },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
