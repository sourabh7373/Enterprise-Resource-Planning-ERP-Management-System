const express = require('express');
const router = express.Router();
const {
  addIncome,
  addExpense,
  getTransactions,
  getFinanceSummary
} = require('../controllers/financeController');
const { protect, authorizeRoles: authorize } = require('../middleware/authMiddleware');

router.route('/income')
  .post(protect, authorize('FINANCE_MANAGER', 'SUPER_ADMIN'), addIncome);

router.route('/expenses')
  .post(protect, authorize('FINANCE_MANAGER', 'SUPER_ADMIN'), addExpense);

router.route('/transactions')
  .get(protect, authorize('FINANCE_MANAGER', 'SUPER_ADMIN'), getTransactions);

router.route('/summary')
  .get(protect, authorize('FINANCE_MANAGER', 'SUPER_ADMIN'), getFinanceSummary);

module.exports = router;
