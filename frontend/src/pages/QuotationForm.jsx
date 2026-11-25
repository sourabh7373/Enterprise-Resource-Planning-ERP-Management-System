import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';

const QuotationForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    customer: '',
    validUntil: '',
    discount: 0,
    tax: 0,
    status: 'DRAFT',
    products: [
      { product: '', name: '', quantity: 1, unitPrice: 0 }
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const custRes = await axios.get('/api/customers', { headers });
        setCustomers(custRes.data || []);

        if (isEdit) {
          const quotRes = await axios.get(`/api/quotations/${id}`, { headers });
          if (quotRes.data) {
            const q = quotRes.data;
            setFormData({
              customer: q.customer?._id || q.customer || '',
              validUntil: q.validUntil ? q.validUntil.split('T')[0] : '',
              discount: q.discount || 0,
              tax: q.tax || 0,
              status: q.status || 'DRAFT',
              products: q.products && q.products.length > 0 ? q.products.map(p => ({
                product: p.product?._id || p.product || '651111111111111111111111',
                name: p.name || 'Product item',
                quantity: p.quantity || 1,
                unitPrice: p.unitPrice || 0
              })) : [{ product: '651111111111111111111111', name: '', quantity: 1, unitPrice: 0 }]
            });
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quotation data.');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    setFormData({ ...formData, products: newProducts });
  };

  const addProductRow = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { product: '651111111111111111111111', name: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeProductRow = (index) => {
    if (formData.products.length === 1) return;
    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: newProducts });
  };

  const calculateSubtotal = () => {
    return formData.products.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  };

  const calculateGrandTotal = () => {
    const sub = calculateSubtotal();
    const disc = Number(formData.discount) || 0;
    const tx = Number(formData.tax) || 0;
    return Math.max(0, sub - disc + tx);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.customer) {
      setError('Please select a customer.');
      return;
    }
    if (!formData.validUntil) {
      setError('Please specify a validity date.');
      return;
    }
    for (let i = 0; i < formData.products.length; i++) {
      const item = formData.products[i];
      if (Number(item.quantity) < 1) {
        setError(`Item #${i + 1} quantity must be at least 1.`);
        return;
      }
      if (Number(item.unitPrice) < 0) {
        setError(`Item #${i + 1} unit price cannot be negative.`);
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        customer: formData.customer,
        validUntil: formData.validUntil,
        discount: Number(formData.discount) || 0,
        tax: Number(formData.tax) || 0,
        status: formData.status,
        products: formData.products.map(p => ({
          product: p.product || '651111111111111111111111',
          quantity: Number(p.quantity),
          unitPrice: Number(p.unitPrice)
        }))
      };

      if (isEdit) {
        await axios.put(`/api/quotations/${id}`, payload, { headers });
        setSuccess('Quotation updated successfully!');
      } else {
        await axios.post('/api/quotations', payload, { headers });
        setSuccess('Quotation created successfully!');
      }

      setTimeout(() => {
        navigate('/quotations');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || (isEdit ? 'Failed to update quotation' : 'Failed to create quotation'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#38BDF8] animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading Quotation Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2 bg-[#0F172A] hover:bg-[#334155] text-[#38BDF8] rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Commercial Management</p>
            <h1 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">{isEdit ? 'Edit Quotation' : 'Create Quotation'}</h1>
            <p className="text-sm text-[#94A3B8] mt-1">Configure pricing items, discounts, and validity for this quote.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#334155] pb-4">
            <FileText className="w-5 h-5 text-[#38BDF8]" /> Quotation Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Customer *</label>
              <select
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Valid Until *</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
              >
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products / Items */}
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#334155] pb-4">
            <h3 className="text-base font-bold text-white">Line Items</h3>
            <button
              type="button"
              onClick={addProductRow}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.products.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#0F172A] p-4 rounded-xl border border-[#334155]">
                <div className="md:col-span-6">
                  <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Item Description / Product</label>
                  <input
                    type="text"
                    placeholder="e.g. Enterprise Software License / Consulting Services"
                    value={item.name}
                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                    className="w-full bg-[#172554] border border-[#334155] rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#38BDF8]"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                    className="w-full bg-[#172554] border border-[#334155] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)}
                    className="w-full bg-[#172554] border border-[#334155] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                    required
                  />
                </div>
                <div className="md:col-span-1 flex justify-end pt-5">
                  <button
                    type="button"
                    onClick={() => removeProductRow(index)}
                    disabled={formData.products.length === 1}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Calculation */}
          <div className="bg-[#0F172A] p-6 rounded-xl border border-[#334155] flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Discount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-32 bg-[#172554] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Tax ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  className="w-32 bg-[#172554] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>

            <div className="text-right space-y-1 w-full md:w-auto">
              <p className="text-sm text-[#94A3B8]">Subtotal: <span className="text-white font-medium">${calculateSubtotal().toFixed(2)}</span></p>
              <p className="text-xl font-extrabold text-white">Grand Total: <span className="text-[#38BDF8]">${calculateGrandTotal().toFixed(2)}</span></p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/quotations')}
            className="px-6 py-3 bg-[#172554] hover:bg-[#1E293B] text-[#E2E8F0] rounded-xl text-sm font-semibold border border-[#334155] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold shadow transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Update Quotation' : 'Save Quotation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;
