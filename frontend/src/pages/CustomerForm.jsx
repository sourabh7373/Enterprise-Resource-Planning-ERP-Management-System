import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';

const CustomerForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    status: 'ACTIVE'
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email and Phone validation helper
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[\d\s\-+()]{7,20}$/.test(phone);
  };

  useEffect(() => {
    if (isEdit) {
      const fetchCustomer = async () => {
        setFetching(true);
        setError('');
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`/api/customers/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data) {
            setFormData({
              name: res.data.name || '',
              email: res.data.email || '',
              phone: res.data.phone || '',
              company: res.data.company || '',
              address: res.data.address || '',
              status: res.data.status || 'ACTIVE'
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch customer details for editing.');
        } finally {
          setFetching(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!formData.name.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim() || !validatePhone(formData.phone)) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isEdit) {
        await axios.put(`/api/customers/${id}`, formData, { headers });
        setSuccess('Customer updated successfully!');
      } else {
        await axios.post('/api/customers', formData, { headers });
        setSuccess('Customer created successfully!');
      }

      setTimeout(() => {
        navigate('/customers');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || (isEdit ? 'Failed to update customer' : 'Failed to create customer'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen flex flex-col items-center justify-center text-[#E2E8F0]">
        <Loader2 size={36} className="animate-spin text-[#38BDF8] mb-4" />
        <p className="text-sm font-medium text-[#94A3B8]">Loading customer data...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(isEdit ? `/customers/${id}` : '/customers')}
          className="p-2.5 bg-[#172554] border border-[#334155] rounded-xl text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Commercial Management</p>
          <h1 className="text-2xl font-bold text-white mt-1">{isEdit ? 'Edit Customer' : 'Add New Customer'}</h1>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/65 text-emerald-300 rounded-xl flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/65 text-rose-300 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-rose-400 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#172554] p-8 rounded-2xl border border-[#334155] shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Customer Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              placeholder="e.g. Acme Corp"
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              placeholder="client@acme.com"
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Phone Number *</label>
            <input
              type="text"
              required
              value={formData.phone}
              placeholder="+1 (555) 019-2834"
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Company</label>
            <input
              type="text"
              value={formData.company}
              placeholder="Acme Industries"
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              onChange={e => setFormData({...formData, company: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Address</label>
          <textarea
            rows={3}
            value={formData.address}
            placeholder="Street address, city, country..."
            className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            onChange={e => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Status</label>
          <select
            value={formData.status}
            className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            onChange={e => setFormData({...formData, status: e.target.value})}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/customers/${id}` : '/customers')}
            className="px-6 py-2.5 border border-[#334155] bg-[#0F172A] text-[#CBD5E1] rounded-xl text-sm font-medium hover:bg-[#1E3A5F] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-semibold shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Customer' : 'Save Customer')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
