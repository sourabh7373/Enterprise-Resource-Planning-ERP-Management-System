import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, DollarSign, Package, TrendingUp, TrendingDown, Calendar, 
  FileText, Search, RefreshCw, AlertCircle, BarChart2, PieChart, Layers
} from 'lucide-react';

const BusinessIntelligencePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [view, setView] = useState('monthly'); // monthly, quarterly, yearly

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        view
      };
      const res = await axios.get('/api/analytics/overview', { params });
      if (res.data.success) {
        setData(res.data);
      } else {
        setError('Failed to load analytics data.');
      }
    } catch (err) {
      console.error('Analytics Fetch Error:', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to analytics server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [view]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAnalytics();
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setView('monthly');
    setTimeout(() => fetchAnalytics(), 50);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-[#E2E8F0] p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#38BDF8]">
          <RefreshCw className="animate-spin" size={28} />
          <span className="text-lg font-semibold">Loading Business Intelligence & Analytics...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-[#E2E8F0] p-6 flex items-center justify-center">
        <div className="bg-[#1E293B] border border-red-500/50 p-6 rounded-2xl max-w-md text-center">
          <AlertCircle className="mx-auto text-red-400 mb-3" size={36} />
          <h2 className="text-xl font-bold text-white mb-2">Analytics Error</h2>
          <p className="text-sm text-[#94A3B8] mb-4">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-xl hover:bg-blue-600 font-medium text-sm transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const salesAnalytics = data?.salesAnalytics || {};
  const financialAnalytics = data?.financialAnalytics || {};
  const hrAnalytics = data?.hrAnalytics || {};
  const inventoryAnalytics = data?.inventoryAnalytics || {};

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#E2E8F0] p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#1E293B] p-6 rounded-2xl border border-[#334155] shadow-lg">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <BarChart2 className="text-[#38BDF8]" size={28} />
            <h1 className="text-2xl font-bold text-white tracking-tight">Business Intelligence & Analytics</h1>
          </div>
          <p className="text-sm text-[#94A3B8]">Comprehensive multi-module ERP insights, financial performance, and operational KPIs.</p>
        </div>

        {/* Global Controls & Filters */}
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0F172A] px-3 py-2 rounded-xl border border-[#334155]">
            <Calendar size={16} className="text-[#94A3B8]" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs text-[#E2E8F0] focus:outline-none"
            />
            <span className="text-xs text-[#94A3B8]">to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs text-[#E2E8F0] focus:outline-none"
            />
          </div>

          <select 
            value={view} 
            onChange={(e) => setView(e.target.value)}
            className="bg-[#0F172A] text-xs text-[#E2E8F0] px-3 py-2.5 rounded-xl border border-[#334155] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="monthly">Monthly View</option>
            <option value="quarterly">Quarterly View</option>
            <option value="yearly">Yearly View</option>
          </select>

          <button 
            type="submit"
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            Apply Filters
          </button>
          
          <button 
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2.5 bg-[#334155] hover:bg-slate-700 text-[#E2E8F0] rounded-xl text-xs font-medium transition"
          >
            Reset
          </button>
        </form>
      </div>

      {/* A. KPI Dashboard Cards */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Layers size={20} className="text-[#38BDF8]" /> Key Performance Indicators (KPIs)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-2xl shadow">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Total Employees</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{kpis.totalEmployees || 0}</span>
              <Users className="text-blue-400" size={20} />
            </div>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-2xl shadow">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Total Customers</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{kpis.totalCustomers || 0}</span>
              <Users className="text-teal-400" size={20} />
            </div>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-2xl shadow">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Total Sales Amount</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">${(kpis.totalSales || 0).toLocaleString()}</span>
              <TrendingUp className="text-green-400" size={20} />
            </div>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-2xl shadow">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Total Revenue</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">${(kpis.totalRevenue || 0).toLocaleString()}</span>
              <DollarSign className="text-emerald-400" size={20} />
            </div>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-2xl shadow">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Total Expenses</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">${(kpis.totalExpenses || 0).toLocaleString()}</span>
              <TrendingDown className="text-red-400" size={20} />
            </div>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-2xl shadow">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Net Profit</p>
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-bold ${kpis.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(kpis.netProfit || 0).toLocaleString()}
              </span>
              <DollarSign className={kpis.netProfit >= 0 ? 'text-green-400' : 'text-red-400'} size={20} />
            </div>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-2xl shadow">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Pending Invoices</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-400">{kpis.pendingInvoices || 0}</span>
              <FileText className="text-amber-400" size={20} />
            </div>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-2xl shadow">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Low Stock Products</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-red-400">{kpis.lowStockProducts || 0}</span>
              <Package className="text-red-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Sections: B. Sales & C. Financial Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* B. Sales Analytics */}
        <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-2xl shadow flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#38BDF8]" /> Sales Analytics & Trends
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#94A3B8] mb-2 uppercase">Sales Over Time</p>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-2">
                  {salesAnalytics.salesOverTime?.length > 0 ? (
                    salesAnalytics.salesOverTime.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#0F172A] p-3 rounded-xl border border-[#334155]">
                        <span className="text-xs font-medium text-white">{item._id}</span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 block">${(item.totalSales || 0).toLocaleString()}</span>
                          <span className="text-[10px] text-[#94A3B8]">{item.orderCount} Orders</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#94A3B8] text-center py-4 bg-[#0F172A] rounded-xl">No sales data recorded for this period.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#94A3B8] mb-2 uppercase">Top-Selling Products</p>
                <div className="space-y-2">
                  {salesAnalytics.topSellingProducts?.length > 0 ? (
                    salesAnalytics.topSellingProducts.map((prod, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#0F172A] p-2.5 rounded-xl border border-[#334155]">
                        <span className="text-xs text-white truncate max-w-[180px]">{prod.productName || 'Product ID: ' + prod._id}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-medium text-[#38BDF8]">{prod.totalQty} Qty</span>
                          <span className="text-xs font-bold text-green-400">${(prod.totalRevenue || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#94A3B8] text-center py-3 bg-[#0F172A] rounded-xl">No top-selling products found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* C. Financial Analytics */}
        <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-2xl shadow flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-[#38BDF8]" /> Financial Analytics (Income vs Expenses)
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#94A3B8] mb-2 uppercase">Monthly Profit Trends</p>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-2">
                  {financialAnalytics.monthlyIncomeVsExpenses?.length > 0 ? (
                    financialAnalytics.monthlyIncomeVsExpenses.map((row, idx) => (
                      <div key={idx} className="bg-[#0F172A] p-3 rounded-xl border border-[#334155] flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{row.month}</span>
                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="text-[10px] text-[#94A3B8] block">Income</span>
                            <span className="text-xs font-bold text-green-400">+${(row.income || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#94A3B8] block">Expense</span>
                            <span className="text-xs font-bold text-red-400">-${(row.expense || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#94A3B8] block">Profit</span>
                            <span className={`text-xs font-bold ${row.profit >= 0 ? 'text-[#38BDF8]' : 'text-red-400'}`}>
                              ${(row.profit || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#94A3B8] text-center py-4 bg-[#0F172A] rounded-xl">No financial transaction trends available.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#94A3B8] mb-2 uppercase">Invoice Payment Summaries</p>
                <div className="grid grid-cols-2 gap-2">
                  {financialAnalytics.invoicePaymentSummaries?.length > 0 ? (
                    financialAnalytics.invoicePaymentSummaries.map((inv, idx) => (
                      <div key={idx} className="bg-[#0F172A] p-2.5 rounded-xl border border-[#334155] flex items-center justify-between">
                        <span className="text-xs font-medium text-white">{inv._id || 'UNKNOWN'}</span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-white block">{inv.count}</span>
                          <span className="text-[10px] text-[#38BDF8]">${(inv.totalAmount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#94A3B8] col-span-2 text-center py-3 bg-[#0F172A] rounded-xl">No invoice summary records found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Sections: D. HR Analytics & E. Inventory Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* D. HR Analytics */}
        <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-2xl shadow">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-[#38BDF8]" /> HR & Workforce Analytics
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-[#94A3B8] mb-2 uppercase">Employee Count by Department</p>
              <div className="grid grid-cols-2 gap-2">
                {hrAnalytics.employeeCountByDepartment?.length > 0 ? (
                  hrAnalytics.employeeCountByDepartment.map((dept, idx) => (
                    <div key={idx} className="bg-[#0F172A] p-2.5 rounded-xl border border-[#334155] flex items-center justify-between">
                      <span className="text-xs font-medium text-white truncate max-w-[130px]">{dept.departmentName || 'General'}</span>
                      <span className="text-xs font-bold bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-lg">{dept.employeeCount}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#94A3B8] col-span-2 text-center py-3 bg-[#0F172A] rounded-xl">No department employee data available.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-[#94A3B8] mb-2 uppercase">Attendance Status</p>
                <div className="space-y-1.5">
                  {hrAnalytics.attendanceTrends?.length > 0 ? (
                    hrAnalytics.attendanceTrends.map((att, idx) => (
                      <div key={idx} className="bg-[#0F172A] p-2 rounded-lg border border-[#334155] flex items-center justify-between text-xs">
                        <span className="text-[#E2E8F0]">{att._id}</span>
                        <span className="font-bold text-white">{att.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#94A3B8] text-center py-2 bg-[#0F172A] rounded-lg">No attendance trends.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#94A3B8] mb-2 uppercase">Leave Statistics</p>
                <div className="space-y-1.5">
                  {hrAnalytics.leaveStatistics?.length > 0 ? (
                    hrAnalytics.leaveStatistics.map((leave, idx) => (
                      <div key={idx} className="bg-[#0F172A] p-2 rounded-lg border border-[#334155] flex items-center justify-between text-xs">
                        <span className="text-[#E2E8F0]">{leave._id}</span>
                        <span className="font-bold text-white">{leave.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#94A3B8] text-center py-2 bg-[#0F172A] rounded-lg">No leave stats.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* E. Inventory Analytics */}
        <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-2xl shadow">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Package size={18} className="text-[#38BDF8]" /> Inventory & Stock Analytics
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155]">
                <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1">Total Products</span>
                <span className="text-xl font-bold text-white">{inventoryAnalytics.totalProducts || 0}</span>
              </div>
              <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155]">
                <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1">Inventory Valuation</span>
                <span className="text-xl font-bold text-emerald-400">${(inventoryAnalytics.inventoryValuation?.totalValuation || 0).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#94A3B8] mb-2 uppercase">Low Stock Alerts List</p>
              <div className="max-h-44 overflow-y-auto space-y-2 pr-2">
                {inventoryAnalytics.lowStockProducts?.length > 0 ? (
                  inventoryAnalytics.lowStockProducts.map((prod, idx) => (
                    <div key={idx} className="bg-[#0F172A] p-2.5 rounded-xl border border-red-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-white block">{prod.name}</span>
                        <span className="text-[10px] text-[#94A3B8]">SKU: {prod.sku || 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-red-400 block">Stock: {prod.currentStock}</span>
                        <span className="text-[10px] text-[#94A3B8]">Min: {prod.minStockLevel}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-green-400 text-center py-4 bg-[#0F172A] rounded-xl">All products are adequately stocked!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligencePage;
