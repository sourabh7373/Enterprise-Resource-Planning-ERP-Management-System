import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const InvoiceForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer: '',
    salesOrder: '',
    invoiceItems: [{ description: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    tax: 0,
    amountPaid: 0,
    dueDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [custRes, soRes] = await Promise.all([
          axios.get('/api/customers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/sales-orders', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCustomers(custRes.data || []);
        setSalesOrders(soRes.data || []);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.invoiceItems];
    newItems[index][field] = value;
    setFormData({ ...formData, invoiceItems: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      invoiceItems: [...formData.invoiceItems, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.invoiceItems.length === 1) return;
    const newItems = formData.invoiceItems.filter((_, i) => i !== index);
    setFormData({ ...formData, invoiceItems: newItems });
  };

  const subtotal = formData.invoiceItems.reduce((acc, item) => acc + (Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.unitPrice) || 0)), 0);
  const discount = Math.min(subtotal, Math.max(0, Number(formData.discount) || 0));
  const tax = Math.max(0, Number(formData.tax) || 0);
  const grandTotal = Math.max(0, subtotal - discount + tax);
  const balanceDue = Math.max(0, grandTotal - Math.max(0, Number(formData.amountPaid) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer || !formData.salesOrder) {
      alert('Please select a customer and a sales order.');
      return;
    }
    if (formData.invoiceItems.some(item => item.quantity <= 0 || item.unitPrice < 0)) {
      alert('Invalid item quantity or price.');
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/invoices', {
        ...formData,
        subtotal,
        grandTotal,
        balanceDue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/invoices');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-[#38BDF8] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
        <h1 className="text-2xl font-bold">Create Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#172554] p-8 rounded-xl space-y-6">
        <div>
          <label className="block text-xs font-bold text-[#38BDF8] uppercase mb-2">Customer</label>
          <select
            value={formData.customer}
            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            required
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white"
          >
            <option value="">Select Customer</option>
            {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#38BDF8] uppercase mb-2">Sales Order</label>
          <select
            value={formData.salesOrder}
            onChange={(e) => setFormData({ ...formData, salesOrder: e.target.value })}
            required
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white"
          >
            <option value="">Select Sales Order</option>
            {salesOrders.map(so => <option key={so._id} value={so._id}>{so.orderNumber}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#38BDF8] uppercase mb-2">Due Date</label>
          <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} required className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white" />
        </div>

        <div>
          <div className="flex justify-between mb-3">
            <h3 className="font-bold">Items</h3>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs bg-[#2563EB] px-3 py-1 rounded">
              <Plus className="w-3 h-3" /> Add Item
            </button>
          </div>
          {formData.invoiceItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 mb-3 bg-[#0F172A] p-3 rounded-xl">
              <input className="col-span-6 bg-[#172554] p-2 rounded" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
              <input type="number" className="col-span-2 bg-[#172554] p-2 rounded" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} />
              <input type="number" className="col-span-2 bg-[#172554] p-2 rounded" placeholder="Price" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))} />
              <button type="button" onClick={() => removeItem(index)} className="col-span-2 text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <input type="number" placeholder="Discount" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} className="bg-[#0F172A] p-3 rounded-xl" />
          <input type="number" placeholder="Tax" value={formData.tax} onChange={(e) => setFormData({...formData, tax: e.target.value})} className="bg-[#0F172A] p-3 rounded-xl" />
          <input type="number" placeholder="Amount Paid" value={formData.amountPaid || ''} onChange={(e) => setFormData({...formData, amountPaid: e.target.value})} className="bg-[#0F172A] p-3 rounded-xl" />
        </div>

        <div className="text-xl font-bold">
          <div>Grand Total: ${grandTotal.toFixed(2)}</div>
          <div>Balance Due: ${balanceDue.toFixed(2)}</div>
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-[#2563EB] py-3 rounded-xl font-bold">
          {submitting ? 'Saving...' : 'Create Invoice'}
        </button>
      </form>
    </div>
  );
};

export { InvoiceForm };
