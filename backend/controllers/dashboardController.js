const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Task = require('../models/Task');
const Customer = require('../models/Customer');
const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const StockMovement = require('../models/StockMovement');
const Announcement = require('../models/Announcement');

// Super Admin Dashboard Stats & Charts
exports.getSuperAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      todayAttendanceCount,
      pendingLeavesCount,
      totalCustomers,
      salesAgg,
      expenseAgg,
      totalProducts,
      lowStockProducts,
      recentActivities,
      pendingApprovals,
      recentTransactions,
      lowStockList,
      attendanceOverview,
      deptDistribution,
      monthlySales,
      monthlyExpenses
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: { $regex: /^active$/i } }),
      Department.countDocuments(),
      Attendance.countDocuments({ date: { $gte: today }, status: 'PRESENT' }),
      LeaveRequest.countDocuments({ status: 'PENDING' }),
      Customer.countDocuments(),
      SalesOrder.aggregate([
        { $group: { _id: null, totalSales: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'EXPENSE' } },
        { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
      ]),
      Product.countDocuments(),
      Product.countDocuments({ $expr: { $lte: ['$currentStock', '$minStockLevel'] } }),
      // Recent activities (mock or from ActivityLog if available)
      Promise.resolve([
        { id: 1, text: 'New employee onboarded successfully', time: '2 hours ago', type: 'success' },
        { id: 2, text: 'Department quarterly review scheduled', time: '4 hours ago', type: 'info' },
        { id: 3, text: 'Q4 Enterprise financial report generated', time: '6 hours ago', type: 'success' }
      ]),
      LeaveRequest.find({ status: 'PENDING' }).populate('employee', 'fullName').limit(5),
      Transaction.find().sort({ date: -1 }).limit(5),
      Product.find({ $expr: { $lte: ['$currentStock', '$minStockLevel'] } }).limit(5),
      Attendance.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Department.aggregate([
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
            name: 1,
            employeeCount: { $size: '$employees' }
          }
        }
      ]),
      SalesOrder.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$grandTotal' }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 6 }
      ]),
      Transaction.aggregate([
        { $match: { type: 'EXPENSE' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 6 }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        totalDepartments,
        todayAttendance: todayAttendanceCount,
        pendingLeaveRequests: pendingLeavesCount,
        totalCustomers,
        totalSales: salesAgg.length > 0 ? salesAgg[0].totalSales : 0,
        totalExpenses: expenseAgg.length > 0 ? expenseAgg[0].totalExpense : 0,
        totalProducts,
        lowStockProducts
      },
      charts: {
        attendanceOverview,
        departmentDistribution: deptDistribution,
        monthlySales,
        monthlyExpenses
      },
      recentActivities,
      pendingApprovals,
      recentTransactions,
      lowStockList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// HR Manager Dashboard Stats & Charts
exports.getHrDashboard = async (req, res) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      departmentDistribution,
      attendanceSummary,
      pendingLeaveRequests,
      taskOverview,
      performanceOverview
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: { $regex: /^active$/i } }),
      Department.aggregate([
        {
          $lookup: {
            from: 'employees',
            localField: '_id',
            foreignField: 'department',
            as: 'employees'
          }
        },
        {
          $project: { name: 1, count: { $size: '$employees' } }
        }
      ]),
      Attendance.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      LeaveRequest.countDocuments({ status: 'PENDING' }),
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Employee.find().select('fullName performanceRating department').limit(10)
    ]);

    res.json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        pendingLeaveRequests
      },
      charts: {
        departmentDistribution,
        attendanceSummary,
        taskOverview
      },
      performanceOverview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Finance Manager Dashboard Stats & Charts
exports.getFinanceDashboard = async (req, res) => {
  try {
    const [incomeAgg, expenseAgg, pendingPaymentsCount, paidInvoicesCount, monthlyFinancials] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: 'INCOME' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'EXPENSE' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.countDocuments({ status: 'PENDING' }),
      Transaction.countDocuments({ status: 'PAID' }),
      Transaction.aggregate([
        {
          $group: {
            _id: {
              month: { $dateToString: { format: '%Y-%m', date: '$date' } },
              type: '$type'
            },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.month': 1 } }
      ])
    ]);

    const totalIncome = incomeAgg.length > 0 ? incomeAgg[0].total : 0;
    const totalExpenses = expenseAgg.length > 0 ? expenseAgg[0].total : 0;
    const netBalance = totalIncome - totalExpenses;

    res.json({
      success: true,
      stats: {
        totalIncome,
        totalExpenses,
        netBalance,
        pendingPayments: pendingPaymentsCount,
        paidInvoices: paidInvoicesCount
      },
      charts: {
        monthlyFinancials
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sales Manager Dashboard Stats & Charts
exports.getSalesDashboard = async (req, res) => {
  try {
    const [totalCustomers, totalOrders, salesRevenue, pendingOrders, monthlySales] = await Promise.all([
      Customer.countDocuments(),
      SalesOrder.countDocuments(),
      SalesOrder.aggregate([
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      SalesOrder.countDocuments({ status: { $in: ['PENDING', 'Processing'] } }),
      SalesOrder.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$grandTotal' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 6 }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalOrders,
        salesRevenue: salesRevenue.length > 0 ? salesRevenue[0].total : 0,
        pendingOrders
      },
      charts: {
        monthlySales
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Inventory Manager Dashboard Stats & Charts
exports.getInventoryDashboard = async (req, res) => {
  try {
    const [totalProducts, lowStockProducts, totalStockMovements, inventoryOverview, recentMovements] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ $expr: { $lte: ['$currentStock', '$minStockLevel'] } }),
      StockMovement.countDocuments(),
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            totalStock: { $sum: '$currentStock' },
            productCount: { $sum: 1 }
          }
        }
      ]),
      StockMovement.find().populate('product', 'name sku').sort({ createdAt: -1 }).limit(10)
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        lowStockProducts,
        totalStockMovements
      },
      charts: {
        inventoryOverview
      },
      recentMovements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employee Dashboard Stats & Data
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user.employee || req.user.id;

    const [attendanceSummary, leaveRequests, assignedTasks, announcements] = await Promise.all([
      Attendance.find({ employee: employeeId }).sort({ date: -1 }).limit(30),
      LeaveRequest.find({ employee: employeeId }),
      Task.find({ assignedTo: employeeId }),
      Announcement.find().sort({ createdAt: -1 }).limit(5)
    ]);

    const leaveBalance = {
      total: 20,
      used: leaveRequests.filter(l => l.status === 'APPROVED').reduce((acc, l) => acc + (l.duration || 1), 0),
      pending: leaveRequests.filter(l => l.status === 'PENDING').length
    };

    res.json({
      success: true,
      attendanceSummary,
      leaveBalance,
      leaveRequests,
      assignedTasks,
      announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
