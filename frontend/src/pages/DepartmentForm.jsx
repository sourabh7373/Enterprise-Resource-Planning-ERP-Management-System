import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Building2, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export const DepartmentForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [employees, setEmployees] = useState([]);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    // Fetch employees for department head dropdown
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/employees?limit=100', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setEmployees(data.data);
        }
      } catch (err) {
        console.error('Failed to load employees');
      }
    };
    fetchEmployees();

    if (isEdit) {
      const fetchDepartment = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/departments/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setValue('name', data.data.name);
            setValue('code', data.data.code);
            setValue('description', data.data.description);
            setValue('departmentHead', data.data.departmentHead?._id || '');
            setValue('status', data.data.status);
          } else {
            setError(data.message);
          }
        } catch (err) {
          setError('Failed to fetch department details');
        }
      };
      fetchDepartment();
    }
  }, [id, isEdit, setValue]);

  const onSubmit = async (formData) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const url = isEdit ? `http://localhost:5000/api/departments/${id}` : 'http://localhost:5000/api/departments';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        departmentHead: formData.departmentHead || null
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(isEdit ? 'Department updated successfully!' : 'Department created successfully!');
        setTimeout(() => {
          navigate('/departments');
        }, 1500);
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      setError('Network error during submission');
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 bg-[#F5F7FB] min-h-screen">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/departments')}
          className="p-2 border border-slate-200 rounded-xl hover:bg-white transition-colors text-slate-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{isEdit ? 'Edit Department' : 'Create Department'}</h1>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Department Name *</label>
            <input
              type="text"
              {...register('name', { required: 'Department name is required' })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. Human Resources"
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Department Code *</label>
            <input
              type="text"
              {...register('code', { required: 'Department code is required' })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. HR"
            />
            {errors.code && <p className="text-xs text-rose-600 mt-1">{errors.code.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Description</label>
          <textarea
            rows={3}
            {...register('description')}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            placeholder="Department purpose and scope..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Department Head</label>
            <select
              {...register('departmentHead')}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">Select Department Head</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.employeeId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/departments')}
            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Department' : 'Create Department')}
          </button>
        </div>
      </form>
    </div>
  );
};
