import React, { useState, useEffect } from 'react';
import { CalendarClock, ShieldCheck, BarChart3, Users, Clock, Award, AlertTriangle, Download } from 'lucide-react';

export const AttendanceReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/attendance/report';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReport(data);
      }
    } catch (err) {
      console.error('Failed to load attendance report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const summary = report?.summary || {};

  const handleExportCSV = () => {
    if (!report || !report.data || report.data.length === 0) return;
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Date', 'Check-In', 'Check-Out', 'Working Hours', 'Status', 'Is Late'];
    const rows = report.data.map(item => [
      item.employee?.employeeId || '',
      item.employee?.fullName || '',
      item.employee?.department?.name || '',
      new Date(item.attendanceDate).toLocaleDateString(),
      item.checkIn ? new Date(item.checkIn).toLocaleTimeString() : '',
      item.checkOut ? new Date(item.checkOut).toLocaleTimeString() : '',
      item.workingHours || 0,
      item.status || '',
      item.isLate ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
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
              <ShieldCheck size={12} /> Enterprise Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FFFFFF]">Attendance Reports & Analytics</h1>
          <p className="text-[#CBD5E1] text-sm mt-1 max-w-xl">
            Analyze workforce presence trends, late arrivals, average working hours, and operational attendance statistics.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-[#FFFFFF] px-5 py-3 rounded-xl font-bold text-sm transition-all shadow"
        >
          <Download size={18} /> Export Report CSV
        </button>
      </div>

      {/* Date Filters */}
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
        </div>
        <button 
          onClick={fetchReport}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow"
        >
          Apply Filters
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#2563EB]/20 text-[#38BDF8] flex items-center justify-center font-bold">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94A3B8]">Total Records</p>
            <h3 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">{summary.totalRecords || 0}</h3>
          </div>
        </div>

        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#16A34A]/20 text-[#16A34A] flex items-center justify-center font-bold">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94A3B8]">Present / On Time</p>
            <h3 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">{summary.presentCount || 0}</h3>
          </div>
        </div>

        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94A3B8]">Late Arrivals</p>
            <h3 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">{summary.lateCount || 0}</h3>
          </div>
        </div>

        <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center font-bold">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94A3B8]">Avg Working Hours</p>
            <h3 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">{summary.averageWorkingHours || 0} hrs</h3>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <h3 className="text-base font-bold text-[#FFFFFF] mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-[#38BDF8]" /> Detailed Attendance Report Logs
        </h3>

        {loading ? (
          <div className="text-center py-16 text-[#94A3B8]">Generating report analytics...</div>
        ) : !report?.data || report.data.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8] bg-[#0F172A] rounded-xl border border-[#334155]">
            No attendance records found for the selected period.
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
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155] text-sm">
                {report.data.map((item) => (
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
