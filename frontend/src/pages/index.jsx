import React from 'react';
import { Users, Building2, ClipboardList, CalendarDays, ArrowRight, Clock } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { AnalyticsSection } from '../components/AnalyticsSection';

export const Dashboard = () => {
  const stats = [
    { title: 'Total Employees', value: '128', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { title: 'Departments', value: '12', icon: Building2, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Pending Tasks', value: '24', icon: ClipboardList, color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Leave Requests', value: '8', icon: CalendarDays, color: 'bg-amber-50 text-amber-600' },
  ];

  const activities = [
    { id: 1, text: 'New employee onboarded: John Doe', time: '2 hours ago' },
    { id: 2, text: 'Department meeting scheduled', time: '4 hours ago' },
    { id: 3, text: 'Task "Q4 Report" completed', time: '6 hours ago' },
  ];

  return (
    <div className="p-8 space-y-8 bg-[#F5F7FB] min-h-screen">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overview</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, Admin. Here's what's happening across your organization today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <AnalyticsSection />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500" />
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{act.text}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-6">Quick Access</h3>
          <div className="space-y-3">
            {['Employees', 'Attendance', 'Leaves', 'Tasks'].map((item) => (
              <button key={item} className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <span className="text-sm font-medium text-slate-700">{item}</span>
                <ArrowRight size={16} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Employees = () => <div className="p-8"><h1>Employees Page</h1></div>;
export const Departments = () => <div className="p-8"><h1>Departments Page</h1></div>;
export const Attendance = () => <div className="p-8"><h1>Attendance Page</h1></div>;
export const Leaves = () => <div className="p-8"><h1>Leaves Page</h1></div>;
export const Tasks = () => <div className="p-8"><h1>Tasks Page</h1></div>;
export const Sales = () => <div className="p-8"><h1>Sales Page</h1></div>;
export const Inventory = () => <div className="p-8"><h1>Inventory Page</h1></div>;
