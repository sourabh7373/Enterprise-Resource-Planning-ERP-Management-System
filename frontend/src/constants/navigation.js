import { LayoutDashboard, Users, Building2, CalendarClock, FileText, ClipboardList, ShoppingCart, Package } from 'lucide-react';

export const navLinks = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Employees', path: '/employees', icon: Users },
  { name: 'Departments', path: '/departments', icon: Building2 },
  { name: 'Attendance', path: '/attendance', icon: CalendarClock },
  { name: 'Leaves', path: '/leaves', icon: FileText },
  { name: 'Tasks', path: '/tasks', icon: ClipboardList },
  { name: 'Sales', path: '/sales', icon: ShoppingCart },
  { name: 'Inventory', path: '/inventory', icon: Package },
];
