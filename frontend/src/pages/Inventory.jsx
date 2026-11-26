import React from 'react';
import { Package, Plus, Edit2, Trash2, ArrowUpCircle, History, AlertTriangle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Inventory = () => {
  const navigate = useNavigate();

  const cards = [
    { title: 'Products', description: 'Manage inventory items, SKUs, and pricing', path: '/products', icon: Package, color: 'bg-blue-600' },
    { title: 'Categories', description: 'Organize products into categories', path: '/categories', icon: Package, color: 'bg-indigo-600' },
    { title: 'Suppliers', description: 'Manage vendor and supplier relationships', path: '/suppliers', icon: Users, color: 'bg-purple-600' },
    { title: 'Stock Management', description: 'Process Stock-In and Stock-Out operations', path: '/inventory/stock', icon: ArrowUpCircle, color: 'bg-green-600' },
    { title: 'Movement History', description: 'Trace all stock adjustments and audit trails', path: '/inventory/movements', icon: History, color: 'bg-amber-600' },
    { title: 'Low Stock Alerts', description: 'View items below minimum stock threshold', path: '/inventory/low-stock', icon: AlertTriangle, color: 'bg-red-600' },
  ];

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div>
        <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Inventory Module</p>
        <h1 className="text-3xl font-bold text-[#FFFFFF] mt-1">Inventory & Supplier Management</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Select an inventory module below to manage stocks, suppliers, and audit trails.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.path)}
              className="bg-[#172554] border border-[#334155] rounded-2xl p-6 hover:border-[#38BDF8] transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center text-white mb-4 shadow`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-[#94A3B8]">{card.description}</p>
              </div>
              <div className="mt-6 flex items-center text-[#38BDF8] text-sm font-medium">
                Open Module &rarr;
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
