import React, { useState, useEffect } from 'react';
import { CalendarClock, Filter, Download, Search, ShieldCheck } from 'lucide-react';

export const AttendanceHistory = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/attendance';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (statusFilter) params.append('status', statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAttendanceList(data.data);
      }
    } catch (err) {
      console.error('Failed to load attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, [startDate, endDate, statusFilter]);

  const handleExportCSV = () => {
    if (attendanceList.length === 0) return;
    const headers = ['Employee ID', 'Employee Name', 'Date', 'Check-In', 'Check-Out', 'Working Hours', 'Status'];
    const rows = attendanceList.map(item => [
      item.employee?.employeeId || '',
      item.employee?.fullName || '',
      new Date(item.attendanceDate).toLocaleDateString(),
      item.checkIn ? new Date(item.checkIn).toLocaleTimeString() : '',
      item.checkOut ? new Date(item.checkOut).toLocaleTimeString() : '',
      item.workingHours || 0,
      item.status || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="bg-gradient-to-r from-[#172554] to-[#1E3A5F] rounded-2xl p-8 text-[#FFFFFF] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#334155]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#2563EB] text-[#FFFFFF] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
              <ShieldCheck size={12} /> Enterprise Workforce Logs
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FFFFFF]">Attendance History</h1>
          <p className="text-[#CBD5E1] text-sm mt-1 max-w-xl">
            Comprehensive workforce attendance logs with advanced date filters, status filters, and CSV export capabilities.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-[#FFFFFF] px-5 py-3 rounded-xl font-bold text-sm transition-all shadow"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#94A3B8]">From:</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#94A3B8]">To:</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#94A3B8]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Half-Day">Half-Day</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
        <div className="text-xs text-[#94A3B8] font-semibold">
          Total Records: <span className="text-[#38BDF8]">{attendanceList.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-[#94A3B8]">Loading attendance records...</div>
        ) : attendanceList.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8] bg-[#0F172A] rounded-xl border border-[#334155]">
            No attendance records found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#334155] text-xs font-semibold text-[#94A3B8] uppercase">
                  <th className="pb-3 px-4">Employee</th>
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
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#FFFFFF]">{item.employee?.fullName || 'Unknown'}</p>
                      <p className="text-xs text-[#94A3B8]">{item.employee?.employeeId || '—'}</p>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
