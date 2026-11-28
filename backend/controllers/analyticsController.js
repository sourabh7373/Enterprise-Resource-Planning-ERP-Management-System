const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Customer = require('../models/Customer');
const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');

// Advanced Business Intelligence & Analytics Controller with Role-Based Scoping
exports.getAnalyticsOverview = async (req, res) => {
  try {
    const { startDate, endDate, view = 'monthly' } = req.query;
    const userRole = req.user?.role;

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

    // Role-based scoping flags
    const canSeeHR = ['SUPER_ADMIN', 'HR_MANAGER'].includes(userRole);
    const canSeeFinance = ['SUPER_ADMIN', 'FINANCE_MANAGER'].includes(userRole);
    const canSeeSales = ['SUPER_ADMIN', 'SALES_MANAGER'].includes(userRole);
    const canSeeInventory = ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(userRole);
    const isSuperAdmin = userRole === 'SUPER_ADMIN';

    // A. KPI Dashboard Data (scoped or aggregated based on role)
    const [
      totalEmployees,
      totalCustomers,
      totalSalesAgg,
      totalRevenueAgg,
      totalExpenseAgg,
      pendingInvoicesCount,
      lowStockProductsCount
    ] = await Promise.all([
      canSeeHR ? Employee.countDocuments() : Promise.resolve(0),
      canSeeSales ? Customer.countDocuments() : Promise.resolve(0),
      canSeeSales ? SalesOrder.aggregate([
        { $match: dateQuery },
        { $group: { _id: null, totalSalesAmount: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]) : Promise.resolve([]),
      canSeeFinance ? Transaction.aggregate([
        { $match: { ...transactionDateQuery, type: 'INCOME' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
      ]) : Promise.resolve([]),
      canSeeFinance ? Transaction.aggregate([
        { $match: { ...transactionDateQuery, type: 'EXPENSE' } },
        { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
      ]) : Promise.resolve([]),
      canSeeFinance ? Invoice.countDocuments({ status: { $in: ['PENDING', 'UNPAID', 'OVERDUE'] } }) : Promise.resolve(0),
      canSeeInventory ? Product.countDocuments({ $expr: { $lte: ['$currentStock', '$minStockLevel'] } }) : Promise.resolve(0)
    ]);

    const totalSales = totalSalesAgg.length > 0 ? totalSalesAgg[0].totalSalesAmount : 0;
    const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].totalRevenue : 0;
    const totalExpenses = totalExpenseAgg.length > 0 ? totalExpenseAgg[0].totalExpense : 0;
    const netProfit = totalRevenue - totalExpenses;

    // B. Sales Analytics
    let salesOverTime = [];
    let salesByStatus = [];
    let topSellingProducts = [];
    if (canSeeSales) {
      salesOverTime = await SalesOrder.aggregate([
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

      salesByStatus = await SalesOrder.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$grandTotal' }
          }
        }
      ]);

      topSellingProducts = await SalesOrder.aggregate([
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
    }

    // C. Financial Analytics
    let monthlyIncomeVsExpenses = [];
    let invoicePaymentSummaries = [];
    if (canSeeFinance) {
      monthlyIncomeVsExpenses = await Transaction.aggregate([
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

      invoicePaymentSummaries = await Invoice.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]);
    }

    // D. HR Analytics
    let employeeCountByDepartment = [];
    let attendanceTrends = [];
    let leaveStatistics = [];
    if (canSeeHR) {
      employeeCountByDepartment = await Department.aggregate([
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

      attendanceTrends = await Attendance.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      leaveStatistics = await LeaveRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
    }

    // E. Inventory Analytics
    let totalProducts = 0;
    let lowStockList = [];
    let inventoryValuation = [{ totalValuation: 0, totalStockCount: 0 }];
    if (canSeeInventory) {
      totalProducts = await Product.countDocuments();
      lowStockList = await Product.find({ $expr: { $lte: ['$currentStock', '$minStockLevel'] } })
        .select('name sku currentStock minStockLevel price')
        .limit(10);

      inventoryValuation = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalValuation: { $sum: { $multiply: ['$currentStock', '$price'] } },
            totalStockCount: { $sum: '$currentStock' }
          }
        }
      ]);
    }

    res.json({
      success: true,
      userRole,
      kpis: {
        totalEmployees: canSeeHR ? totalEmployees : null,
        totalCustomers: canSeeSales ? totalCustomers : null,
        totalSales: canSeeSales ? totalSales : null,
        totalRevenue: canSeeFinance ? totalRevenue : null,
        totalExpenses: canSeeFinance ? totalExpenses : null,
        netProfit: canSeeFinance ? netProfit : null,
        pendingInvoices: canSeeFinance ? pendingInvoicesCount : null,
        lowStockProducts: canSeeInventory ? lowStockProductsCount : null
      },
      salesAnalytics: canSeeSales ? {
        salesOverTime,
        salesByStatus,
        topSellingProducts
      } : { restricted: true, message: 'Access restricted to Sales and Admin roles' },
      financialAnalytics: canSeeFinance ? {
        monthlyIncomeVsExpenses,
        invoicePaymentSummaries
      } : { restricted: true, message: 'Access restricted to Finance and Admin roles' },
      hrAnalytics: canSeeHR ? {
        employeeCountByDepartment,
        attendanceTrends,
        leaveStatistics
      } : { restricted: true, message: 'Access restricted to HR and Admin roles' },
      inventoryAnalytics: canSeeInventory ? {
        totalProducts,
        lowStockProducts: lowStockList,
        inventoryValuation: inventoryValuation.length > 0 ? inventoryValuation[0] : { totalValuation: 0, totalStockCount: 0 }
      } : { restricted: true, message: 'Access restricted to Inventory and Admin roles' }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
