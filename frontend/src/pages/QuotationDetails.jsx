import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Calendar, User, DollarSign, CheckCircle2, AlertCircle, Loader2, Edit2, Send } from 'lucide-react';
import axios from 'axios';

const QuotationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/quotations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotation(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quotation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const convertToOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/quotations/${id}/convert`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Quotation converted to Sales Order successfully!');
      fetchQuotation();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to convert quotation');
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#38BDF8] animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading Quotation Details...</p>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0] flex items-center justify-center">
        <div className="bg-[#172554] p-6 rounded-xl border border-red-500/50 text-center max-w-md">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-400 mb-2">Error Loading Quotation</h3>
          <p className="text-sm text-[#CBD5E1] mb-4">{error || 'Quotation not found.'}</p>
          <button onClick={() => navigate('/quotations')} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-semibold">Back to Quotations</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2 bg-[#0F172A] hover:bg-[#334155] text-[#38BDF8] rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Commercial Management</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                quotation.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' :
                quotation.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {quotation.status || 'DRAFT'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#FFFFFF] mt-1 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#38BDF8]" /> {quotation.quotationNumber}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {quotation.status !== 'ACCEPTED' && (
            <button
              onClick={convertToOrder}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> Convert to Sales Order
            </button>
          )}
          <button
            onClick={() => navigate(`/quotations/edit/${quotation._id}`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold shadow transition-all"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4" /> Customer Information
          </h3>
          <div className="space-y-2">
            <p className="text-lg font-bold text-white">{quotation.customer?.name || 'N/A'}</p>
            <p className="text-sm text-[#CBD5E1]">Company: {quotation.customer?.company || 'N/A'}</p>
            <p className="text-sm text-[#CBD5E1]">Email: {quotation.customer?.email || 'N/A'}</p>
            <p className="text-sm text-[#CBD5E1]">Phone: {quotation.customer?.phone || 'N/A'}</p>
          </div>
        </div>

        {/* Dates & Validity */}
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Timeline & Validity
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#94A3B8]">Quotation Date</p>
              <p className="text-sm font-semibold text-white">{new Date(quotation.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Valid Until</p>
              <p className="text-sm font-semibold text-white">{new Date(quotation.validUntil).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Financial Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[#CBD5E1]">
              <span>Subtotal:</span>
              <span className="font-semibold text-white">${quotation.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between text-[#CBD5E1]">
              <span>Discount:</span>
              <span className="font-semibold text-white">-${quotation.discount?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between text-[#CBD5E1]">
              <span>Tax:</span>
              <span className="font-semibold text-white">+${quotation.tax?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="border-t border-[#334155] pt-2 flex justify-between text-base font-extrabold text-white">
              <span>Grand Total:</span>
              <span className="text-[#38BDF8]">${quotation.grandTotal?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-[#172554] rounded-2xl border border-[#334155] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#334155]">
          <h3 className="text-base font-bold text-white">Quotation Line Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0F172A] text-[#94A3B8] uppercase text-xs">
              <tr>
                <th className="p-4">Item #</th>
                <th className="p-4">Description / Product</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {quotation.products && quotation.products.map((item, index) => (
                <tr key={index} className="hover:bg-[#1E293B] transition-colors">
                  <td className="p-4 font-semibold text-[#38BDF8]">#{index + 1}</td>
                  <td className="p-4 text-white font-medium">{item.name || 'Product Item'}</td>
                  <td className="p-4 text-[#CBD5E1]">{item.quantity}</td>
                  <td className="p-4 text-[#CBD5E1]">${item.unitPrice?.toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-white">${(item.quantity * item.unitPrice)?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetails;
