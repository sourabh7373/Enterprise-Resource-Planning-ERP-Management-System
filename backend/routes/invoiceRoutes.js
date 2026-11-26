const express = require('express');
const router = express.Router();
const {
  getInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoicePayment
} = require('../controllers/invoiceController');
const { protect, authorizeRoles: authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('FINANCE_MANAGER', 'SUPER_ADMIN'), getInvoices)
  .post(protect, authorize('FINANCE_MANAGER', 'SUPER_ADMIN'), createInvoice);

router.route('/:id')
  .get(protect, authorize('FINANCE_MANAGER', 'SUPER_ADMIN'), getInvoiceById);

router.route('/:id/payment')
  .patch(protect, authorize('FINANCE_MANAGER', 'SUPER_ADMIN'), updateInvoicePayment);

module.exports = router;
