const express = require('express');
const router = express.Router();
const { authenticateUser: verifyToken } = require('../middleware/authMiddleware');
const {
  stockIn,
  stockOut,
  getStockMovements,
  getLowStockAlerts
} = require('../controllers/inventoryController');

router.post('/stock-in', verifyToken, stockIn);
router.post('/stock-out', verifyToken, stockOut);
router.get('/movements', verifyToken, getStockMovements);
router.get('/low-stock', verifyToken, getLowStockAlerts);

module.exports = router;
