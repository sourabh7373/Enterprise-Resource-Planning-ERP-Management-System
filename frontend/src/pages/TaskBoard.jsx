import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const statuses = ['TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'ON_HOLD'];

  return (
    <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <h1 className="text-2xl font-bold mb-6">Task Board</h1>
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-5 gap-4">
          {statuses.map(status => (
            <div key={status} className="bg-[#172554] p-4 rounded-xl">
              <h2 className="font-bold mb-4 text-[#94A3B8]">{status}</h2>
              <div className="space-y-3">
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task._id} className="bg-[#1E3A8A] p-3 rounded-lg text-sm">
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-[#94A3B8] text-xs mt-1">{task.project?.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
