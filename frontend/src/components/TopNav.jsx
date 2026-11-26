import { Bell, Search, Menu, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

const TopNav = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Generate dynamic breadcrumb from pathname
  const pathnames = location.pathname.split('/').filter((x) => x);
  const pageTitle = pathnames.length > 0 
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1) 
    : 'Dashboard';

  return (
    <header className="sticky top-0 z-40 bg-[#111C33] border-b border-[#334155] px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden text-[#CBD5E1] hover:text-[#FFFFFF] transition-colors p-1.5 rounded-lg hover:bg-[#0F172A]">
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-base font-bold text-[#FFFFFF] tracking-tight capitalize">
            {pageTitle === 'Create' ? 'Add Record' : pageTitle === 'Edit' ? 'Edit Record' : pageTitle}
          </h1>
          <nav className="text-xs text-[#CBD5E1] flex items-center gap-1.5 mt-0.5">
            <span>Apex ERP</span>
            <span>/</span>
            <span className="text-[#38BDF8] font-medium capitalize">{pageTitle}</span>
          </nav>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Global search records..."
            className="pl-9 pr-4 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] w-64 transition-all"
          />
        </div>

        <NotificationDropdown />

        <div className="flex items-center gap-3 pl-4 border-l border-[#334155]">
          <div className="w-9 h-9 bg-[#2563EB] rounded-xl flex items-center justify-center text-[#FFFFFF] font-bold text-sm ring-1 ring-[#38BDF8]/40">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-[#FFFFFF] flex items-center gap-1">
              {user?.name || 'Enterprise User'}
              <ShieldCheck size={14} className="text-[#38BDF8]" />
            </p>
            <p className="text-[10px] text-[#CBD5E1] font-medium uppercase tracking-wider">
              {user?.role ? user.role.replace('_', ' ') : 'Administrator'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
