const mongoose = require('mongoose');

const salesOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  orderStatus: { 
    type: String, 
    enum: ['DRAFT', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'], 
    default: 'DRAFT' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' }
}, { timestamps: true });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
