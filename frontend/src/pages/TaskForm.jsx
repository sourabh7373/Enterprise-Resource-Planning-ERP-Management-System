import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export const TaskForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [projRes, empRes] = await Promise.all([
          fetch('http://localhost:5000/api/projects', { headers }),
          fetch('http://localhost:5000/api/employees', { headers })
        ]);
        const projData = await projRes.json();
        const empData = await empRes.json();
        setProjects(Array.isArray(projData) ? projData : (projData.data || []));
        setEmployees(Array.isArray(empData) ? empData : (empData.data || []));
      } catch (err) {
        console.error('Failed to load form data');
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok) {
        setSuccess('Task created successfully!');
        setTimeout(() => navigate('/tasks'), 1500);
      } else {
        setError(resData.message || 'Failed to create task');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/tasks')} className="p-2 border border-[#334155] rounded-xl hover:bg-[#172554]"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold">Create Task</h1>
      </div>
      {success && <div className="p-4 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 rounded-xl flex items-center gap-3"><CheckCircle2 size={20} /> {success}</div>}
      {error && <div className="p-4 bg-rose-950/60 border border-rose-800/50 text-rose-300 rounded-xl flex items-center gap-3"><AlertCircle size={20} /> {error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-[#172554] rounded-2xl border border-[#334155] p-8 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-[#CBD5E1] uppercase mb-2">Title *</label>
          <input {...register('title', { required: true })} className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#CBD5E1] uppercase mb-2">Description *</label>
          <textarea {...register('description', { required: true })} className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF]" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase mb-2">Project *</label>
            <select {...register('project', { required: true })} className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF]">
              <option value="">Select Project</option>
              {Array.isArray(projects) && projects.length > 0 ? projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>) : <option disabled>No projects available</option>}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase mb-2">Assigned Employee *</label>
            <select {...register('assignedEmployee', { required: true })} className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF]">
              <option value="">Select Employee</option>
              {Array.isArray(employees) && employees.length > 0 ? employees.map(e => <option key={e._id} value={e._id}>{e.fullName}</option>) : <option disabled>No employees available</option>}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase mb-2">Priority *</label>
            <select {...register('priority', { required: true })} className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF]">
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase mb-2">Due Date *</label>
            <input type="date" {...register('dueDate', { required: true })} className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF]" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
          <button type="button" onClick={() => navigate('/tasks')} className="px-6 py-2.5 border border-[#334155] text-[#CBD5E1] rounded-xl text-sm font-medium">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-[#2563EB] text-[#FFFFFF] rounded-xl text-sm font-medium">{isSubmitting ? 'Saving...' : 'Create Task'}</button>
        </div>
      </form>
    </div>
  );
};
