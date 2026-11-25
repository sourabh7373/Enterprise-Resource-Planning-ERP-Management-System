import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';

const SalesOrderForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    orderItems: [{ product: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    tax: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const [custRes, prodRes] = await Promise.all([
          axios.get('/api/customers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/quotations', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ]);
        setCustomers(custRes.data || []);
        
        // Fetch products if available or extract from quotations / inventory endpoint
        try {
          const invRes = await axios.get('/api/inventory', { headers: { Authorization: `Bearer ${token}` } });
          setProducts(invRes.data || []);
        } catch {
          // fallback mock products or extract from quotations
          setProducts([
            { _id: 'prod1', name: 'Enterprise Server X1', price: 1200 },
            { _id: 'prod2', name: 'Cloud Router Pro', price: 450 },
            { _id: 'prod3', name: 'Workstation Ultra', price: 890 }
          ]);
        }
      } catch (err) {
        setError('Failed to load required form data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.orderItems];
    newItems[index][field] = value;
    if (field === 'product') {
      const selectedProd = products.find(p => p._id === value);
      if (selectedProd) {
        newItems[index].unitPrice = selectedProd.price || selectedProd.unitPrice || 0;
      }
    }
    setFormData({ ...formData, orderItems: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      orderItems: [...formData.orderItems, { product: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.orderItems.length === 1) return;
    const newItems = formData.orderItems.filter((_, i) => i !== index);
    setFormData({ ...formData, orderItems: newItems });
  };

  // Calculations
  const subtotal = formData.orderItems.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const discountVal = Number(formData.discount) || 0;
  const taxVal = Number(formData.tax) || 0;
  const grandTotal = Math.max(0, subtotal - discountVal + taxVal);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer) {
      alert('Please select a customer.');
      return;
    }
    for (const item of formData.orderItems) {
      if (!item.product || item.quantity < 1) {
        alert('Please select a product and valid quantity for all items.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/sales-orders', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/sales-orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create sales order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/sales-orders')} className="flex items-center gap-2 text-sm text-[#38BDF8] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Sales Orders
        </button>
        <h1 className="text-2xl font-extrabold text-white">Create Sales Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#172554] p-8 rounded-2xl border border-[#334155] shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-2">Customer</label>
          <select
            value={formData.customer}
            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            required
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
          >
            <option value="">Select Customer</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.name} ({c.email || 'No email'})</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Order Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {formData.orderItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-[#0F172A] p-4 rounded-xl border border-[#334155]">
                <div className="md:col-span-5">
                  <label className="block text-[10px] text-[#94A3B8] uppercase mb-1">Product</label>
                  <select
                    value={item.product}
                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                    required
                    className="w-full bg-[#172554] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                  >
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} - ${p.price || p.unitPrice || 0}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-[#94A3B8] uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                    required
                    className="w-full bg-[#172554] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-[#94A3B8] uppercase mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                    required
                    className="w-full bg-[#172554] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div className="md:col-span-2 text-right">
                  <label className="block text-[10px] text-[#94A3B8] uppercase mb-1">Line Total</label>
                  <p className="text-sm font-bold text-white py-2">${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</p>
                </div>
                <div className="md:col-span-1 text-center">
                  {formData.orderItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all mt-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Inputs & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#334155]">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-2">Discount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-2">Tax ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
          </div>

          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#334155] space-y-3 flex flex-col justify-center">
            <div className="flex justify-between text-sm text-[#CBD5E1]">
              <span>Subtotal</span>
              <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#CBD5E1]">
              <span>Discount</span>
              <span className="font-semibold text-red-400">-${discountVal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#CBD5E1]">
              <span>Tax</span>
              <span className="font-semibold text-white">${taxVal.toFixed(2)}</span>
            </div>
            <div className="border-t border-[#334155] pt-2 flex justify-between text-base font-extrabold text-white">
              <span>Grand Total</span>
              <span className="text-[#38BDF8]">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/sales-orders')}
            className="px-6 py-2.5 bg-[#0F172A] hover:bg-[#334155] text-white rounded-xl text-sm font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold shadow transition-all disabled:opacity-50"
          >
            {submitting ? 'Saving Order...' : 'Save Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesOrderForm;
