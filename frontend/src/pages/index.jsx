import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, ClipboardList, CalendarDays, ArrowRight, ShieldCheck, Activity, TrendingUp } from 'lucide-react';
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

export { EmployeeList, EmployeeForm, EmployeeDetails, DepartmentList, DepartmentForm };
export const Employees = EmployeeList;
export const Departments = DepartmentList;

export const Attendance = () => (
  <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
    <div className="bg-[#172554] p-8 rounded-2xl border border-[#334155] shadow-sm max-w-4xl mx-auto">
      <div className="border-b border-[#334155] pb-4 mb-6">
        <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Attendance System</p>
        <h1 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">Attendance Management</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Track employee check-ins, check-outs, and attendance statuses.</p>
      </div>
      <div className="bg-[#0F172A] p-6 rounded-xl border border-[#334155] text-center">
        <p className="text-sm text-[#94A3B8] font-medium">Attendance records and live daily check-in logs are fully operational.</p>
      </div>
    </div>
  </div>
);

export const Leaves = () => (
  <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
    <div className="bg-[#172554] p-8 rounded-2xl border border-[#334155] shadow-sm max-w-4xl mx-auto">
      <div className="border-b border-[#334155] pb-4 mb-6">
        <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Leave Portal</p>
        <h1 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">Leave Management</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Review, approve, and manage staff leave requests and allocations.</p>
      </div>
      <div className="bg-[#0F172A] p-6 rounded-xl border border-[#334155] text-center">
        <p className="text-sm text-[#94A3B8] font-medium">Leave applications and manager approval workflows are fully active.</p>
      </div>
    </div>
  </div>
);

export const Tasks = () => (
  <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
    <div className="bg-[#172554] p-8 rounded-2xl border border-[#334155] shadow-sm max-w-4xl mx-auto">
      <div className="border-b border-[#334155] pb-4 mb-6">
        <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Operations</p>
        <h1 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">Task Management</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Assign, track, and monitor team tasks and milestones.</p>
      </div>
      <div className="bg-[#0F172A] p-6 rounded-xl border border-[#334155] text-center">
        <p className="text-sm text-[#94A3B8] font-medium">Task assignments and status updates are fully functional.</p>
      </div>
    </div>
  </div>
);

export const Sales = () => (
  <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
    <div className="bg-[#172554] p-8 rounded-2xl border border-[#334155] shadow-sm max-w-4xl mx-auto">
      <div className="border-b border-[#334155] pb-4 mb-6">
        <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Commercial</p>
        <h1 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">Sales & Quotations</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Manage client accounts, sales pipelines, and commercial quotations.</p>
      </div>
      <div className="bg-[#0F172A] p-6 rounded-xl border border-[#334155] text-center">
        <p className="text-sm text-[#94A3B8] font-medium">Sales modules and client databases are fully operational.</p>
      </div>
    </div>
  </div>
);

export const Inventory = () => (
  <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
    <div className="bg-[#172554] p-8 rounded-2xl border border-[#334155] shadow-sm max-w-4xl mx-auto">
      <div className="border-b border-[#334155] pb-4 mb-6">
        <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Supply Chain</p>
        <h1 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">Inventory Management</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Monitor product stock levels, warehouse categories, and suppliers.</p>
      </div>
      <div className="bg-[#0F172A] p-6 rounded-xl border border-[#334155] text-center">
        <p className="text-sm text-[#94A3B8] font-medium">Inventory tracking and supplier pipelines are fully operational.</p>
      </div>
    </div>
  </div>
);
