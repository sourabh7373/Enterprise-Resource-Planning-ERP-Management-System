import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Building2, DollarSign, CheckSquare, Package, 
  TrendingUp, TrendingDown, Calendar, FileText, Search, 
  Download, ChevronLeft, ChevronRight, Filter, AlertCircle 
} from 'lucide-react';

const ReportsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // Active report tab: 'overview', 'employees', 'departments', 'attendance', 'leaves', 'tasks', 'sales', 'inventory', 'expenses', 'income'
  const [activeTab, setActiveTab] = useState('overview');

  // Detailed Report State
  const [reportData, setReportData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState(null);

  // Filters & Controls
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchSummary = async () => {
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const res = await axios.get('/api/reports/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Error fetching summary reports', err);
      setSummaryError(err.response?.data?.message || err.message || 'Failed to load report summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchDetailedReport = async (tab = activeTab) => {
    if (tab === 'overview') return;
    setLoadingReport(true);
    setReportError(null);
    try {
      let endpoint = `/api/reports/${tab}`;
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined
      };

      if (tab === 'employees' && departmentFilter) params.department = departmentFilter;
      if (['attendance', 'leaves', 'sales', 'expenses', 'income'].includes(tab) && statusFilter) {
        if (tab === 'attendance' || tab === 'leaves') params.status = statusFilter;
        else if (tab === 'sales') params.orderStatus = statusFilter;
        else if (tab === 'expenses' || tab === 'income') params.paymentStatus = statusFilter;
      }
      if (tab === 'tasks') {
        if (statusFilter) params.status = statusFilter;
        if (priorityFilter) params.priority = priorityFilter;
      }
      if (tab === 'inventory') {
        if (statusFilter) params.status = statusFilter;
        if (categoryFilter) params.category = categoryFilter;
      }

      const res = await axios.get(endpoint, { params });
      setReportData(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
    } catch (err) {
      console.error(`Error fetching ${tab} report`, err);
      setReportError(err.response?.data?.message || err.message || 'Failed to load report details');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleExportCSV = async () => {
    if (activeTab === 'overview') return;
    try {
      let endpoint = `/api/reports/${activeTab}`;
      const params = {
        export: 'csv',
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined
      };

      if (activeTab === 'employees' && departmentFilter) params.department = departmentFilter;
      if (['attendance', 'leaves', 'sales', 'expenses', 'income'].includes(activeTab) && statusFilter) {
        if (activeTab === 'attendance' || activeTab === 'leaves') params.status = statusFilter;
        else if (activeTab === 'sales') params.orderStatus = statusFilter;
        else if (activeTab === 'expenses' || activeTab === 'income') params.paymentStatus = statusFilter;
      }
      if (activeTab === 'tasks') {
        if (statusFilter) params.status = statusFilter;
        if (priorityFilter) params.priority = priorityFilter;
      }
      if (activeTab === 'inventory') {
        if (statusFilter) params.status = statusFilter;
        if (categoryFilter) params.category = categoryFilter;
      }

      const res = await axios.get(endpoint, { params, responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}-report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV', err);
      alert('Failed to export CSV: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (activeTab !== 'overview') {
      setPage(1);
      setSearch('');
      setStatusFilter('');
      setDepartmentFilter('');
      setPriorityFilter('');
      setCategoryFilter('');
      setStartDate('');
      setEndDate('');
      setSortBy('');
      setSortOrder('asc');
      fetchDetailedReport(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'overview') {
      fetchDetailedReport(activeTab);
    }
  }, [page, statusFilter, departmentFilter, priorityFilter, categoryFilter, startDate, endDate, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDetailedReport(activeTab);
  };

  if (loadingSummary && !summary) {
    return <div className="p-8 text-center text-[#E2E8F0] bg-[#0B1120] min-h-screen">Loading Reports Dashboard...</div>;
  }

  if (summaryError && !summary) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0] flex items-center justify-center">
        <div className="p-6 max-w-md bg-[#172554] border border-red-500 rounded-2xl shadow-lg text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Reports</h3>
          <p className="text-red-300 mb-4">{summaryError}</p>
          <button onClick={fetchSummary} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const reportsList = [
    { id: 'overview', label: 'Summary Overview', icon: FileText },
    { id: 'employees', label: '1. Employee Report', icon: Users },
    { id: 'departments', label: '2. Department Report', icon: Building2 },
    { id: 'attendance', label: '3. Attendance Report', icon: Calendar },
    { id: 'leaves', label: '4. Leave Report', icon: FileText },
    { id: 'tasks', label: '5. Task Report', icon: CheckSquare },
    { id: 'sales', label: '6. Sales Report', icon: TrendingUp },
    { id: 'inventory', label: '7. Inventory Report', icon: Package },
    { id: 'expenses', label: '8. Expense Report', icon: TrendingDown },
    { id: 'income', label: '9. Income Report', icon: DollarSign }
  ];

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#E2E8F0]">Enterprise Reporting Module</h2>
          <p className="text-[#94A3B8] text-sm mt-1">Real-time MongoDB backed metrics and detailed reports with CSV export</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {reportsList.map((r) => {
            const Icon = r.icon;
            const isActive = activeTab === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveTab(r.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  isActive 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                    : 'bg-[#172554] border-[#334155] text-[#94A3B8] hover:text-white hover:border-[#38BDF8]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUMMARY OVERVIEW VIEW */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Summary Metrics Dashboard</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-[#172554] border border-[#334155] rounded-2xl shadow-lg hover:border-[#38BDF8] transition-all">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#94A3B8] text-xs uppercase tracking-wider">Total Employees</h3>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold mt-3 text-white">{summary.employeeCount ?? 0}</p>
            </div>
            <div className="p-6 bg-[#172554] border border-[#334155] rounded-2xl shadow-lg hover:border-[#38BDF8] transition-all">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#94A3B8] text-xs uppercase tracking-wider">Total Departments</h3>
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-3xl font-bold mt-3 text-white">{summary.departmentCount ?? 0}</p>
            </div>
            <div className="p-6 bg-[#172554] border border-[#334155] rounded-2xl shadow-lg hover:border-[#38BDF8] transition-all">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#94A3B8] text-xs uppercase tracking-wider">Total Sales</h3>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-bold mt-3 text-white">${summary.totalSales ?? 0}</p>
            </div>
            <div className="p-6 bg-[#172554] border border-[#334155] rounded-2xl shadow-lg hover:border-[#38BDF8] transition-all">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#94A3B8] text-xs uppercase tracking-wider">Active Tasks</h3>
                <CheckSquare className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-bold mt-3 text-white">{summary.activeTasks ?? 0}</p>
            </div>
            <div className="p-6 bg-[#172554] border border-[#334155] rounded-2xl shadow-lg hover:border-[#38BDF8] transition-all">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#94A3B8] text-xs uppercase tracking-wider">Inventory Products</h3>
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold mt-3 text-white">{summary.inventorySummary?.totalProducts ?? 0}</p>
            </div>
            <div className="p-6 bg-[#172554] border border-[#334155] rounded-2xl shadow-lg hover:border-[#38BDF8] transition-all">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#94A3B8] text-xs uppercase tracking-wider">Total Income</h3>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-bold mt-3 text-white">${summary.incomeSummary?.totalIncome ?? 0}</p>
            </div>
            <div className="p-6 bg-[#172554] border border-[#334155] rounded-2xl shadow-lg hover:border-[#38BDF8] transition-all">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#94A3B8] text-xs uppercase tracking-wider">Total Expenses</h3>
                <TrendingDown className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-3xl font-bold mt-3 text-white">${summary.expenseSummary?.totalExpense ?? 0}</p>
            </div>
          </div>

          <div className="bg-[#172554] border border-[#334155] rounded-2xl p-6 shadow-lg mt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Navigation to Detailed Reports</h4>
            <p className="text-sm text-[#94A3B8] mb-6">Select any detailed report tab above to view full filtered records, sorting, pagination, and CSV export functionality.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {reportsList.filter(r => r.id !== 'overview').map(r => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActiveTab(r.id)}
                    className="flex items-center justify-between p-4 bg-[#0B1120] border border-[#334155] rounded-xl hover:border-blue-500 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#172554] rounded-lg text-blue-400 group-hover:text-white group-hover:bg-blue-600 transition">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white text-sm">{r.label}</h5>
                        <p className="text-xs text-[#94A3B8]">View table & export</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DETAILED REPORT VIEW */}
      {activeTab !== 'overview' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#172554] border border-[#334155] p-6 rounded-2xl shadow-lg">
            <div>
              <h3 className="text-xl font-bold text-white capitalize">{reportsList.find(r => r.id === activeTab)?.label}</h3>
              <p className="text-sm text-[#94A3B8] mt-1">Total Records: <span className="font-semibold text-white">{pagination.total}</span></p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-[#0B1120] border border-[#334155] rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none w-36 sm:w-48"
                />
              </form>

              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#0B1120] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white"
                />
                <span className="text-xs text-[#94A3B8]">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#0B1120] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* CSV Export Button */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-md"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#172554] border border-[#334155] rounded-2xl shadow-lg overflow-hidden">
            {loadingReport ? (
              <div className="p-12 text-center text-[#94A3B8]">Loading report data...</div>
            ) : reportError ? (
              <div className="p-12 text-center text-red-400">{reportError}</div>
            ) : reportData.length === 0 ? (
              <div className="p-12 text-center text-[#94A3B8]">
                <p className="text-lg font-medium">No records found matching your criteria.</p>
                <p className="text-xs mt-1">Try adjusting your search or date filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#334155] bg-[#0B1120]/50 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                      {activeTab === 'employees' && (
                        <>
                          <th className="p-4">Employee ID</th>
                          <th className="p-4">Full Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Designation</th>
                          <th className="p-4">Department</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Joining Date</th>
                        </>
                      )}
                      {activeTab === 'departments' && (
                        <>
                          <th className="p-4">Code</th>
                          <th className="p-4">Department Name</th>
                          <th className="p-4">Description</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Employee Count</th>
                        </>
                      )}
                      {activeTab === 'attendance' && (
                        <>
                          <th className="p-4">Employee ID</th>
                          <th className="p-4">Employee Name</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Check-In</th>
                          <th className="p-4">Check-Out</th>
                          <th className="p-4">Working Hours</th>
                          <th className="p-4">Status</th>
                        </>
                      )}
                      {activeTab === 'leaves' && (
                        <>
                          <th className="p-4">Employee ID</th>
                          <th className="p-4">Employee Name</th>
                          <th className="p-4">Leave Type</th>
                          <th className="p-4">Start Date</th>
                          <th className="p-4">End Date</th>
                          <th className="p-4">Days</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Reason</th>
                        </>
                      )}
                      {activeTab === 'tasks' && (
                        <>
                          <th className="p-4">Task Title</th>
                          <th className="p-4">Project</th>
                          <th className="p-4">Assigned Employee</th>
                          <th className="p-4">Priority</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Due Date</th>
                        </>
                      )}
                      {activeTab === 'sales' && (
                        <>
                          <th className="p-4">Order Number</th>
                          <th className="p-4">Customer Name</th>
                          <th className="p-4">Company</th>
                          <th className="p-4">Total Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Order Date</th>
                        </>
                      )}
                      {activeTab === 'inventory' && (
                        <>
                          <th className="p-4">SKU</th>
                          <th className="p-4">Product Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Supplier</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4">Min Stock</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Status</th>
                        </>
                      )}
                      {activeTab === 'expenses' && (
                        <>
                          <th className="p-4">Category</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Payment Method</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Description</th>
                        </>
                      )}
                      {activeTab === 'income' && (
                        <>
                          <th className="p-4">Category</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Payment Method</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Description</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155] text-sm">
                    {reportData.map((row, idx) => (
                      <tr key={row._id || idx} className="hover:bg-[#0B1120]/30 transition">
                        {activeTab === 'employees' && (
                          <>
                            <td className="p-4 font-mono text-xs text-[#94A3B8]">{row.employeeId}</td>
                            <td className="p-4 font-semibold text-white">{row.fullName}</td>
                            <td className="p-4 text-[#94A3B8]">{row.email}</td>
                            <td className="p-4 text-[#94A3B8]">{row.designation}</td>
                            <td className="p-4 text-[#94A3B8]">{row.departmentName || 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.employmentType}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${row.employmentStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {row.employmentStatus}
                              </span>
                            </td>
                            <td className="p-4 text-[#94A3B8]">{row.joiningDate ? new Date(row.joiningDate).toLocaleDateString() : 'N/A'}</td>
                          </>
                        )}
                        {activeTab === 'departments' && (
                          <>
                            <td className="p-4 font-mono text-xs text-[#94A3B8]">{row.code}</td>
                            <td className="p-4 font-semibold text-white">{row.name}</td>
                            <td className="p-4 text-[#94A3B8]">{row.description || 'N/A'}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                {row.status || 'Active'}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-white">{row.employeeCount}</td>
                          </>
                        )}
                        {activeTab === 'attendance' && (
                          <>
                            <td className="p-4 font-mono text-xs text-[#94A3B8]">{row.employeeId}</td>
                            <td className="p-4 font-semibold text-white">{row.employeeName || 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.attendanceDate ? new Date(row.attendanceDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.checkIn || 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.checkOut || 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.workingHours ?? 'N/A'} hrs</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}
                        {activeTab === 'leaves' && (
                          <>
                            <td className="p-4 font-mono text-xs text-[#94A3B8]">{row.employeeId}</td>
                            <td className="p-4 font-semibold text-white">{row.employeeName || 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.leaveType}</td>
                            <td className="p-4 text-[#94A3B8]">{row.startDate ? new Date(row.startDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.endDate ? new Date(row.endDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.numberOfDays}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : row.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="p-4 text-[#94A3B8] truncate max-w-xs">{row.reason}</td>
                          </>
                        )}
                        {activeTab === 'tasks' && (
                          <>
                            <td className="p-4 font-semibold text-white">{row.title}</td>
                            <td className="p-4 text-[#94A3B8]">{row.projectName || 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.employeeName || 'N/A'}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${row.priority === 'High' || row.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {row.priority}
                              </span>
                            </td>
                            <td className="p-4 text-[#94A3B8]">{row.status}</td>
                            <td className="p-4 text-[#94A3B8]">{row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'N/A'}</td>
                          </>
                        )}
                        {activeTab === 'sales' && (
                          <>
                            <td className="p-4 font-mono text-xs text-white">{row.orderNumber}</td>
                            <td className="p-4 font-semibold text-white">{row.customerName || 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.customerCompany || 'N/A'}</td>
                            <td className="p-4 font-semibold text-emerald-400">${row.grandTotal}</td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
                                {row.orderStatus}
                              </span>
                            </td>
                            <td className="p-4 text-[#94A3B8]">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</td>
                          </>
                        )}
                        {activeTab === 'inventory' && (
                          <>
                            <td className="p-4 font-mono text-xs text-[#94A3B8]">{row.SKU}</td>
                            <td className="p-4 font-semibold text-white">{row.name}</td>
                            <td className="p-4 text-[#94A3B8]">{row.categoryName || 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.supplierName || 'N/A'}</td>
                            <td className="p-4 font-semibold text-white">{row.currentStock}</td>
                            <td className="p-4 text-[#94A3B8]">{row.minimumStockLevel}</td>
                            <td className="p-4 text-emerald-400">${row.sellingPrice}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${row.currentStock <= row.minimumStockLevel ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {row.status || (row.currentStock <= row.minimumStockLevel ? 'Low Stock' : 'In Stock')}
                              </span>
                            </td>
                          </>
                        )}
                        {activeTab === 'expenses' && (
                          <>
                            <td className="p-4 font-semibold text-white">{row.category}</td>
                            <td className="p-4 font-semibold text-rose-400">${row.amount}</td>
                            <td className="p-4 text-[#94A3B8]">{row.paymentMethod}</td>
                            <td className="p-4 text-[#94A3B8]">{row.paymentStatus}</td>
                            <td className="p-4 text-[#94A3B8]">{row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.description || 'N/A'}</td>
                          </>
                        )}
                        {activeTab === 'income' && (
                          <>
                            <td className="p-4 font-semibold text-white">{row.category}</td>
                            <td className="p-4 font-semibold text-emerald-400">${row.amount}</td>
                            <td className="p-4 text-[#94A3B8]">{row.paymentMethod}</td>
                            <td className="p-4 text-[#94A3B8]">{row.paymentStatus}</td>
                            <td className="p-4 text-[#94A3B8]">{row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="p-4 text-[#94A3B8]">{row.description || 'N/A'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-[#334155] bg-[#0B1120]/30">
                <p className="text-xs text-[#94A3B8]">
                  Showing page <span className="font-semibold text-white">{pagination.page}</span> of <span className="font-semibold text-white">{pagination.pages}</span> ({pagination.total} total records)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className="p-2 bg-[#172554] border border-[#334155] rounded-lg disabled:opacity-50 text-white hover:border-blue-500 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPage(p => Math.min(p + 1, pagination.pages))}
                    className="p-2 bg-[#172554] border border-[#334155] rounded-lg disabled:opacity-50 text-white hover:border-blue-500 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
