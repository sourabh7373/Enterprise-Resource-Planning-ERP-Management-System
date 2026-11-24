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
    <div className="p-8 max-w-3xl mx-auto space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/departments')}
          className="p-2 border border-[#334155] bg-[#0F172A] rounded-xl hover:bg-[#1E3A5F] transition-colors text-[#CBD5E1]"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Departments</p>
          <h1 className="text-2xl font-bold text-[#FFFFFF] mt-1">{isEdit ? 'Edit Department' : 'Create Department'}</h1>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/65 text-emerald-300 rounded-xl flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/65 text-rose-300 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-rose-400 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-[#172554] rounded-2xl border border-[#334155] shadow-sm p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Department Name *</label>
            <input
              type="text"
              {...register('name', { required: 'Department name is required' })}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="e.g. Human Resources"
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Department Code *</label>
            <input
              type="text"
              {...register('code', { required: 'Department code is required' })}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] uppercase placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="e.g. HR"
            />
            {errors.code && <p className="text-xs text-rose-400 mt-1">{errors.code.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Description</label>
          <textarea
            rows={3}
            {...register('description')}
            className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            placeholder="Department purpose and scope..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Department Head</label>
            <select
              {...register('departmentHead')}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="" className="bg-[#0F172A] text-[#FFFFFF]">Select Department Head</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id} className="bg-[#0F172A] text-[#FFFFFF]">{emp.fullName} ({emp.employeeId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="Active" className="bg-[#0F172A] text-[#FFFFFF]">Active</option>
              <option value="Inactive" className="bg-[#0F172A] text-[#FFFFFF]">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
          <button
            type="button"
            onClick={() => navigate('/departments')}
            className="px-6 py-2.5 border border-[#334155] bg-[#0F172A] text-[#CBD5E1] rounded-xl text-sm font-medium hover:bg-[#1E3A5F] hover:text-[#FFFFFF]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] rounded-xl text-sm font-medium shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Department' : 'Create Department')}
          </button>
        </div>
      </form>
    </div>
  );
};
