const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  movementType: { 
    type: String, 
    enum: ['STOCK_IN', 'STOCK_OUT', 'ORDER_DEDUCTION', 'ADJUSTMENT', 'ORDER_RESTORE'], 
    required: true 
  },
  quantity: { type: Number, required: true, min: 0.0001 },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  referenceDocument: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  remarks: { type: String, trim: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
