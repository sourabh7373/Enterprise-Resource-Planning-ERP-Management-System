import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingCart, User, Calendar, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

const SalesOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/sales-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sales order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/sales-orders/${id}/status`, { orderStatus: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#94A3B8]">Loading Sales Order Details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0] flex items-center justify-center">
        <div className="bg-[#172554] p-6 rounded-xl border border-red-500/50 text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-400 mb-2">Error</h3>
          <p className="text-sm text-[#CBD5E1] mb-4">{error || 'Sales order not found'}</p>
          <button onClick={() => navigate('/sales-orders')} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-semibold">Back to Sales Orders</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/sales-orders')}
          className="flex items-center gap-2 text-sm text-[#38BDF8] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sales Orders
        </button>
        <div className="flex items-center gap-3">
          {order.orderStatus === 'DRAFT' && (
            <button
              onClick={() => handleStatusUpdate('CONFIRMED')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow transition-all"
            >
              Confirm Order
            </button>
          )}
          {order.orderStatus === 'CONFIRMED' && (
            <button
              onClick={() => handleStatusUpdate('PROCESSING')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow transition-all"
            >
              Start Processing
            </button>
          )}
          {order.orderStatus === 'PROCESSING' && (
            <button
              onClick={() => handleStatusUpdate('COMPLETED')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition-all"
            >
              Complete Order
            </button>
          )}
          {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'COMPLETED' && (
            <button
              onClick={() => handleStatusUpdate('CANCELLED')}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-semibold transition-all"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-[#172554] p-8 rounded-2xl border border-[#334155] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#334155] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-5 h-5 text-[#38BDF8]" />
              <h1 className="text-2xl font-extrabold text-white">{order.orderNumber}</h1>
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${
                order.orderStatus === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                order.orderStatus === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' :
                order.orderStatus === 'PROCESSING' ? 'bg-indigo-500/20 text-indigo-400' :
                order.orderStatus === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {order.orderStatus}
              </span>
            </div>
            {order.quotation && (
              <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-1">
                <FileText className="w-3.5 h-3.5 text-[#38BDF8]" /> Converted from Quotation: {order.quotation.quotationNumber}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-[#94A3B8]">Order Date</p>
            <p className="text-sm font-semibold text-white">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Customer & Creator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#334155]">
            <h3 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-3">Customer Information</h3>
            <p className="font-bold text-white text-base">{order.customer?.name || 'N/A'}</p>
            <p className="text-sm text-[#CBD5E1] mt-1">Email: {order.customer?.email || 'N/A'}</p>
            <p className="text-sm text-[#CBD5E1]">Phone: {order.customer?.phone || 'N/A'}</p>
            {order.customer?.address && <p className="text-sm text-[#CBD5E1]">Address: {order.customer.address}</p>}
          </div>

          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#334155]">
            <h3 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-3">Created By</h3>
            <p className="font-bold text-white text-base">{order.createdBy?.name || 'System User'}</p>
            <p className="text-sm text-[#CBD5E1] mt-1">Email: {order.createdBy?.email || 'N/A'}</p>
          </div>
        </div>

        {/* Order Items Table */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Order Items</h3>
          <div className="bg-[#0F172A] rounded-xl border border-[#334155] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#172554] text-[#94A3B8] uppercase text-xs">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5 text-center">Quantity</th>
                  <th className="p-3.5 text-right">Unit Price</th>
                  <th className="p-3.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {order.orderItems?.map((item, idx) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  return (
                    <tr key={idx} className="hover:bg-[#1E293B]">
                      <td className="p-3.5 font-medium text-white">{item.product?.name || 'Product'}</td>
                      <td className="p-3.5 text-[#94A3B8]">{item.product?.sku || 'N/A'}</td>
                      <td className="p-3.5 text-center text-[#CBD5E1]">{item.quantity}</td>
                      <td className="p-3.5 text-right text-[#CBD5E1]">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-3.5 text-right font-bold text-white">${lineTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end pt-4">
          <div className="w-full md:w-80 space-y-2 bg-[#0F172A] p-5 rounded-xl border border-[#334155]">
            <div className="flex justify-between text-sm text-[#CBD5E1]">
              <span>Subtotal</span>
              <span className="font-semibold text-white">${order.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#CBD5E1]">
              <span>Discount</span>
              <span className="font-semibold text-red-400">-${order.discount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#CBD5E1]">
              <span>Tax</span>
              <span className="font-semibold text-white">${order.tax?.toFixed(2)}</span>
            </div>
            <div className="border-t border-[#334155] pt-2 flex justify-between text-base font-extrabold text-white">
              <span>Grand Total</span>
              <span className="text-[#38BDF8]">${order.grandTotal?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetails;
