import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import axios from 'axios';

const LowStockAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/inventory/low-stock', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data);
    } catch (err) {
      setError('Failed to fetch low stock alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Inventory</p>
          <h1 className="text-2xl font-bold text-[#FFFFFF] mt-1 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={28} /> Low Stock Alerts
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-400">{error}</div>
      ) : (
        <div className="bg-[#172554] rounded-xl border border-[#334155] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#0F172A] text-[#94A3B8] text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Minimum Level</th>
                <th className="px-6 py-4">Alert Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {alerts.map(p => (
                <tr key={p._id} className="hover:bg-[#1E293B]">
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-[#38BDF8] font-mono">{p.SKU}</td>
                  <td className="px-6 py-4">{p.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{p.supplier?.companyName || p.supplier?.name || 'N/A'}</td>
                  <td className="px-6 py-4 font-bold text-red-400">{p.currentStock}</td>
                  <td className="px-6 py-4">{p.minimumStockLevel}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-red-300 bg-red-950 px-2 py-1 rounded-full text-xs w-fit">
                      <AlertTriangle size={14} /> Critical Stock
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {alerts.length === 0 && (
            <div className="p-12 text-center text-green-400 font-medium">
              All product stock levels are healthy! No low stock alerts.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;
