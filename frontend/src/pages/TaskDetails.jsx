import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, CheckCircle2 } from 'lucide-react';

export const TaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setTask(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-[#E2E8F0]">Loading...</div>;
  if (!task) return <div className="p-8 text-[#E2E8F0]">Task not found</div>;

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <h1 className="text-3xl font-bold">{task.title}</h1>
      <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155]">
        <p className="text-[#94A3B8] mb-4">{task.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <p><strong>Project:</strong> {task.project?.name}</p>
          <p><strong>Assigned To:</strong> {task.assignedEmployee?.fullName}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
        </div>
        <div className="mt-6 flex gap-2">
          {['TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'ON_HOLD'].map(s => (
            <button key={s} onClick={() => handleStatusUpdate(s)} className="bg-[#2563EB] px-3 py-1 rounded-lg text-sm">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
