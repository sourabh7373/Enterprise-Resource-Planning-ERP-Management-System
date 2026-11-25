import React, { useState, useEffect } from 'react';
import { CalendarClock, ShieldCheck, Edit3, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const AttendanceManagement = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    checkIn: '',
    checkOut: '',
    status: 'Present',
    remarks: '',
    reason: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAttendanceList(data.data);
      }
    } catch (err) {
      console.error('Failed to load attendance management:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const openCorrectionModal = (record) => {
    setSelectedRecord(record);
    setCorrectionForm({
      checkIn: record.checkIn ? new Date(record.checkIn).toISOString().slice(0, 16) : '',
      checkOut: record.checkOut ? new Date(record.checkOut).toISOString().slice(0, 16) : '',
      status: record.status || 'Present',
      remarks: record.remarks || '',
      reason: ''
    });
    setIsModalOpen(true);
    setMessage({ type: '', text: '' });
  };

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/attendance/${selectedRecord._id}/correction`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          checkIn: correctionForm.checkIn ? new Date(correctionForm.checkIn) : null,
          checkOut: correctionForm.checkOut ? new Date(correctionForm.checkOut) : null,
          status: correctionForm.status,
          remarks: correctionForm.remarks,
          reason: correctionForm.reason
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Attendance corrected successfully!' });
        setTimeout(() => {
          setIsModalOpen(false);
          fetchAttendance();
        }, 1200);
      } else {
        setMessage({ type: 'error', text: data.message || 'Correction failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error during correction' });
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="bg-gradient-to-r from-[#172554] to-[#1E3A5F] rounded-2xl p-8 text-[#FFFFFF] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#334155]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#2563EB] text-[#FFFFFF] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
              <ShieldCheck size={12} /> HR & Admin Correction Portal
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FFFFFF]">Attendance Management</h1>
          <p className="text-[#CBD5E1] text-sm mt-1 max-w-xl">
            Oversee company-wide attendance records, review audit trails, and execute administrative attendance corrections.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <h3 className="text-base font-bold text-[#FFFFFF] mb-4 flex items-center gap-2">
          <CalendarClock size={18} className="text-[#38BDF8]" /> All Employee Attendance Records
        </h3>

        {loading ? (
          <div className="text-center py-16 text-[#94A3B8]">Loading attendance records...</div>
        ) : attendanceList.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8] bg-[#0F172A] rounded-xl border border-[#334155]">
            No attendance records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#334155] text-xs font-semibold text-[#94A3B8] uppercase">
                  <th className="pb-3 px-4">Employee</th>
                  <th className="pb-3 px-4">Department</th>
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Check-In</th>
                  <th className="pb-3 px-4">Check-Out</th>
                  <th className="pb-3 px-4">Hours</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155] text-sm">
                {attendanceList.map((item) => (
                  <tr key={item._id} className="hover:bg-[#0F172A]/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#FFFFFF]">{item.employee?.fullName || 'Unknown'}</p>
                      <p className="text-xs text-[#94A3B8]">{item.employee?.employeeId || '—'}</p>
                    </td>
                    <td className="py-3 px-4 text-[#CBD5E1]">
                      {item.employee?.department?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-[#CBD5E1]">
                      {new Date(item.attendanceDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-[#CBD5E1]">
                      {item.checkIn ? new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-[#CBD5E1]">
                      {item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#38BDF8]">
                      {item.workingHours || 0} hrs
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Present' ? 'bg-[#16A34A]/20 text-[#16A34A]' :
                        item.status === 'Late' ? 'bg-amber-500/20 text-amber-400' :
                        item.status === 'Half-Day' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-[#334155] text-[#94A3B8]'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openCorrectionModal(item)}
                        className="inline-flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow"
                      >
                        <Edit3 size={14} /> Correct
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Correction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#172554] border border-[#334155] rounded-2xl w-full max-w-lg p-6 shadow-2xl text-[#E2E8F0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#334155] mb-6">
              <h3 className="text-lg font-bold text-[#FFFFFF] flex items-center gap-2">
                <Edit3 size={20} className="text-[#38BDF8]" /> Attendance Correction
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#FFFFFF] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {message.text && (
              <div className={`p-3 rounded-xl border mb-4 flex items-center gap-2 ${message.type === 'success' ? 'bg-[#16A34A]/20 border-[#16A34A] text-[#16A34A]' : 'bg-[#DC2626]/20 border-[#DC2626] text-[#F87171]'}`}>
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span className="text-xs font-semibold">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleCorrectionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Employee</label>
                <input 
                  type="text" 
                  disabled 
                  value={selectedRecord?.employee?.fullName || ''} 
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-[#94A3B8] cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Check-In Time</label>
                  <input 
                    type="datetime-local" 
                    value={correctionForm.checkIn} 
                    onChange={(e) => setCorrectionForm({...correctionForm, checkIn: e.target.value})}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Check-Out Time</label>
                  <input 
                    type="datetime-local" 
                    value={correctionForm.checkOut} 
                    onChange={(e) => setCorrectionForm({...correctionForm, checkOut: e.target.value})}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Status</label>
                <select
                  value={correctionForm.status}
                  onChange={(e) => setCorrectionForm({...correctionForm, status: e.target.value})}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-Day">Half-Day</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Remarks</label>
                <input 
                  type="text" 
                  value={correctionForm.remarks} 
                  onChange={(e) => setCorrectionForm({...correctionForm, remarks: e.target.value})}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Correction Reason / Audit Note *</label>
                <textarea 
                  required
                  rows="3"
                  value={correctionForm.reason} 
                  onChange={(e) => setCorrectionForm({...correctionForm, reason: e.target.value})}
                  placeholder="Provide reason for administrative correction..."
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#2563EB]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#0F172A] text-[#94A3B8] hover:text-[#FFFFFF] text-sm font-semibold border border-[#334155] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] text-sm font-bold shadow transition-all"
                >
                  Save Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
