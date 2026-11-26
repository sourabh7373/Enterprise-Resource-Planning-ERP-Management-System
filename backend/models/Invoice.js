const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: true },
  invoiceItems: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  amountPaid: { type: Number, default: 0, min: 0 },
  balanceDue: { type: Number, required: true, min: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['PAID', 'PENDING', 'PARTIALLY_PAID', 'OVERDUE'], 
    default: 'PENDING' 
  },
  invoiceDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
