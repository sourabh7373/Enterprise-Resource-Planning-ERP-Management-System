import { NavLink } from 'react-router-dom';
import { navLinks } from '../constants/navigation';
import { Building2, LogOut } from 'lucide-react';
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
  EMPLOYEE: ['Dashboard', 'Attendance', 'Leaves', 'Apply Leave', 'Tasks'],
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  // Filter navigation links based on user role
  const allowedLinks = navLinks.filter((link) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    const permissions = rolePermissions[user.role] || ['Dashboard'];
    return permissions.includes(link.name);
  });

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-[#E2E8F0] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col shadow-xl border-r border-[#334155]`}>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#334155] bg-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="bg-[#2563EB] p-2.5 rounded-xl shadow-inner flex items-center justify-center text-white">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-[#FFFFFF]">Apex ERP</h1>
              <p className="text-[10px] text-[#38BDF8] font-semibold uppercase tracking-wider">Enterprise Cloud</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider mb-2">Main Navigation</p>
          {allowedLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? 'bg-[#2563EB] text-[#FFFFFF] shadow-md shadow-blue-900/30 font-semibold'
                      : 'text-[#E2E8F0] hover:bg-[#111C33] hover:text-[#FFFFFF]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? 'text-[#FFFFFF]' : 'text-[#94A3B8]'} />
                    <span>{link.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
        
        {/* User Profile & Logout section at bottom of sidebar */}
        <div className="p-4 border-t border-[#334155] bg-[#0B1120]/80">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-[#38BDF8] text-[#0F172A] flex items-center justify-center font-bold text-sm shadow">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#FFFFFF] truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-[#38BDF8] truncate font-medium">{user?.role ? user.role.replace('_', ' ') : 'Enterprise User'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-300 hover:text-white bg-red-950/40 hover:bg-red-600 rounded-xl transition-all border border-red-900/50"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
