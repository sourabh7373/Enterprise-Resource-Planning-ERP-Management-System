const express = require('express');
const router = express.Router();
const { protect, authorizeRoles: authorize } = require('../middleware/authMiddleware');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Task = require('../models/Task');
const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER', 'SALES_MANAGER', 'INVENTORY_MANAGER'));

// Helper for CSV export formatting
const convertToCSV = (data, fields) => {
  const header = fields.join(',');
  const rows = data.map(row => {
    return fields.map(field => {
      let val = row[field];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',');
  });
  return [header, ...rows].join('\n');
};

// GET /api/reports/summary
router.get('/summary', async (req, res) => {
  try {
    const [
      employeeCount,
      departmentCount,
      attendanceSummary,
      leaveSummary,
      taskSummary,
      salesSummary,
      inventorySummary,
      expenseSummary,
      incomeSummary
    ] = await Promise.all([
      Employee.countDocuments(),
      Department.countDocuments(),
      Attendance.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      LeaveRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      SalesOrder.aggregate([
        { $group: { _id: null, totalSales: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]),
      Product.aggregate([
        { $group: { _id: null, totalProducts: { $sum: 1 }, totalStock: { $sum: '$currentStock' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'EXPENSE' } },
        { $group: { _id: null, totalExpense: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'INCOME' } },
        { $group: { _id: null, totalIncome: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    // Active tasks count for frontend summary component if needed
    const activeTasksRes = taskSummary.find(t => t._id === 'IN_PROGRESS' || t._id === 'TODO');
    const activeTasks = activeTasksRes ? activeTasksRes.count : 0;
    const totalSalesVal = salesSummary.length > 0 ? salesSummary[0].totalSales : 0;

    res.json({
      employeeCount,
      departmentCount,
      attendanceSummary,
      leaveSummary,
      taskSummary,
      activeTasks,
      totalSales: totalSalesVal,
      salesSummary: salesSummary.length > 0 ? salesSummary[0] : { totalSales: 0, count: 0 },
      inventorySummary: inventorySummary.length > 0 ? inventorySummary[0] : { totalProducts: 0, totalStock: 0 },
      expenseSummary: expenseSummary.length > 0 ? expenseSummary[0] : { totalExpense: 0, count: 0 },
      incomeSummary: incomeSummary.length > 0 ? incomeSummary[0] : { totalIncome: 0, count: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 1. Employee Report
router.get('/employees', async (req, res) => {
  try {
    const { startDate, endDate, department, search, sortBy = 'fullName', sortOrder = 'asc', page = 1, limit = 10, export: isExport } = req.query;
    let match = {};

    if (department) {
      match.department = department;
    }
    if (startDate || endDate) {
      match.joiningDate = {};
      if (startDate) match.joiningDate.$gte = new Date(startDate);
      if (endDate) match.joiningDate.$lte = new Date(endDate);
    }
    if (search) {
      match.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pipeline = [
      { $match: match },
      { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: {
        fullName: 1,
        employeeId: 1,
        email: 1,
        designation: 1,
        employmentType: 1,
        employmentStatus: 1,
        joiningDate: 1,
        departmentName: '$dept.name'
      }},
      { $sort: sort }
    ];

    if (isExport === 'csv') {
      const allData = await Employee.aggregate(pipeline);
      const csv = convertToCSV(allData, ['employeeId', 'fullName', 'email', 'designation', 'departmentName', 'employmentType', 'employmentStatus', 'joiningDate']);
      res.header('Content-Type', 'text/csv');
      return res.attachment('employees-report.csv').send(csv);
    }

    const totalCountData = await Employee.aggregate([...pipeline, { $count: 'total' }]);
    const total = totalCountData.length > 0 ? totalCountData[0].total : 0;

    const data = await Employee.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Department Report
router.get('/departments', async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10, export: isExport } = req.query;
    let match = {};

    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pipeline = [
      { $match: match },
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
          code: 1,
          description: 1,
          status: 1,
          employeeCount: { $size: '$employees' }
        }
      },
      { $sort: sort }
    ];

    if (isExport === 'csv') {
      const allData = await Department.aggregate(pipeline);
      const csv = convertToCSV(allData, ['code', 'name', 'description', 'status', 'employeeCount']);
      res.header('Content-Type', 'text/csv');
      return res.attachment('departments-report.csv').send(csv);
    }

    const totalCountData = await Department.aggregate([...pipeline, { $count: 'total' }]);
    const total = totalCountData.length > 0 ? totalCountData[0].total : 0;

    const data = await Department.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Attendance Report
router.get('/attendance', async (req, res) => {
  try {
    const { startDate, endDate, status, search, sortBy = 'attendanceDate', sortOrder = 'desc', page = 1, limit = 10, export: isExport } = req.query;
    let match = {};

    if (status) {
      match.status = status;
    }
    if (startDate || endDate) {
      match.attendanceDate = {};
      if (startDate) match.attendanceDate.$gte = new Date(startDate);
      if (endDate) match.attendanceDate.$lte = new Date(endDate);
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pipeline = [
      { $match: match },
      { $lookup: { from: 'employees', localField: 'employee', foreignField: '_id', as: 'emp' } },
      { $unwind: { path: '$emp', preserveNullAndEmptyArrays: true } }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'emp.fullName': { $regex: search, $options: 'i' } },
            { 'emp.employeeId': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      {
        $project: {
          attendanceDate: 1,
          checkIn: 1,
          checkOut: 1,
          workingHours: 1,
          status: 1,
          isLate: 1,
          employeeName: '$emp.fullName',
          employeeId: '$emp.employeeId'
        }
      },
      { $sort: sort }
    );

    if (isExport === 'csv') {
      const allData = await Attendance.aggregate(pipeline);
      const csv = convertToCSV(allData, ['employeeId', 'employeeName', 'attendanceDate', 'checkIn', 'checkOut', 'workingHours', 'status', 'isLate']);
      res.header('Content-Type', 'text/csv');
      return res.attachment('attendance-report.csv').send(csv);
    }

    const totalCountData = await Attendance.aggregate([...pipeline, { $count: 'total' }]);
    const total = totalCountData.length > 0 ? totalCountData[0].total : 0;

    const data = await Attendance.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Leave Report
router.get('/leaves', async (req, res) => {
  try {
    const { startDate, endDate, status, search, sortBy = 'startDate', sortOrder = 'desc', page = 1, limit = 10, export: isExport } = req.query;
    let match = {};

    if (status) {
      match.status = status;
    }
    if (startDate || endDate) {
      match.startDate = {};
      if (startDate) match.startDate.$gte = new Date(startDate);
      if (endDate) match.startDate.$lte = new Date(endDate);
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pipeline = [
      { $match: match },
      { $lookup: { from: 'employees', localField: 'employee', foreignField: '_id', as: 'emp' } },
      { $unwind: { path: '$emp', preserveNullAndEmptyArrays: true } }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'emp.fullName': { $regex: search, $options: 'i' } },
            { 'emp.employeeId': { $regex: search, $options: 'i' } },
            { leaveType: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      {
        $project: {
          leaveType: 1,
          startDate: 1,
          endDate: 1,
          numberOfDays: 1,
          reason: 1,
          status: 1,
          employeeName: '$emp.fullName',
          employeeId: '$emp.employeeId'
        }
      },
      { $sort: sort }
    );

    if (isExport === 'csv') {
      const allData = await LeaveRequest.aggregate(pipeline);
      const csv = convertToCSV(allData, ['employeeId', 'employeeName', 'leaveType', 'startDate', 'endDate', 'numberOfDays', 'status', 'reason']);
      res.header('Content-Type', 'text/csv');
      return res.attachment('leaves-report.csv').send(csv);
    }

    const totalCountData = await LeaveRequest.aggregate([...pipeline, { $count: 'total' }]);
    const total = totalCountData.length > 0 ? totalCountData[0].total : 0;

    const data = await LeaveRequest.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. Task Report
router.get('/tasks', async (req, res) => {
  try {
    const { startDate, endDate, status, priority, search, sortBy = 'dueDate', sortOrder = 'asc', page = 1, limit = 10, export: isExport } = req.query;
    let match = {};

    if (status) match.status = status;
    if (priority) match.priority = priority;
    if (startDate || endDate) {
      match.dueDate = {};
      if (startDate) match.dueDate.$gte = new Date(startDate);
      if (endDate) match.dueDate.$lte = new Date(endDate);
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pipeline = [
      { $match: match },
      { $lookup: { from: 'employees', localField: 'assignedEmployee', foreignField: '_id', as: 'emp' } },
      { $unwind: { path: '$emp', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'projects', localField: 'project', foreignField: '_id', as: 'proj' } },
      { $unwind: { path: '$proj', preserveNullAndEmptyArrays: true } }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { 'emp.fullName': { $regex: search, $options: 'i' } },
            { 'proj.name': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      {
        $project: {
          title: 1,
          priority: 1,
          status: 1,
          dueDate: 1,
          employeeName: '$emp.fullName',
          projectName: '$proj.name'
        }
      },
      { $sort: sort }
    );

    if (isExport === 'csv') {
      const allData = await Task.aggregate(pipeline);
      const csv = convertToCSV(allData, ['title', 'projectName', 'employeeName', 'priority', 'status', 'dueDate']);
      res.header('Content-Type', 'text/csv');
      return res.attachment('tasks-report.csv').send(csv);
    }

    const totalCountData = await Task.aggregate([...pipeline, { $count: 'total' }]);
    const total = totalCountData.length > 0 ? totalCountData[0].total : 0;

    const data = await Task.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Sales Report
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate, orderStatus, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10, export: isExport } = req.query;
    let match = {};

    if (orderStatus) match.orderStatus = orderStatus;
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pipeline = [
      { $match: match },
      { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'cust' } },
      { $unwind: { path: '$cust', preserveNullAndEmptyArrays: true } }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'cust.name': { $regex: search, $options: 'i' } },
            { 'cust.company': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      {
        $project: {
          orderNumber: 1,
          grandTotal: 1,
          orderStatus: 1,
          createdAt: 1,
          customerName: '$cust.name',
          customerCompany: '$cust.company'
        }
      },
      { $sort: sort }
    );

    if (isExport === 'csv') {
      const allData = await SalesOrder.aggregate(pipeline);
      const csv = convertToCSV(allData, ['orderNumber', 'customerName', 'customerCompany', 'grandTotal', 'orderStatus', 'createdAt']);
      res.header('Content-Type', 'text/csv');
      return res.attachment('sales-report.csv').send(csv);
    }

    const totalCountData = await SalesOrder.aggregate([...pipeline, { $count: 'total' }]);
    const total = totalCountData.length > 0 ? totalCountData[0].total : 0;

    const data = await SalesOrder.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 7. Inventory Report
router.get('/inventory', async (req, res) => {
  try {
    const { category, status, search, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10, export: isExport } = req.query;
    let match = {};

    if (category) match.category = category;
    if (status) match.status = status;

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pipeline = [
      { $match: match },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'suppliers', localField: 'supplier', foreignField: '_id', as: 'sup' } },
      { $unwind: { path: '$sup', preserveNullAndEmptyArrays: true } }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { SKU: { $regex: search, $options: 'i' } },
            { 'cat.name': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      {
        $project: {
          name: 1,
          SKU: 1,
          currentStock: 1,
          minimumStockLevel: 1,
          sellingPrice: 1,
          status: 1,
          categoryName: '$cat.name',
          supplierName: '$sup.name'
        }
      },
      { $sort: sort }
    );

    if (isExport === 'csv') {
      const allData = await Product.aggregate(pipeline);
      const csv = convertToCSV(allData, ['SKU', 'name', 'categoryName', 'supplierName', 'currentStock', 'minimumStockLevel', 'sellingPrice', 'status']);
      res.header('Content-Type', 'text/csv');
      return res.attachment('inventory-report.csv').send(csv);
    }

    const totalCountData = await Product.aggregate([...pipeline, { $count: 'total' }]);
    const total = totalCountData.length > 0 ? totalCountData[0].total : 0;

    const data = await Product.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 8. Expense Report
router.get('/expenses', async (req, res) => {
  try {
    const { startDate, endDate, paymentStatus, search, sortBy = 'paymentDate', sortOrder = 'desc', page = 1, limit = 10, export: isExport } = req.query;
    let match = { type: 'EXPENSE' };

    if (paymentStatus) match.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      match.paymentDate = {};
      if (startDate) match.paymentDate.$gte = new Date(startDate);
      if (endDate) match.paymentDate.$lte = new Date(endDate);
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pipeline = [
      { $match: match }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { category: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { paymentMethod: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      {
        $project: {
          category: 1,
          amount: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          paymentDate: 1,
          description: 1
        }
      },
      { $sort: sort }
    );

    if (isExport === 'csv') {
      const allData = await Transaction.aggregate(pipeline);
      const csv = convertToCSV(allData, ['category', 'amount', 'paymentMethod', 'paymentStatus', 'paymentDate', 'description']);
      res.header('Content-Type', 'text/csv');
      return res.attachment('expense-report.csv').send(csv);
    }

    const totalCountData = await Transaction.aggregate([...pipeline, { $count: 'total' }]);
    const total = totalCountData.length > 0 ? totalCountData[0].total : 0;

    const data = await Transaction.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 9. Income Report
router.get('/income', async (req, res) => {
  try {
    const { startDate, endDate, paymentStatus, search, sortBy = 'paymentDate', sortOrder = 'desc', page = 1, limit = 10, export: isExport } = req.query;
    let match = { type: 'INCOME' };

    if (paymentStatus) match.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      match.paymentDate = {};
      if (startDate) match.paymentDate.$gte = new Date(startDate);
      if (endDate) match.paymentDate.$lte = new Date(endDate);
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pipeline = [
      { $match: match }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { category: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { paymentMethod: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      {
        $project: {
          category: 1,
          amount: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          paymentDate: 1,
          description: 1
        }
      },
      { $sort: sort }
    );

    if (isExport === 'csv') {
      const allData = await Transaction.aggregate(pipeline);
      const csv = convertToCSV(allData, ['category', 'amount', 'paymentMethod', 'paymentStatus', 'paymentDate', 'description']);
      res.header('Content-Type', 'text/csv');
      return res.attachment('income-report.csv').send(csv);
    }

    const totalCountData = await Transaction.aggregate([...pipeline, { $count: 'total' }]);
    const total = totalCountData.length > 0 ? totalCountData[0].total : 0;

    const data = await Transaction.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Legacy fallback endpoint /api/reports/finance
router.get('/finance', async (req, res) => {
  try {
    const report = await Transaction.aggregate([
      { $group: { _id: '$type', totalAmount: { $sum: '$amount' } } }
    ]);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
