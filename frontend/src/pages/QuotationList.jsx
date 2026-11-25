import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Eye, Edit2, Trash2, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

const QuotationList = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/quotations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotations(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quotations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/quotations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotations(quotations.filter(q => q._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete quotation');
    }
  };

  const convertToOrder = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/quotations/${id}/convert`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Quotation converted to Sales Order successfully!');
      fetchQuotations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to convert quotation');
    }
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = 
      q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#94A3B8]">Loading Quotations...</p>
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
          <button onClick={fetchQuotations} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-semibold">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <div>
          <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Commercial Management</p>
          <h1 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">Quotations</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Manage sales quotes, pricing proposals, and convert them to orders.</p>
        </div>
        <button
          onClick={() => navigate('/quotations/create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Create Quotation
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#172554] p-4 rounded-2xl border border-[#334155]">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search quotation # or customer..."
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
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Quotation Table */}
      <div className="bg-[#172554] rounded-2xl border border-[#334155] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0F172A] text-[#94A3B8] uppercase text-xs">
              <tr>
                <th className="p-4">Quotation Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Quotation Date</th>
                <th className="p-4">Valid Until</th>
                <th className="p-4">Subtotal</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Tax</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {filteredQuotations.length > 0 ? (
                filteredQuotations.map((q) => (
                  <tr key={q._id} className="hover:bg-[#1E293B] transition-colors">
                    <td className="p-4 font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#38BDF8]" />
                      {q.quotationNumber}
                    </td>
                    <td className="p-4 text-[#CBD5E1]">{q.customer?.name || 'N/A'}</td>
                    <td className="p-4 text-[#CBD5E1]">{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4 text-[#CBD5E1]">{q.validUntil ? new Date(q.validUntil).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4 text-[#CBD5E1]">${q.subtotal?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 text-[#CBD5E1]">${q.discount?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 text-[#CBD5E1]">${q.tax?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 font-bold text-white">${q.grandTotal?.toFixed(2) || '0.00'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        q.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' :
                        q.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {q.status || 'DRAFT'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {q.status !== 'ACCEPTED' && (
                          <button
                            onClick={() => convertToOrder(q._id)}
                            title="Convert to Sales Order"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/quotations/${q._id}`)}
                          title="View Quotation"
                          className="p-1.5 bg-[#0F172A] hover:bg-[#334155] text-[#38BDF8] rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/quotations/edit/${q._id}`)}
                          title="Edit Quotation"
                          className="p-1.5 bg-[#0F172A] hover:bg-[#334155] text-amber-400 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          title="Delete Quotation"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-[#94A3B8]">
                    No quotations found.
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

export default QuotationList;
