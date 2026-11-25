import React, { useState, useEffect } from 'react';
import { CalendarClock, LogIn, LogOut, CheckCircle2, AlertCircle, Clock, ShieldCheck, RefreshCw } from 'lucide-react';

export const MyAttendance = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [todayRecord, setTodayRecord] = useState(null);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/attendance/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAttendanceList(data.data);
        // Find today's record
        const todayStr = new Date().toISOString().split('T')[0];
        const current = data.data.find(item => new Date(item.attendanceDate).toISOString().split('T')[0] === todayStr);
        setTodayRecord(current || null);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch attendance records' });
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      setMessage({ type: 'error', text: err.message || 'Network error during fetching attendance' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/attendance/check-in', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ remarks: 'Checked in via web portal' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Checked in successfully!' });
        fetchMyAttendance();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to check in' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error during check-in' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/attendance/check-out', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ remarks: 'Checked out via web portal' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Checked out successfully!' });
        fetchMyAttendance();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to check out' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error during check-out' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#172554] to-[#1E3A5F] rounded-2xl p-8 text-[#FFFFFF] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#334155]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#2563EB] text-[#FFFFFF] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
              <ShieldCheck size={12} /> Live Attendance Portal
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FFFFFF]">My Attendance</h1>
          <p className="text-[#CBD5E1] text-sm mt-1 max-w-xl">
            Mark your daily check-in and check-out timestamps, monitor working hours, and review your attendance log.
          </p>
        </div>
        <button 
          onClick={fetchMyAttendance} 
          className="flex items-center gap-2 bg-[#0F172A] hover:bg-[#2563EB]/20 text-[#38BDF8] border border-[#334155] px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
        >
          <RefreshCw size={16} /> Refresh Status
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success' ? 'bg-[#16A34A]/20 border-[#16A34A] text-[#16A34A]' : 'bg-[#DC2626]/20 border-[#DC2626] text-[#F87171]'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Today's Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#FFFFFF] mb-4 flex items-center gap-2">
              <Clock size={18} className="text-[#38BDF8]" /> Today's Action
            </h3>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between py-2 border-b border-[#334155]">
                <span className="text-[#94A3B8]">Status:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                  todayRecord?.status === 'Present' ? 'bg-[#16A34A]/20 text-[#16A34A]' :
                  todayRecord?.status === 'Late' ? 'bg-amber-500/20 text-amber-400' :
                  todayRecord?.status === 'Half-Day' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-[#334155] text-[#94A3B8]'
                }`}>
                  {todayRecord?.status || 'Not Checked In'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#334155]">
                <span className="text-[#94A3B8]">Check-In:</span>
                <span className="font-semibold text-[#FFFFFF]">
                  {todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#334155]">
                <span className="text-[#94A3B8]">Check-Out:</span>
                <span className="font-semibold text-[#FFFFFF]">
                  {todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#94A3B8]">Working Hours:</span>
                <span className="font-semibold text-[#38BDF8]">{todayRecord?.workingHours || 0} hrs</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCheckIn}
              disabled={actionLoading || (todayRecord && todayRecord.checkIn)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow ${
                todayRecord && todayRecord.checkIn
                  ? 'bg-[#334155] text-[#94A3B8] cursor-not-allowed'
                  : 'bg-[#16A34A] hover:bg-[#15803D] text-[#FFFFFF]'
              }`}
            >
              <LogIn size={18} /> {todayRecord && todayRecord.checkIn ? 'Already Checked In' : 'Check In Now'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={actionLoading || !todayRecord?.checkIn || todayRecord?.checkOut}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow ${
                !todayRecord?.checkIn || todayRecord?.checkOut
                  ? 'bg-[#334155] text-[#94A3B8] cursor-not-allowed'
                  : 'bg-[#DC2626] hover:bg-[#B91C1C] text-[#FFFFFF]'
              }`}
            >
              <LogOut size={18} /> {todayRecord?.checkOut ? 'Already Checked Out' : 'Check Out Now'}
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
          <h3 className="text-base font-bold text-[#FFFFFF] mb-4 flex items-center gap-2">
            <CalendarClock size={18} className="text-[#38BDF8]" /> Recent Attendance History
          </h3>

          {loading ? (
            <div className="text-center py-12 text-[#94A3B8]">Loading attendance records...</div>
          ) : attendanceList.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8] bg-[#0F172A] rounded-xl border border-[#334155]">
              No attendance records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#334155] text-xs font-semibold text-[#94A3B8] uppercase">
                    <th className="pb-3 px-4">Date</th>
                    <th className="pb-3 px-4">Check-In</th>
                    <th className="pb-3 px-4">Check-Out</th>
                    <th className="pb-3 px-4">Hours</th>
                    <th className="pb-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155] text-sm">
                  {attendanceList.map((item) => (
                    <tr key={item._id} className="hover:bg-[#0F172A]/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-[#FFFFFF]">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
