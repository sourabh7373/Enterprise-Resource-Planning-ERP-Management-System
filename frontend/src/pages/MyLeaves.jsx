import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await axios.get('/api/leaves/my');
        setLeaves(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  const cancelLeave = async (id) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        await axios.patch(`/api/leaves/${id}/cancel`);
        setLeaves(leaves.map(l => l._id === id ? {...l, status: 'CANCELLED'} : l));
      } catch (err) {
        alert(err.response?.data?.message || 'Cancellation failed');
      }
    }
  };

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'PENDING').length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-orange-900/30 text-orange-400 border-orange-900',
      APPROVED: 'bg-green-900/30 text-green-400 border-green-900',
      REJECTED: 'bg-red-900/30 text-red-400 border-red-900',
      CANCELLED: 'bg-gray-800 text-gray-400 border-gray-700'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>{status}</span>;
  };

  return (
    <div className="p-6 bg-[#071B3A] min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">My Leave History</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { title: 'Total', value: stats.total, icon: ClipboardList, color: 'text-blue-400' },
          { title: 'Pending', value: stats.pending, icon: Clock, color: 'text-orange-400' },
          { title: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-400' },
          { title: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="bg-[#102B50] p-4 rounded-lg border border-[#29476B] flex items-center justify-between">
            <div>
              <p className="text-sm text-[#B8C7DC]">{s.title}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
            <s.icon className={`w-8 h-8 ${s.color}`} />
          </div>
        ))}
      </div>

      <div className="bg-[#102B50] rounded-lg border border-[#29476B] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#183A65] border-b border-[#29476B]">
            <tr>
              <th className="p-4 text-[#B8C7DC]">Type</th>
              <th className="p-4 text-[#B8C7DC]">Dates</th>
              <th className="p-4 text-[#B8C7DC]">Status</th>
              <th className="p-4 text-[#B8C7DC]">Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map(l => (
              <tr key={l._id} className="border-b border-[#29476B] hover:bg-[#183A65]">
                <td className="p-4 font-medium">{l.leaveType}</td>
                <td className="p-4 text-sm text-[#B8C7DC]">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                <td className="p-4">{getStatusBadge(l.status)}</td>
                <td className="p-4">
                  {l.status === 'PENDING' && (
                    <button onClick={() => cancelLeave(l._id)} className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm font-medium">
                      <Trash2 size={16} /> Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyLeaves;
