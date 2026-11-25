import React, { useState } from 'react';
import axios from 'axios';

const ApplyLeave = () => {
  const [formData, setFormData] = useState({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/leaves', formData);
      setMessage({ type: 'success', text: 'Leave application submitted successfully.' });
      setFormData({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error submitting leave request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-[#071B3A] min-h-screen">
      <div className="bg-[#102B50] p-8 rounded-xl shadow-sm border border-[#29476B]">
        <h2 className="text-2xl font-bold mb-6 text-white">Apply for Leave</h2>
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-900' : 'bg-red-900/30 text-red-400 border border-red-900'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#B8C7DC] mb-1">Leave Type</label>
            <select className="w-full bg-[#071B3A] border border-[#29476B] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, leaveType: e.target.value})} value={formData.leaveType}>
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Earned">Earned</option>
              <option value="Maternity">Maternity</option>
              <option value="Paternity">Paternity</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#B8C7DC] mb-1">Start Date</label>
              <input type="date" className="w-full bg-[#071B3A] border border-[#29476B] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, startDate: e.target.value})} value={formData.startDate} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#B8C7DC] mb-1">End Date</label>
              <input type="date" className="w-full bg-[#071B3A] border border-[#29476B] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, endDate: e.target.value})} value={formData.endDate} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#B8C7DC] mb-1">Reason</label>
            <textarea className="w-full bg-[#071B3A] border border-[#29476B] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none h-32" placeholder="Please provide a reason for your leave..." onChange={(e) => setFormData({...formData, reason: e.target.value})} value={formData.reason} required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" onClick={() => setFormData({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' })} className="px-6 py-2.5 border border-[#29476B] rounded-lg text-[#B8C7DC] hover:bg-[#183A65] font-semibold">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
