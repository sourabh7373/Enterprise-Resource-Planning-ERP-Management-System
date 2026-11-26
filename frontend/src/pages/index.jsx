import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, ClipboardList, CalendarDays, ArrowRight, ShieldCheck, Activity, TrendingUp, Package } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { AnalyticsSection } from '../components/AnalyticsSection';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    employees: '128',
    departments: '12',
    tasks: '24',
    leaves: '8'
  });
  const [loading, setLoading] = useState(true);

  // Fetch live stats from backend if available
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/employees?limit=1', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.total !== undefined) {
          setStatsData(prev => ({ ...prev, employees: data.total.toString() }));
        }
      } catch (err) {
        console.error('Failed to load live employee count');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const stats = [
    { title: 'Total Employees', value: statsData.employees, icon: Users, color: 'bg-[#2563EB]/20 text-[#38BDF8]' },
    { title: 'Departments', value: statsData.departments, icon: Building2, color: 'bg-[#38BDF8]/20 text-[#38BDF8]' },
    { title: 'Pending Tasks', value: statsData.tasks, icon: ClipboardList, color: 'bg-[#2563EB]/20 text-[#38BDF8]' },
    { title: 'Leave Requests', value: statsData.leaves, icon: CalendarDays, color: 'bg-[#38BDF8]/20 text-[#38BDF8]' },
  ];

  const activities = [
    { id: 1, text: 'New employee onboarded successfully', time: '2 hours ago', type: 'success' },
    { id: 2, text: 'Department quarterly review scheduled', time: '4 hours ago', type: 'info' },
    { id: 3, text: 'Q4 Enterprise financial report generated', time: '6 hours ago', type: 'success' },
  ];

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#172554] to-[#1E3A5F] rounded-2xl p-8 text-[#FFFFFF] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#334155]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#2563EB] text-[#FFFFFF] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
              <ShieldCheck size={12} /> Enterprise Verified
            </span>
            <span className="text-[#94A3B8] text-xs">| Apex ERP OS v4.2</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FFFFFF]">Welcome back, {user?.name || 'Administrator'}</h1>
          <p className="text-[#CBD5E1] text-sm mt-1 max-w-xl">
            Here is your live enterprise overview, workforce analytics, and operational metrics for today.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#0F172A]/80 backdrop-blur-md px-5 py-3 rounded-xl border border-[#334155]">
          <Activity size={24} className="text-[#38BDF8]" />
          <div>
            <p className="text-xs text-[#94A3B8] font-medium">System Status</p>
            <p className="text-sm font-bold text-[#FFFFFF] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span> All Services Online
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Analytics Charts Section */}
      <AnalyticsSection />

      {/* Recent Activity & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-[#FFFFFF] flex items-center gap-2">
              <TrendingUp size={18} className="text-[#38BDF8]" /> Recent Enterprise Activity
            </h3>
            <span className="text-xs font-semibold text-[#94A3B8]">Real-time feed</span>
          </div>
          <div className="space-y-6">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-4 items-start pb-4 border-b border-[#334155] last:border-0 last:pb-0">
                <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-[#2563EB] shadow-xs" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#FFFFFF]">{act.text}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
          <h3 className="text-base font-bold text-[#FFFFFF] mb-6">Quick Navigation</h3>
          <div className="space-y-3">
            {[
              { name: 'Employee Directory', path: '/employees' },
              { name: 'Departments', path: '/departments' },
              { name: 'Attendance Logs', path: '/attendance' },
              { name: 'Leave Requests', path: '/leaves' }
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="flex items-center justify-between w-full p-3.5 rounded-xl bg-[#0F172A] hover:bg-[#2563EB]/20 text-[#E2E8F0] hover:text-[#FFFFFF] transition-all border border-[#334155] group"
              >
                <span className="text-sm font-semibold">{item.name}</span>
                <ArrowRight size={16} className="text-[#94A3B8] group-hover:text-[#38BDF8] group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import { EmployeeForm } from './EmployeeForm';
import { EmployeeDetails } from './EmployeeDetails';
import { EmployeeList } from './EmployeeList';
import { DepartmentList } from './DepartmentList';
import { DepartmentForm } from './DepartmentForm';
import { MyAttendance } from './MyAttendance';
import { AttendanceHistory } from './AttendanceHistory';
import { AttendanceManagement } from './AttendanceManagement';
import { AttendanceReport } from './AttendanceReport';

export { EmployeeList, EmployeeForm, EmployeeDetails, DepartmentList, DepartmentForm, MyAttendance, AttendanceHistory, AttendanceManagement, AttendanceReport };
import { TaskForm } from './TaskForm';
import { ProjectList } from './ProjectList';
import { ProjectForm } from './ProjectForm';
import { ProjectDetails } from './ProjectDetails';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import CustomerDetails from './CustomerDetails';
import QuotationList from './QuotationList';
import QuotationForm from './QuotationForm';
import QuotationDetails from './QuotationDetails';
import SalesOrderList from './SalesOrderList';
import SalesOrderDetails from './SalesOrderDetails';
import SalesOrderForm from './SalesOrderForm';
export { TaskForm, ProjectList, ProjectForm, ProjectDetails, CustomerList, CustomerForm, CustomerDetails, QuotationList, QuotationForm, QuotationDetails, SalesOrderList, SalesOrderDetails, SalesOrderForm };
export const Employees = EmployeeList;
export const Departments = DepartmentList;
export const Attendance = () => {
  const { user } = useAuth();
  if (user?.role === 'HR_MANAGER' || user?.role === 'SUPER_ADMIN') {
    return <AttendanceManagement />;
  }
  return <MyAttendance />;
};

import ApplyLeave from './ApplyLeave';
import MyLeaves from './MyLeaves';
import LeaveManagement from './LeaveManagement';
import LeaveDetails from './LeaveDetails';

export { ApplyLeave, MyLeaves, LeaveManagement, LeaveDetails };

export const Leaves = () => {
  const { user } = useAuth();
  if (user?.role === 'HR_MANAGER' || user?.role === 'SUPER_ADMIN') {
    return <LeaveManagement />;
  }
  return <MyLeaves />;
};

import { TaskList } from './TaskList';
import { TaskDetails } from './TaskDetails';
export const Tasks = TaskList;
export { TaskDetails };

export const Sales = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalQuotations: 0,
    pendingQuotations: 0,
    totalSalesOrders: 0,
    confirmedOrders: 0,
    completedOrders: 0
  });
  const [recentQuotations, setRecentQuotations] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [custRes, quotRes, orderRes] = await Promise.all([
          axios.get('/api/customers', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/quotations', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/sales-orders', { headers }).catch(() => ({ data: [] }))
        ]);

        const customers = custRes.data || [];
        const quotations = quotRes.data || [];
        const orders = orderRes.data || [];

        const pendingQuotations = quotations.filter(q => q.status === 'PENDING' || !q.status || q.status === 'DRAFT').length;
        const confirmedOrders = orders.filter(o => o.orderStatus === 'CONFIRMED').length;
        const completedOrders = orders.filter(o => o.orderStatus === 'COMPLETED').length;

        setStats({
          totalCustomers: customers.length,
          totalQuotations: quotations.length,
          pendingQuotations,
          totalSalesOrders: orders.length,
          confirmedOrders,
          completedOrders
        });

        setRecentQuotations(quotations.slice(0, 5));
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        setError('Failed to load sales data from backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const convertToOrder = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/quotations/${id}/convert`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Quotation converted to Sales Order successfully!');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to convert quotation');
    }
  };

  const updateOrderStatus = async (id, orderStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/sales-orders/${id}/status`, { orderStatus }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Sales order status updated successfully!');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#94A3B8]">Loading Sales & Quotations Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0] flex items-center justify-center">
        <div className="bg-[#172554] p-6 rounded-xl border border-red-500/50 text-center max-w-md">
          <h3 className="text-lg font-bold text-red-400 mb-2">Error Loading Data</h3>
          <p className="text-sm text-[#CBD5E1] mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-semibold">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <div>
          <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Commercial Management</p>
          <h1 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">Sales & Quotations Dashboard</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Manage client accounts, sales pipelines, quotations, and sales orders.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => navigate('/customers')} className="px-4 py-2 bg-[#0F172A] hover:bg-[#2563EB]/20 text-[#38BDF8] rounded-xl text-sm font-semibold border border-[#334155] transition-all">
            Customers
          </button>
          <button onClick={() => navigate('/quotations')} className="px-4 py-2 bg-[#0F172A] hover:bg-[#2563EB]/20 text-[#38BDF8] rounded-xl text-sm font-semibold border border-[#334155] transition-all">
            Quotations
          </button>
          <button onClick={() => navigate('/sales-orders')} className="px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold shadow transition-all">
            Sales Orders
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        <div className="bg-[#172554] p-5 rounded-2xl border border-[#334155] shadow-sm">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase">Total Customers</p>
          <h3 className="text-2xl font-extrabold text-white mt-2">{stats.totalCustomers}</h3>
        </div>
        <div className="bg-[#172554] p-5 rounded-2xl border border-[#334155] shadow-sm">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase">Total Quotations</p>
          <h3 className="text-2xl font-extrabold text-white mt-2">{stats.totalQuotations}</h3>
        </div>
        <div className="bg-[#172554] p-5 rounded-2xl border border-[#334155] shadow-sm">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase">Pending Quotations</p>
          <h3 className="text-2xl font-extrabold text-amber-400 mt-2">{stats.pendingQuotations}</h3>
        </div>
        <div className="bg-[#172554] p-5 rounded-2xl border border-[#334155] shadow-sm">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase">Total Sales Orders</p>
          <h3 className="text-2xl font-extrabold text-white mt-2">{stats.totalSalesOrders}</h3>
        </div>
        <div className="bg-[#172554] p-5 rounded-2xl border border-[#334155] shadow-sm">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase">Confirmed Orders</p>
          <h3 className="text-2xl font-extrabold text-sky-400 mt-2">{stats.confirmedOrders}</h3>
        </div>
        <div className="bg-[#172554] p-5 rounded-2xl border border-[#334155] shadow-sm">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase">Completed Orders</p>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-2">{stats.completedOrders}</h3>
        </div>
      </div>

      {/* Quotations & Sales Orders Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quotations Section */}
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Quotations</h3>
            <button onClick={() => navigate('/quotations')} className="text-xs text-[#38BDF8] hover:underline font-semibold">View All →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0F172A] text-[#94A3B8] uppercase text-xs">
                <tr>
                  <th className="p-3">Qtn #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {recentQuotations.length > 0 ? recentQuotations.map(q => (
                  <tr key={q._id} className="hover:bg-[#1E293B]">
                    <td className="p-3 font-semibold text-white">{q.quotationNumber}</td>
                    <td className="p-3 text-[#CBD5E1]">{q.customer?.name || 'N/A'}</td>
                    <td className="p-3 text-[#CBD5E1]">${q.grandTotal?.toFixed(2) || '0.00'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${q.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {q.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {q.status !== 'ACCEPTED' && (
                        <button onClick={() => convertToOrder(q._id)} className="px-2 py-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs rounded font-semibold">
                          Convert
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-[#94A3B8]">No quotations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales Orders Section */}
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Sales Orders</h3>
            <button onClick={() => navigate('/sales-orders')} className="text-xs text-[#38BDF8] hover:underline font-semibold">View All →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0F172A] text-[#94A3B8] uppercase text-xs">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {recentOrders.length > 0 ? recentOrders.map(o => (
                  <tr key={o._id} className="hover:bg-[#1E293B]">
                    <td className="p-3 font-semibold text-white">{o.orderNumber}</td>
                    <td className="p-3 text-[#CBD5E1]">{o.customer?.name || 'N/A'}</td>
                    <td className="p-3 text-[#CBD5E1]">${o.grandTotal?.toFixed(2) || '0.00'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400">
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                        className="bg-[#0F172A] border border-[#334155] text-white text-xs rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-[#94A3B8]">No sales orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Inventory = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    totalStockUnits: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [prodRes, catRes, suppRes, lowRes] = await Promise.all([
          fetch('http://localhost:5000/api/products', { headers }),
          fetch('http://localhost:5000/api/categories', { headers }),
          fetch('http://localhost:5000/api/suppliers', { headers }),
          fetch('http://localhost:5000/api/inventory/low-stock', { headers })
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();
        const suppData = await suppRes.json();
        const lowData = await lowRes.json();

        const products = prodData.data || [];
        const totalUnits = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);

        setStats({
          totalProducts: products.length,
          totalCategories: (catData.data || []).length,
          totalSuppliers: (suppData.data || []).length,
          totalStockUnits: totalUnits,
          lowStockCount: (lowData.data || []).length
        });
      } catch (err) {
        console.error('Failed to load inventory dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const navCards = [
    { title: 'Products', desc: 'Manage catalog, SKU, prices', path: '/products', icon: Package, color: 'bg-[#2563EB]/20 text-[#38BDF8]' },
    { title: 'Categories', desc: 'Warehouse classification', path: '/categories', icon: Building2, color: 'bg-[#38BDF8]/20 text-[#38BDF8]' },
    { title: 'Suppliers', desc: 'Vendor directory & contacts', path: '/suppliers', icon: Users, color: 'bg-[#2563EB]/20 text-[#38BDF8]' },
    { title: 'Stock Operations', desc: 'Stock-in & Stock-out control', path: '/stock/manage', icon: Activity, color: 'bg-[#16A34A]/20 text-[#4ADE80]' },
    { title: 'Movement History', desc: 'Audit trail & tracking', path: '/stock/history', icon: TrendingUp, color: 'bg-[#38BDF8]/20 text-[#38BDF8]' },
    { title: 'Low Stock Alerts', desc: 'Critical inventory warnings', path: '/stock/alerts', icon: ShieldCheck, color: 'bg-[#DC2626]/20 text-[#F87171]' },
  ];

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#172554] to-[#1E3A5F] rounded-2xl p-8 text-[#FFFFFF] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#334155]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#2563EB] text-[#FFFFFF] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
              <ShieldCheck size={12} /> Supply Chain OS
            </span>
            <span className="text-[#94A3B8] text-xs">| Real-time Inventory</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FFFFFF]">Inventory & Supplier Control</h1>
          <p className="text-[#CBD5E1] text-sm mt-1 max-w-xl">
            Monitor stock levels, manage warehouse items, track supplier pipelines, and audit stock movements.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#0F172A]/80 backdrop-blur-md px-5 py-3 rounded-xl border border-[#334155]">
          <Package size={24} className="text-[#38BDF8]" />
          <div>
            <p className="text-xs text-[#94A3B8] font-medium">Stock Status</p>
            <p className="text-sm font-bold text-[#FFFFFF] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span> {stats.lowStockCount} Low Stock Items
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#94A3B8]">Total Products</p>
            <p className="text-2xl font-bold text-[#FFFFFF] mt-1">{loading ? '...' : stats.totalProducts}</p>
          </div>
          <div className="p-3 bg-[#2563EB]/20 text-[#38BDF8] rounded-xl"><Package size={24} /></div>
        </div>
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#94A3B8]">Categories</p>
            <p className="text-2xl font-bold text-[#FFFFFF] mt-1">{loading ? '...' : stats.totalCategories}</p>
          </div>
          <div className="p-3 bg-[#38BDF8]/20 text-[#38BDF8] rounded-xl"><Building2 size={24} /></div>
        </div>
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#94A3B8]">Suppliers</p>
            <p className="text-2xl font-bold text-[#FFFFFF] mt-1">{loading ? '...' : stats.totalSuppliers}</p>
          </div>
          <div className="p-3 bg-[#2563EB]/20 text-[#38BDF8] rounded-xl"><Users size={24} /></div>
        </div>
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#94A3B8]">Total Stock Units</p>
            <p className="text-2xl font-bold text-[#FFFFFF] mt-1">{loading ? '...' : stats.totalStockUnits}</p>
          </div>
          <div className="p-3 bg-[#16A34A]/20 text-[#4ADE80] rounded-xl"><TrendingUp size={24} /></div>
        </div>
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#94A3B8]">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-[#F87171] mt-1">{loading ? '...' : stats.lowStockCount}</p>
          </div>
          <div className="p-3 bg-[#DC2626]/20 text-[#F87171] rounded-xl"><ShieldCheck size={24} /></div>
        </div>
      </div>

      {/* Quick Navigation Section */}
      <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-6 flex items-center gap-2">
          <Package size={20} className="text-[#38BDF8]" /> Supply Chain Modules & Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(card.path)}
                className="bg-[#0F172A] p-6 rounded-xl border border-[#334155] hover:border-[#38BDF8] transition-all cursor-pointer group flex items-start gap-4 shadow-sm"
              >
                <div className={`p-3 rounded-xl ${card.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#FFFFFF] group-hover:text-[#38BDF8] transition-colors">{card.title}</h4>
                  <p className="text-xs text-[#94A3B8] mt-1">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { default as ProductList } from './ProductList';
export { default as ProductForm } from './ProductForm';
export { default as CategoryManagement } from './CategoryManagement';
export { default as SupplierManagement } from './SupplierManagement';
export { default as StockManagement } from './StockManagement';
export { default as StockMovementHistory } from './StockMovementHistory';
export { default as LowStockAlerts } from './LowStockAlerts';
export { FinanceDashboard } from './FinanceDashboard';
export { IncomeManagement } from './IncomeManagement';
export { ExpenseManagement } from './ExpenseManagement';
export { TransactionHistory } from './TransactionHistory';
export { InvoiceList } from './InvoiceList';
export { InvoiceDetails } from './InvoiceDetails';
export { InvoiceForm } from './InvoiceForm';
export { default as NotificationList } from './NotificationList';
export { default as AnnouncementList } from '../components/AnnouncementList';
export { default as ReportsDashboard } from '../components/ReportsDashboard';
export { default as ActivityLogsPage } from '../components/ActivityLogsPage';
