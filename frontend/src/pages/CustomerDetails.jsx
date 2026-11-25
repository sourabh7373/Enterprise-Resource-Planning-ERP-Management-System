import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Edit2, Mail, Phone, Building, MapPin, Calendar, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomer(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Customer does not exist or failed to load customer details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen flex flex-col items-center justify-center text-[#E2E8F0]">
        <Loader2 size={36} className="animate-spin text-[#38BDF8] mb-4" />
        <p className="text-sm font-medium text-[#94A3B8]">Loading customer details...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
        <div className="max-w-2xl mx-auto bg-[#172554] p-8 rounded-2xl border border-[#334155] text-center space-y-4">
          <div className="w-12 h-12 bg-red-950/60 border border-red-800/65 rounded-xl flex items-center justify-center mx-auto text-red-400">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Customer Not Found</h2>
          <p className="text-sm text-red-300">{error || 'The requested customer does not exist.'}</p>
          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => navigate('/customers')}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Back to Customers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0] max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/customers')}
            className="p-2.5 bg-[#172554] border border-[#334155] rounded-xl text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Customer Profile</p>
            <h1 className="text-2xl font-bold text-white mt-1">{customer.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/customers/${customer._id}/edit`)}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow"
          >
            <Edit2 size={16} /> Edit Customer
          </button>
          <button
            onClick={() => navigate('/customers')}
            className="flex items-center gap-2 bg-[#172554] border border-[#334155] hover:bg-[#1E293B] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Back to Customers
          </button>
        </div>
      </div>

      <div className="bg-[#172554] rounded-2xl border border-[#334155] p-8 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#334155] gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8] text-2xl font-bold">
              {customer.name ? customer.name.charAt(0).toUpperCase() : <Users size={28} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{customer.name}</h2>
              <p className="text-sm text-[#94A3B8]">{customer.company || 'Independent Client'}</p>
            </div>
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${customer.status === 'ACTIVE' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-red-950/60 border border-red-800 text-red-300'}`}>
              {customer.status || 'ACTIVE'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#334155] space-y-1">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={15} className="text-[#38BDF8]" /> Email Address
            </span>
            <p className="text-sm font-medium text-white pt-1">{customer.email || 'N/A'}</p>
          </div>

          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#334155] space-y-1">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={15} className="text-[#38BDF8]" /> Phone Number
            </span>
            <p className="text-sm font-medium text-white pt-1">{customer.phone || 'N/A'}</p>
          </div>

          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#334155] space-y-1">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <Building size={15} className="text-[#38BDF8]" /> Company
            </span>
            <p className="text-sm font-medium text-white pt-1">{customer.company || 'N/A'}</p>
          </div>

          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#334155] space-y-1">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={15} className="text-[#38BDF8]" /> Address
            </span>
            <p className="text-sm font-medium text-white pt-1">{customer.address || 'N/A'}</p>
          </div>

          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#334155] space-y-1">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck size={15} className="text-[#38BDF8]" /> Created By
            </span>
            <p className="text-sm font-medium text-white pt-1">
              {typeof customer.createdBy === 'object' ? customer.createdBy?.name || customer.createdBy?.email : (customer.createdBy || 'System Admin')}
            </p>
          </div>

          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#334155] space-y-1">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={15} className="text-[#38BDF8]" /> Created Date
            </span>
            <p className="text-sm font-medium text-white pt-1">
              {customer.createdAt ? new Date(customer.createdAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
