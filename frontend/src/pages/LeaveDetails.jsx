import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LeaveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const fetchLeave = async () => {
    try {
      const res = await axios.get(`/api/leaves/${id}`);
      setLeave(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeave();
  }, [id]);

  const handleAction = async (action) => {
    if (action === 'reject' && !remarks) {
      setError('Rejection remarks are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.patch(`/api/leaves/${id}/${action}`, { remarks });
      await fetchLeave();
      setRemarks('');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!leave) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6 bg-[#071B3A] min-h-screen text-white">
      <button onClick={() => navigate(-1)} className="mb-6 text-[#B8C7DC] hover:text-white">&larr; Back</button>
      <div className="bg-[#102B50] p-8 rounded-xl shadow-sm border border-[#29476B] max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Leave Details</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="space-y-4">
          <p><strong className="text-[#B8C7DC]">Employee:</strong> {leave.employee?.fullName}</p>
          <p><strong className="text-[#B8C7DC]">Type:</strong> {leave.leaveType}</p>
          <p><strong className="text-[#B8C7DC]">Dates:</strong> {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
          <p><strong className="text-[#B8C7DC]">Status:</strong> {leave.status}</p>
          <p><strong className="text-[#B8C7DC]">Reason:</strong> {leave.reason}</p>
          {leave.approvalRemarks && <p><strong className="text-[#B8C7DC]">Remarks:</strong> {leave.approvalRemarks}</p>}
          
          {leave.status === 'PENDING' && (
            <div className="mt-6 space-y-2">
              <textarea
                className="w-full p-2 bg-[#071B3A] border border-[#29476B] rounded"
                placeholder="Enter remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
              <div className="flex gap-4">
                <button disabled={loading} onClick={() => handleAction('approve')} className="bg-green-600 px-4 py-2 rounded">Approve</button>
                <button disabled={loading} onClick={() => handleAction('reject')} className="bg-red-600 px-4 py-2 rounded">Reject</button>
              </div>
            </div>
          )}

          <h3 className="font-bold mt-6 border-t border-[#29476B] pt-4">History</h3>
          {leave.history.map((h, i) => (
            <p key={i} className="text-sm text-[#B8C7DC]">{h.action} - {h.remarks} ({new Date(h.timestamp).toLocaleString()})</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveDetails;
