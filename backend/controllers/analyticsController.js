const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Customer = require('../models/Customer');
const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');

// Advanced Business Intelligence & Analytics Controller
exports.getAnalyticsOverview = async (req, res) => {
  try {
    const { startDate, endDate, view = 'monthly' } = req.query;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    let transactionDateQuery = {};
    if (startDate && endDate) {
      transactionDateQuery = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // A. KPI Dashboard Data
    const [
      totalEmployees,
      totalCustomers,
      totalSalesAgg,
      totalRevenueAgg,
      totalExpenseAgg,
      pendingInvoicesCount,
      lowStockProductsCount
    ] = await Promise.all([
      Employee.countDocuments(),
      Customer.countDocuments(),
      SalesOrder.aggregate([
        { $match: dateQuery },
        { $group: { _id: null, totalSalesAmount: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        { $match: { ...transactionDateQuery, type: 'INCOME' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { ...transactionDateQuery, type: 'EXPENSE' } },
        { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
      ]),
      Invoice.countDocuments({ status: { $in: ['PENDING', 'UNPAID', 'OVERDUE'] } }),
      Product.countDocuments({ $expr: { $lte: ['$currentStock', '$minStockLevel'] } })
    ]);

    const totalSales = totalSalesAgg.length > 0 ? totalSalesAgg[0].totalSalesAmount : 0;
    const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].totalRevenue : 0;
    const totalExpenses = totalExpenseAgg.length > 0 ? totalExpenseAgg[0].totalExpense : 0;
    const netProfit = totalRevenue - totalExpenses;

    // B. Sales Analytics
    const salesOverTimeFormat = view === 'yearly' ? '%Y' : view === 'quarterly' ? '%Y-Q' : '%Y-%m';
    const salesOverTime = await SalesOrder.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalSales: { $sum: '$grandTotal' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const salesByStatus = await SalesOrder.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$grandTotal' }
        }
      }
    ]);

    // Top selling products from SalesOrder items if available
    const topSellingProducts = await SalesOrder.aggregate([
      { $match: dateQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          totalQty: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 }
    ]);

    // C. Financial Analytics
    const monthlyIncomeVsExpenses = await Transaction.aggregate([
      { $match: transactionDateQuery },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$date' } },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'INCOME'] }, '$total', 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'EXPENSE'] }, '$total', 0]
            }
          }
        }
      },
      {
        $project: {
          month: '$_id',
          income: 1,
          expense: 1,
          profit: { $subtract: ['$income', '$expense'] }
        }
      },
      { $sort: { month: 1 } }
    ]);

    const invoicePaymentSummaries = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // D. HR Analytics
    const employeeCountByDepartment = await Department.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'department',
          as: 'employees'
        }
      },
      {
        $project: {
          departmentName: '$name',
          employeeCount: { $size: '$employees' }
        }
      }
    ]);

    const attendanceTrends = await Attendance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const leaveStatistics = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // E. Inventory Analytics
    const totalProducts = await Product.countDocuments();
    const lowStockList = await Product.find({ $expr: { $lte: ['$currentStock', '$minStockLevel'] } })
      .select('name sku currentStock minStockLevel price')
      .limit(10);

    const inventoryValuation = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValuation: { $sum: { $multiply: ['$currentStock', '$price'] } },
          totalStockCount: { $sum: '$currentStock' }
        }
      }
    ]);

    res.json({
      success: true,
      kpis: {
        totalEmployees,
        totalCustomers,
        totalSales,
        totalRevenue,
        totalExpenses,
        netProfit,
        pendingInvoices: pendingInvoicesCount,
        lowStockProducts: lowStockProductsCount
      },
      salesAnalytics: {
        salesOverTime,
        salesByStatus,
        topSellingProducts
      },
      financialAnalytics: {
        monthlyIncomeVsExpenses,
        invoicePaymentSummaries
      },
      hrAnalytics: {
        employeeCountByDepartment,
        attendanceTrends,
        leaveStatistics
      },
      inventoryAnalytics: {
        totalProducts,
        lowStockProducts: lowStockList,
        inventoryValuation: inventoryValuation.length > 0 ? inventoryValuation[0] : { totalValuation: 0, totalStockCount: 0 }
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
