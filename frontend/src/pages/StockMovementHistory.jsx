import React, { useState, useEffect } from 'react';
import { History, Search } from 'lucide-react';
import axios from 'axios';

const StockMovementHistory = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [movementType, setMovementType] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (selectedProduct) params.productId = selectedProduct;
      if (movementType !== 'ALL') params.movementType = movementType;

      const [movRes, prodRes] = await Promise.all([
        axios.get('/api/inventory/movements', { headers: { Authorization: `Bearer ${token}` }, params }),
        axios.get('/api/products', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMovements(movRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      setError('Failed to fetch stock movements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedProduct, movementType]);

  const getBadgeColor = (type) => {
    switch (type) {
      case 'STOCK_IN': return 'bg-green-900 text-green-300';
      case 'STOCK_OUT': return 'bg-red-900 text-red-300';
      case 'ORDER_DEDUCTION': return 'bg-orange-900 text-orange-300';
      case 'ORDER_RESTORE': return 'bg-blue-900 text-blue-300';
      default: return 'bg-gray-800 text-gray-300';
    }
  };

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Inventory</p>
          <h1 className="text-2xl font-bold text-[#FFFFFF] mt-1">Stock Movement History</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8] flex-1"
        >
          <option value="">All Products</option>
          {products.map(p => (
            <option key={p._id} value={p._id}>{p.name} ({p.SKU})</option>
          ))}
        </select>

        <select
          value={movementType}
          onChange={(e) => setMovementType(e.target.value)}
          className="bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
        >
          <option value="ALL">All Movement Types</option>
          <option value="STOCK_IN">Stock In</option>
          <option value="STOCK_OUT">Stock Out</option>
          <option value="ORDER_DEDUCTION">Order Deduction</option>
          <option value="ORDER_RESTORE">Order Restore</option>
          <option value="ADJUSTMENT">Adjustment</option>
        </select>
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
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Prev Stock</th>
                <th className="px-6 py-4">New Stock</th>
                <th className="px-6 py-4">Ref Doc</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {movements.map(m => (
                <tr key={m._id} className="hover:bg-[#1E293B]">
                  <td className="px-6 py-4 text-xs text-[#94A3B8]">
                    {new Date(m.createdAt || m.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium">{m.product?.name || 'Unknown Product'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getBadgeColor(m.movementType)}`}>
                      {m.movementType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{m.quantity}</td>
                  <td className="px-6 py-4">{m.previousStock}</td>
                  <td className="px-6 py-4 text-[#38BDF8] font-bold">{m.newStock}</td>
                  <td className="px-6 py-4 text-xs font-mono">{m.referenceDocument || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs">{m.createdBy?.name || 'System'}</td>
                  <td className="px-6 py-4 text-xs text-[#94A3B8]">{m.remarks || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {movements.length === 0 && <div className="p-6 text-center text-[#94A3B8]">No stock movements found.</div>}
        </div>
      )}
    </div>
  );
};

export default StockMovementHistory;
