import React, { useState, useEffect } from 'react';
import { Package, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import axios from 'axios';

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    productId: '',
    movementType: 'STOCK_IN',
    quantity: '',
    referenceDocument: '',
    remarks: ''
  });

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const endpoint = formData.movementType === 'STOCK_IN' ? '/api/inventory/stock-in' : '/api/inventory/stock-out';
      
      const payload = {
        productId: formData.productId,
        quantity: Number(formData.quantity),
        referenceDocument: formData.referenceDocument,
        remarks: formData.remarks
      };

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Successfully processed ${formData.movementType.replace('_', ' ')} operation.`);
      setFormData({
        productId: '',
        movementType: 'STOCK_IN',
        quantity: '',
        referenceDocument: '',
        remarks: ''
      });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Stock operation failed');
    }
  };

  const selectedProduct = products.find(p => p._id === formData.productId);

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0] max-w-3xl mx-auto">
      <div>
        <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Inventory</p>
        <h1 className="text-2xl font-bold text-[#FFFFFF] mt-1">Stock Management (Stock In / Stock Out)</h1>
      </div>

      {error && <div className="bg-red-950 border border-red-800 text-red-300 p-4 rounded-lg">{error}</div>}
      {success && <div className="bg-green-950 border border-green-800 text-green-300 p-4 rounded-lg">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-[#172554] border border-[#334155] rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select Product *</label>
          <select
            required
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
          >
            <option value="">-- Choose Product --</option>
            {products.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} (SKU: {p.SKU}) - Current Stock: {p.currentStock}
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="bg-[#0F172A] p-4 rounded-lg border border-[#334155] flex justify-between items-center">
            <div>
              <p className="text-sm text-[#94A3B8]">Current Stock Level</p>
              <p className="text-xl font-bold text-white">{selectedProduct.currentStock}</p>
            </div>
            <div>
              <p className="text-sm text-[#94A3B8]">Minimum Level</p>
              <p className="text-xl font-bold text-[#38BDF8]">{selectedProduct.minimumStockLevel}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Movement Type *</label>
            <select
              value={formData.movementType}
              onChange={(e) => setFormData({ ...formData, movementType: e.target.value })}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
            >
              <option value="STOCK_IN">Stock In (Addition)</option>
              <option value="STOCK_OUT">Stock Out (Deduction)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quantity *</label>
            <input
              type="number"
              min="1"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
              placeholder="Enter positive quantity"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reference Document / PO Number</label>
          <input
            type="text"
            value={formData.referenceDocument}
            onChange={(e) => setFormData({ ...formData, referenceDocument: e.target.value })}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
            placeholder="e.g. PO-9982"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Remarks</label>
          <textarea
            rows="3"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
            placeholder="Add remarks for this stock adjustment..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {formData.movementType === 'STOCK_IN' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
          Process {formData.movementType.replace('_', ' ')}
        </button>
      </form>
    </div>
  );
};

export default StockManagement;
