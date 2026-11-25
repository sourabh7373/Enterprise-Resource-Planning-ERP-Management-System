import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Eye, Edit2, CheckCircle2, FileText, ShoppingCart, Calendar, Filter } from 'lucide-react';

const SalesOrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/sales-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sales orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/sales-orders/${id}/status`, { orderStatus: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#94A3B8]">Loading Sales Orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0] flex items-center justify-center">
        <div className="bg-[#172554] p-6 rounded-xl border border-red-500/50 text-center max-w-md">
          <h3 className="text-lg font-bold text-red-400 mb-2">Error Loading Data</h3>
          <p className="text-sm text-[#CBD5E1] mb-4">{error}</p>
          <button onClick={fetchOrders} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-semibold">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <div>
          <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Order Management</p>
          <h1 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">Sales Orders</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Manage customer orders, track fulfillment status, and process deliveries.</p>
        </div>
        <button
          onClick={() => navigate('/sales-orders/create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Create Sales Order
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#172554] p-4 rounded-2xl border border-[#334155]">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search order # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#38BDF8]"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Sales Orders Table */}
      <div className="bg-[#172554] rounded-2xl border border-[#334155] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0F172A] text-[#94A3B8] uppercase text-xs">
              <tr>
                <th className="p-4">Order Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Order Date</th>
                <th className="p-4">Items</th>
                <th className="p-4">Subtotal</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Tax</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-[#1E293B] transition-colors">
                    <td className="p-4 font-semibold text-white flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-[#38BDF8]" />
                      {o.orderNumber}
                    </td>
                    <td className="p-4 text-[#CBD5E1]">{o.customer?.name || 'N/A'}</td>
                    <td className="p-4 text-[#CBD5E1]">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4 text-[#CBD5E1]">{o.orderItems?.length || 0}</td>
                    <td className="p-4 text-[#CBD5E1]">${o.subtotal?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 text-[#CBD5E1]">${o.discount?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 text-[#CBD5E1]">${o.tax?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 font-bold text-white">${o.grandTotal?.toFixed(2) || '0.00'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        o.orderStatus === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                        o.orderStatus === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' :
                        o.orderStatus === 'PROCESSING' ? 'bg-indigo-500/20 text-indigo-400' :
                        o.orderStatus === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {o.orderStatus || 'DRAFT'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {o.orderStatus === 'DRAFT' && (
                          <button
                            onClick={() => handleStatusUpdate(o._id, 'CONFIRMED')}
                            title="Confirm Order"
                            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {o.orderStatus === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusUpdate(o._id, 'PROCESSING')}
                            title="Start Processing"
                            className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {o.orderStatus === 'PROCESSING' && (
                          <button
                            onClick={() => handleStatusUpdate(o._id, 'COMPLETED')}
                            title="Complete Order"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/sales-orders/${o._id}`)}
                          title="View Sales Order"
                          className="p-1.5 bg-[#0F172A] hover:bg-[#334155] text-[#38BDF8] rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-[#94A3B8]">
                    No sales orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderList;
