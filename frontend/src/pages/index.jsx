import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, CalendarDays, ArrowRight, ShieldCheck, Activity, TrendingUp, Package, DollarSign, ShoppingCart, Clock, AlertTriangle, FileText } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563EB', '#38BDF8', '#16A34A', '#EAB308', '#EF4444', '#8B5CF6'];

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let endpoint = 'http://localhost:5000/api/dashboards/super-admin';
      
      if (user?.role === 'HR_MANAGER') endpoint = 'http://localhost:5000/api/dashboards/hr';
      else if (user?.role === 'FINANCE_MANAGER') endpoint = 'http://localhost:5000/api/dashboards/finance';
      else if (user?.role === 'SALES_MANAGER') endpoint = 'http://localhost:5000/api/dashboards/sales';
      else if (user?.role === 'INVENTORY_MANAGER') endpoint = 'http://localhost:5000/api/dashboards/inventory';
      else if (user?.role === 'EMPLOYEE') endpoint = 'http://localhost:5000/api/dashboards/employee';

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setError('Failed to load dashboard metrics from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user]);

  if (loading && !dashboardData) {
    return (
      <div className="p-12 text-center bg-[#0B1120] min-h-screen text-[#E2E8F0] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#94A3B8]">Loading Enterprise Dashboard ({user?.role || 'User'})...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-12 text-center bg-[#0B1120] min-h-screen text-[#E2E8F0] flex flex-col items-center justify-center">
        <AlertTriangle size={48} className="text-[#EF4444] mb-4" />
        <p className="text-xl font-bold text-white mb-2">Dashboard Error</p>
        <p className="text-[#94A3B8] mb-6">{error}</p>
        <button onClick={fetchDashboard} className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold shadow transition-all">
          Retry
        </button>
      </div>
    );
  }

  const role = user?.role || 'SUPER_ADMIN';

  // Render Super Admin Dashboard
  if (role === 'SUPER_ADMIN') {
    const stats = dashboardData?.stats || {};
    const charts = dashboardData?.charts || {};
    return (
      <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
        <WelcomeBanner name={user?.name} role="Super Administrator" />
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Total Employees" value={stats.totalEmployees || 0} icon={Users} color="bg-[#2563EB]/20 text-[#38BDF8]" />
          <StatCard title="Active Employees" value={stats.activeEmployees || 0} icon={Users} color="bg-[#16A34A]/20 text-[#16A34A]" />
          <StatCard title="Departments" value={stats.totalDepartments || 0} icon={Building2} color="bg-[#38BDF8]/20 text-[#38BDF8]" />
          <StatCard title="Today's Attendance" value={stats.todayAttendance || 0} icon={CalendarDays} color="bg-[#2563EB]/20 text-[#38BDF8]" />
          <StatCard title="Pending Leaves" value={stats.pendingLeaveRequests || 0} icon={Clock} color="bg-[#EAB308]/20 text-[#EAB308]" />
          <StatCard title="Total Customers" value={stats.totalCustomers || 0} icon={Users} color="bg-[#8B5CF6]/20 text-[#8B5CF6]" />
          <StatCard title="Total Sales" value={`$${(stats.totalSales || 0).toLocaleString()}`} icon={DollarSign} color="bg-[#16A34A]/20 text-[#16A34A]" />
          <StatCard title="Total Expenses" value={`$${(stats.totalExpenses || 0).toLocaleString()}`} icon={DollarSign} color="bg-[#EF4444]/20 text-[#EF4444]" />
          <StatCard title="Products" value={stats.totalProducts || 0} icon={Package} color="bg-[#38BDF8]/20 text-[#38BDF8]" />
          <StatCard title="Low Stock Alerts" value={stats.lowStockProducts || 0} icon={AlertTriangle} color="bg-[#EF4444]/20 text-[#EF4444]" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
            <h3 className="text-base font-bold text-white mb-4">Monthly Sales & Financial Performance</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlySales || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="_id" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' }} />
                  <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
            <h3 className="text-base font-bold text-white mb-4">Department-wise Employee Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.departmentDistribution || []} dataKey="employeeCount" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {(charts.departmentDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tables / Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
            <h3 className="text-base font-bold text-white mb-4">Pending Approvals</h3>
            <div className="space-y-3">
              {dashboardData?.pendingApprovals?.length === 0 ? (
                <p className="text-sm text-[#94A3B8]">No pending leave approvals.</p>
              ) : (
                dashboardData?.pendingApprovals?.map((item) => (
                  <div key={item._id} className="p-3.5 bg-[#0F172A] rounded-xl border border-[#334155] flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.employee?.fullName || 'Employee'}</p>
                      <p className="text-xs text-[#94A3B8]">Leave Type: {item.leaveType} ({item.startDate?.split('T')[0]} to {item.endDate?.split('T')[0]})</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold bg-[#EAB308]/20 text-[#EAB308] rounded-full">Pending</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
            <h3 className="text-base font-bold text-white mb-4">Low Stock Alerts</h3>
            <div className="space-y-3">
              {dashboardData?.lowStockList?.length === 0 ? (
                <p className="text-sm text-[#94A3B8]">All products have sufficient stock.</p>
              ) : (
                dashboardData?.lowStockList?.map((prod) => (
                  <div key={prod._id} className="p-3.5 bg-[#0F172A] rounded-xl border border-[#334155] flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-white">{prod.name} (SKU: {prod.sku})</p>
                      <p className="text-xs text-[#EF4444]">Current Stock: {prod.currentStock} (Min: {prod.minStockLevel})</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold bg-[#EF4444]/20 text-[#EF4444] rounded-full">Low Stock</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render HR Manager Dashboard
  if (role === 'HR_MANAGER') {
    const stats = dashboardData?.stats || {};
    const charts = dashboardData?.charts || {};
    return (
      <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
        <WelcomeBanner name={user?.name} role="HR Manager" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Employees" value={stats.totalEmployees || 0} icon={Users} color="bg-[#2563EB]/20 text-[#38BDF8]" />
          <StatCard title="Active Employees" value={stats.activeEmployees || 0} icon={Users} color="bg-[#16A34A]/20 text-[#16A34A]" />
          <StatCard title="Pending Leave Requests" value={stats.pendingLeaveRequests || 0} icon={Clock} color="bg-[#EAB308]/20 text-[#EAB308]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155]">
            <h3 className="text-base font-bold text-white mb-4">Department Employee Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.departmentDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' }} />
                  <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155]">
            <h3 className="text-base font-bold text-white mb-4">Employee Performance Ratings Overview</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dashboardData?.performanceOverview?.map((emp) => (
                <div key={emp._id} className="p-3 bg-[#0F172A] rounded-xl flex justify-between items-center border border-[#334155]">
                  <span className="text-sm font-semibold text-white">{emp.fullName}</span>
                  <span className="px-2.5 py-1 text-xs font-bold bg-[#16A34A]/20 text-[#16A34A] rounded-full">
                    Rating: {emp.performanceRating || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Finance Manager Dashboard
  if (role === 'FINANCE_MANAGER') {
    const stats = dashboardData?.stats || {};
    const charts = dashboardData?.charts || {};
    return (
      <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
        <WelcomeBanner name={user?.name} role="Finance Manager" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatCard title="Total Income" value={`$${(stats.totalIncome || 0).toLocaleString()}`} icon={DollarSign} color="bg-[#16A34A]/20 text-[#16A34A]" />
          <StatCard title="Total Expenses" value={`$${(stats.totalExpenses || 0).toLocaleString()}`} icon={DollarSign} color="bg-[#EF4444]/20 text-[#EF4444]" />
          <StatCard title="Net Balance" value={`$${(stats.netBalance || 0).toLocaleString()}`} icon={TrendingUp} color="bg-[#2563EB]/20 text-[#38BDF8]" />
          <StatCard title="Pending Payments" value={stats.pendingPayments || 0} icon={Clock} color="bg-[#EAB308]/20 text-[#EAB308]" />
          <StatCard title="Paid Invoices" value={stats.paidInvoices || 0} icon={ShieldCheck} color="bg-[#16A34A]/20 text-[#16A34A]" />
        </div>
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155]">
          <h3 className="text-base font-bold text-white mb-4">Monthly Financial Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyFinancials || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="_id.month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' }} />
                <Bar dataKey="total" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // Render Sales Manager Dashboard
  if (role === 'SALES_MANAGER') {
    const stats = dashboardData?.stats || {};
    const charts = dashboardData?.charts || {};
    return (
      <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
        <WelcomeBanner name={user?.name} role="Sales Manager" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Customers" value={stats.totalCustomers || 0} icon={Users} color="bg-[#2563EB]/20 text-[#38BDF8]" />
          <StatCard title="Total Orders" value={stats.totalOrders || 0} icon={ShoppingCart} color="bg-[#8B5CF6]/20 text-[#8B5CF6]" />
          <StatCard title="Sales Revenue" value={`$${(stats.salesRevenue || 0).toLocaleString()}`} icon={DollarSign} color="bg-[#16A34A]/20 text-[#16A34A]" />
          <StatCard title="Pending Orders" value={stats.pendingOrders || 0} icon={Clock} color="bg-[#EAB308]/20 text-[#EAB308]" />
        </div>
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155]">
          <h3 className="text-base font-bold text-white mb-4">Monthly Sales Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlySales || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="_id" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' }} />
                <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // Render Inventory Manager Dashboard
  if (role === 'INVENTORY_MANAGER') {
    const stats = dashboardData?.stats || {};
    return (
      <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
        <WelcomeBanner name={user?.name} role="Inventory Manager" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Products" value={stats.totalProducts || 0} icon={Package} color="bg-[#2563EB]/20 text-[#38BDF8]" />
          <StatCard title="Low Stock Products" value={stats.lowStockProducts || 0} icon={AlertTriangle} color="bg-[#EF4444]/20 text-[#EF4444]" />
          <StatCard title="Stock Movements" value={stats.totalStockMovements || 0} icon={TrendingUp} color="bg-[#16A34A]/20 text-[#16A34A]" />
        </div>
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155]">
          <h3 className="text-base font-bold text-white mb-4">Recent Stock Movements</h3>
          <div className="space-y-3">
            {dashboardData?.recentMovements?.map((mov) => (
              <div key={mov._id} className="p-3.5 bg-[#0F172A] rounded-xl border border-[#334155] flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-white">{mov.product?.name || 'Product'} (SKU: {mov.product?.sku || 'N/A'})</p>
                  <p className="text-xs text-[#94A3B8]">Type: {mov.type} | Quantity: {mov.quantity}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${mov.type === 'IN' ? 'bg-[#16A34A]/20 text-[#16A34A]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                  {mov.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Employee Dashboard
  const leaveBalance = dashboardData?.leaveBalance || { total: 20, used: 0, pending: 0 };
  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <WelcomeBanner name={user?.name} role="Employee Portal" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Leave Balance (Total / Used)" value={`${leaveBalance.total - leaveBalance.used} / ${leaveBalance.used}`} icon={CalendarDays} color="bg-[#2563EB]/20 text-[#38BDF8]" />
        <StatCard title="Pending Leave Requests" value={leaveBalance.pending} icon={Clock} color="bg-[#EAB308]/20 text-[#EAB308]" />
        <StatCard title="Assigned Tasks" value={dashboardData?.assignedTasks?.length || 0} icon={FileText} color="bg-[#16A34A]/20 text-[#16A34A]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155]">
          <h3 className="text-base font-bold text-white mb-4">Announcements</h3>
          <div className="space-y-3">
            {dashboardData?.announcements?.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No active announcements.</p>
            ) : (
              dashboardData?.announcements?.map((ann) => (
                <div key={ann._id} className="p-3.5 bg-[#0F172A] rounded-xl border border-[#334155]">
                  <p className="text-sm font-bold text-white">{ann.title}</p>
                  <p className="text-xs text-[#CBD5E1] mt-1">{ann.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155]">
          <h3 className="text-base font-bold text-white mb-4">Assigned Tasks</h3>
          <div className="space-y-3">
            {dashboardData?.assignedTasks?.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No tasks assigned.</p>
            ) : (
              dashboardData?.assignedTasks?.map((task) => (
                <div key={task._id} className="p-3.5 bg-[#0F172A] rounded-xl border border-[#334155] flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-white">{task.title}</p>
                    <p className="text-xs text-[#94A3B8]">Priority: {task.priority} | Due: {task.dueDate?.split('T')[0]}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-[#2563EB]/20 text-[#38BDF8] rounded-full">{task.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WelcomeBanner = ({ name, role }) => (
  <div className="bg-gradient-to-r from-[#172554] to-[#1E3A5F] rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#334155]">
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-[#2563EB] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
          <ShieldCheck size={12} /> Enterprise Verified ({role})
        </span>
        <span className="text-[#94A3B8] text-xs">| Apex ERP OS v4.2</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome back, {name || 'User'}</h1>
      <p className="text-[#CBD5E1] text-sm mt-1 max-w-xl">
        Here is your live enterprise overview, workforce analytics, and operational metrics for today.
      </p>
    </div>
    <div className="flex items-center gap-3 bg-[#0F172A]/80 backdrop-blur-md px-5 py-3 rounded-xl border border-[#334155]">
      <Activity size={24} className="text-[#38BDF8]" />
      <div>
        <p className="text-xs text-[#94A3B8] font-medium">System Status</p>
        <p className="text-sm font-bold text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span> All Services Online
        </p>
      </div>
    </div>
  </div>
);

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
export { ActivityLogsPage } from '../components/ActivityLogsPage';

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

export const Sales = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalQuotations: 0,
    pendingQuotations: 0,
    totalSalesOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const [custRes, quotRes, orderRes] = await Promise.all([
          axios.get('http://localhost:5000/api/customers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/quotations', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/sales-orders', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const customers = custRes.data.success ? (custRes.data.data || custRes.data.customers || []) : [];
        const quotations = quotRes.data.success ? (quotRes.data.data || quotRes.data.quotations || []) : [];
        const orders = orderRes.data.success ? (orderRes.data.data || orderRes.data.orders || []) : [];

        const pendingQ = quotations.filter(q => q.status === 'PENDING' || q.status === 'Sent');
        const confirmedO = orders.filter(o => o.status === 'CONFIRMED' || o.status === 'Completed');
        const revenue = confirmedO.reduce((acc, o) => acc + (o.grandTotal || o.totalAmount || 0), 0);

        setStats({
          totalCustomers: customers.length,
          totalQuotations: quotations.length,
          pendingQuotations: pendingQ.length,
          totalSalesOrders: orders.length,
          confirmedOrders: confirmedO.length,
          totalRevenue: revenue
        });
      } catch (err) {
        console.error('Failed to load sales stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center bg-[#0B1120] min-h-screen text-[#E2E8F0]">
        <div className="w-8 h-8 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#94A3B8]">Loading Sales & Quotations Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div>
        <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Commercial Management</p>
        <h1 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">Sales & Quotations Dashboard</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Manage client accounts, sales pipelines, quotations, and sales orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} color="bg-[#2563EB]/20 text-[#38BDF8]" />
        <StatCard title="Quotations" value={stats.totalQuotations} icon={FileText} color="bg-[#38BDF8]/20 text-[#38BDF8]" />
        <StatCard title="Sales Orders" value={stats.totalSalesOrders} icon={ShoppingCart} color="bg-[#16A34A]/20 text-[#16A34A]" />
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-[#16A34A]/20 text-[#16A34A]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div onClick={() => navigate('/sales/customers')} className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm cursor-pointer hover:border-[#38BDF8] transition-all group">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#38BDF8] flex items-center justify-between">
            Customer Directory <ArrowRight size={18} />
          </h3>
          <p className="text-xs text-[#94A3B8]">Manage customer records, contacts, and account histories.</p>
        </div>
        <div onClick={() => navigate('/sales/quotations')} className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm cursor-pointer hover:border-[#38BDF8] transition-all group">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#38BDF8] flex items-center justify-between">
            Quotations <ArrowRight size={18} />
          </h3>
          <p className="text-xs text-[#94A3B8]">Create and track client price quotes and proposals.</p>
        </div>
        <div onClick={() => navigate('/sales/orders')} className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm cursor-pointer hover:border-[#38BDF8] transition-all group">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#38BDF8] flex items-center justify-between">
            Sales Orders <ArrowRight size={18} />
          </h3>
          <p className="text-xs text-[#94A3B8]">Process confirmed sales orders and fulfillment pipelines.</p>
        </div>
      </div>
    </div>
  );
};

export { default as CustomerList } from './CustomerList';
export { default as CustomerForm } from './CustomerForm';
export { default as CustomerDetails } from './CustomerDetails';
export { default as QuotationList } from './QuotationList';
export { default as QuotationForm } from './QuotationForm';
export { default as QuotationDetails } from './QuotationDetails';
export { default as SalesOrderList } from './SalesOrderList';
export { default as SalesOrderDetails } from './SalesOrderDetails';
export { default as SalesOrderForm } from './SalesOrderForm';
export { Inventory } from './Inventory';
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
export { InvoiceForm } from './InvoiceForm';
export { InvoiceDetails } from './InvoiceDetails';
export { default as NotificationList } from '../pages/NotificationList';
export { default as AnnouncementList } from '../components/AnnouncementList';
export { default as ReportsDashboard } from '../components/ReportsDashboard';
export { ProjectList } from './ProjectList';
export { ProjectForm } from './ProjectForm';
export { ProjectDetails } from './ProjectDetails';
export { TaskList } from './TaskList';
export { TaskForm } from './TaskForm';
export { TaskDetails } from './TaskDetails';
export { TaskBoard } from './TaskBoard';
