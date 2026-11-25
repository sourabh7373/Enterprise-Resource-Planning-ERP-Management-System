import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Search, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TaskList = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (res.ok) {
          setTasks(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch tasks:', data.message);
          setTasks([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => 
    (task.title.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter ? task.status === statusFilter : true) &&
    (priorityFilter ? task.priority === priorityFilter : true)
  );

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
        {(user?.role === 'HR_MANAGER' || user?.role === 'SUPER_ADMIN') && (
          <button onClick={() => navigate('/tasks/create')} className="bg-[#2563EB] px-4 py-2 rounded-xl flex items-center gap-2">
            <Plus size={18} /> Create Task
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <input type="text" placeholder="Search tasks..." className="bg-[#172554] p-2 rounded-lg flex-1" onChange={(e) => setSearch(e.target.value)} />
        <select className="bg-[#172554] p-2 rounded-lg" onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'ON_HOLD'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="bg-[#172554] p-2 rounded-lg" onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="bg-[#172554] rounded-2xl border border-[#334155] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1E3A8A] text-[#94A3B8] text-xs uppercase">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Project</th>
                <th className="p-4">Assigned To</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => {
                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
                  return (
                    <tr key={task._id} onClick={() => navigate(`/tasks/${task._id}`)} className="cursor-pointer hover:bg-[#1E3A8A]">
                      <td className="p-4">{task.title} {isOverdue && <AlertCircle size={16} className="text-rose-500 inline" />}</td>
                      <td className="p-4">{task.project?.name}</td>
                      <td className="p-4">{task.assignedEmployee?.fullName}</td>
                      <td className="p-4">{task.priority}</td>
                      <td className="p-4">{task.status}</td>
                      <td className="p-4">{new Date(task.dueDate).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#94A3B8]">No tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
