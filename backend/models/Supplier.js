const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  companyName: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE'], 
    default: 'ACTIVE' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
