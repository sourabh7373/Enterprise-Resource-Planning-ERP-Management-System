import { NavLink } from 'react-router-dom';
import { navLinks } from '../constants/navigation';
import { LayoutGrid, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Role-based navigation mapping
const rolePermissions = {
  SUPER_ADMIN: [
    'Dashboard', 'Employees', 'Departments', 'Attendance', 'Leaves', 'Tasks',
    'Sales', 'Customers', 'Quotations', 'Finance', 'Income', 'Expenses',
    'Invoices', 'Inventory', 'Products', 'Categories', 'Suppliers'
  ],
  HR_MANAGER: ['Dashboard', 'Employees', 'Departments', 'Attendance', 'Leaves', 'Tasks'],
  FINANCE_MANAGER: ['Dashboard', 'Finance', 'Income', 'Expenses', 'Invoices'],
  SALES_MANAGER: ['Dashboard', 'Sales', 'Customers', 'Quotations'],
  INVENTORY_MANAGER: ['Dashboard', 'Inventory', 'Products', 'Categories', 'Suppliers'],
  EMPLOYEE: ['Dashboard', 'Attendance', 'Leaves', 'Tasks'],
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  // Filter navigation links based on user role
  const allowedLinks = navLinks.filter((link) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    const permissions = rolePermissions[user.role] || ['Dashboard'];
    return permissions.includes(link.name);
  });

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] text-white transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <LayoutGrid size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">ERP System</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Enterprise Management</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {allowedLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                  isActive 
                    ? 'bg-[#4F46E5] text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span className="font-medium">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-slate-400 hover:text-white transition-colors">
          <Settings size={18} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
