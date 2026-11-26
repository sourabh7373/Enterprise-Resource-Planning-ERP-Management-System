import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const AnalyticsSection = () => {
  const [growthData, setGrowthData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [empRes, attRes] = await Promise.all([
          axios.get('/api/employees?limit=1000', { headers }),
          axios.get('/api/attendance/report', { headers })
        ]);

        // Process Employee Growth
        const employees = empRes.data.data || [];
        const growthMap = employees.reduce((acc, emp) => {
          const date = new Date(emp.createdAt).toLocaleDateString('en-US', { month: 'short' });
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        
        setGrowthData(Object.entries(growthMap).map(([name, count]) => ({ name, count })));

        // Process Attendance Ratio
        const summary = attRes.data.summary || {};
        setAttendanceData([
          { name: 'Present', value: summary.presentCount || 0 },
          { name: 'Absent', value: summary.absentCount || 0 },
          { name: 'On Leave', value: summary.onLeaveCount || 0 }
        ]);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <h3 className="text-sm font-bold text-[#FFFFFF] mb-4">Employee Growth Trends</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none' }} />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <h3 className="text-sm font-bold text-[#FFFFFF] mb-4">Attendance Ratio</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={attendanceData} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                {attendanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
