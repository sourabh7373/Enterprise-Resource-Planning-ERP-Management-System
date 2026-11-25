const express = require('express');
const router = express.Router();
const {
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  updateOrderStatus,
  getCustomerOrderHistory
} = require('../controllers/salesOrderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSalesOrders)
  .post(protect, createSalesOrder);

router.route('/:id')
  .get(protect, getSalesOrderById);

router.route('/:id/status')
  .put(protect, updateOrderStatus);

router.route('/customer/:customerId')
  .get(protect, getCustomerOrderHistory);

module.exports = router;
