import { LayoutDashboard, Users, Building2, CalendarClock, FileText, ClipboardList, ShoppingCart, Package, History, Settings, BarChart2 } from 'lucide-react';

export const navLinks = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Employees', path: '/employees', icon: Users },
  { name: 'Departments', path: '/departments', icon: Building2 },
  { name: 'Attendance', path: '/attendance', icon: CalendarClock },
  { name: 'Attendance History', path: '/attendance/history', icon: History },
  { name: 'Attendance Management', path: '/attendance/management', icon: Settings },
  { name: 'Attendance Report', path: '/attendance/report', icon: BarChart2 },
  { name: 'Leaves', path: '/leaves', icon: FileText },
  { name: 'Tasks', path: '/tasks', icon: ClipboardList },
  { name: 'Sales', path: '/sales', icon: ShoppingCart },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Quotations', path: '/quotations', icon: FileText },
  { name: 'Finance', path: '/finance', icon: FileText },
  { name: 'Income', path: '/income', icon: FileText },
  { name: 'Expenses', path: '/expenses', icon: FileText },
  { name: 'Invoices', path: '/invoices', icon: FileText },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Categories', path: '/categories', icon: Package },
  { name: 'Suppliers', path: '/suppliers', icon: Users },
];
