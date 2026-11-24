import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Users, ArrowLeft, AlertCircle, CheckCircle2, Upload } from 'lucide-react';

export const EmployeeForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [deptRes, empRes, userRes] = await Promise.all([
          fetch('http://localhost:5000/api/departments?limit=100', { headers }),
          fetch('http://localhost:5000/api/employees?limit=100', { headers }),
          fetch('http://localhost:5000/api/users', { headers })
        ]);

        const deptData = await deptRes.json();
        const empData = await empRes.json();
        const userData = await userRes.json();

        if (deptData.success) setDepartments(deptData.data);
        if (empData.success) setManagers(empData.data);
        if (userData.success) setUsers(userData.data);
      } catch (err) {
        console.error('Failed to load initial form data');
      }
    };
    fetchData();

    if (isEdit) {
      const fetchEmployee = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            const emp = data.data;
            setValue('fullName', emp.fullName);
            setValue('email', emp.email);
            setValue('phone', emp.phone);
            setValue('address', emp.address);
            if (emp.dateOfBirth) setValue('dateOfBirth', emp.dateOfBirth.split('T')[0]);
            setValue('department', emp.department?._id || '');
            setValue('designation', emp.designation);
            if (emp.joiningDate) setValue('joiningDate', emp.joiningDate.split('T')[0]);
            setValue('employmentType', emp.employmentType);
            setValue('reportingManager', emp.reportingManager?._id || '');
            setValue('employmentStatus', emp.employmentStatus);
            setValue('user', emp.user?._id || '');
            if (emp.emergencyContact) {
              setValue('emergencyName', emp.emergencyContact.name);
              setValue('emergencyRelation', emp.emergencyContact.relation);
              setValue('emergencyPhone', emp.emergencyContact.phone);
            }
          } else {
            setError(data.message);
          }
        } catch (err) {
          setError('Failed to fetch employee details');
        }
      };
      fetchEmployee();
    }
  }, [id, isEdit, setValue]);

  const onSubmit = async (formData) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const url = isEdit ? `http://localhost:5000/api/employees/${id}` : 'http://localhost:5000/api/employees';
      const method = isEdit ? 'PUT' : 'POST';

      const dataForm = new FormData();
      dataForm.append('fullName', formData.fullName);
      dataForm.append('email', formData.email);
      dataForm.append('phone', formData.phone);
      if (formData.address) dataForm.append('address', formData.address);
      if (formData.dateOfBirth) dataForm.append('dateOfBirth', formData.dateOfBirth);
      dataForm.append('department', formData.department);
      dataForm.append('designation', formData.designation);
      if (formData.joiningDate) dataForm.append('joiningDate', formData.joiningDate);
      if (formData.employmentType) dataForm.append('employmentType', formData.employmentType);
      if (formData.reportingManager) dataForm.append('reportingManager', formData.reportingManager);
      if (formData.employmentStatus) dataForm.append('employmentStatus', formData.employmentStatus);
      if (formData.user) dataForm.append('user', formData.user);

      const emergencyContact = {
        name: formData.emergencyName || '',
        relation: formData.emergencyRelation || '',
        phone: formData.emergencyPhone || ''
      };
      dataForm.append('emergencyContact', JSON.stringify(emergencyContact));

      if (profileImageFile) {
        dataForm.append('profileImage', profileImageFile);
      }

      if (documentFiles.length > 0) {
        for (let i = 0; i < documentFiles.length; i++) {
          dataForm.append('documents', documentFiles[i]);
        }
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: dataForm
      });

      const resData = await res.json();
      if (resData.success) {
        setSuccess(isEdit ? 'Employee updated successfully!' : 'Employee created successfully!');
        setTimeout(() => {
          navigate('/employees');
        }, 1500);
      } else {
        setError(resData.message || 'Operation failed');
      }
    } catch (err) {
      setError('Network error during employee submission');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/employees')}
          className="p-2 border border-[#334155] rounded-xl hover:bg-[#172554] transition-colors text-[#CBD5E1]"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Personnel</p>
          <h1 className="text-2xl font-bold text-[#FFFFFF] mt-1">{isEdit ? 'Edit Employee' : 'Onboard Employee'}</h1>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 rounded-xl flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/50 text-rose-300 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-rose-400 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-[#172554] rounded-2xl border border-[#334155] shadow-sm p-8 space-y-6">
        <div className="border-b border-[#334155] pb-4">
          <h3 className="text-sm font-semibold text-[#FFFFFF] uppercase tracking-wider">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Full Name *</label>
            <input
              type="text"
              {...register('fullName', { required: 'Full name is required' })}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="e.g. Jane Doe"
            />
            {errors.fullName && <p className="text-xs text-rose-400 mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Email Address *</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
              })}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="e.g. jane.doe@company.com"
            />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Phone Number *</label>
            <input
              type="text"
              {...register('phone', { required: 'Phone number is required' })}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="e.g. +1 555-0199"
            />
            {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Date of Birth</label>
            <input
              type="date"
              {...register('dateOfBirth')}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Residential Address</label>
            <textarea
              rows={2}
              {...register('address')}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="Street address, city, country..."
            />
          </div>
        </div>

        <div className="border-b border-[#334155] pb-4 pt-4">
          <h3 className="text-sm font-semibold text-[#FFFFFF] uppercase tracking-wider">Employment Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Department *</label>
            <select
              {...register('department', { required: 'Department is required' })}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="" className="bg-[#0F172A] text-[#FFFFFF]">Select Department</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id} className="bg-[#0F172A] text-[#FFFFFF]">{dept.name} ({dept.code})</option>
              ))}
            </select>
            {errors.department && <p className="text-xs text-rose-400 mt-1">{errors.department.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Designation *</label>
            <input
              type="text"
              {...register('designation', { required: 'Designation is required' })}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="e.g. Senior Software Engineer"
            />
            {errors.designation && <p className="text-xs text-rose-400 mt-1">{errors.designation.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Joining Date</label>
            <input
              type="date"
              {...register('joiningDate')}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Employment Type</label>
            <select
              {...register('employmentType')}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="Full-time" className="bg-[#0F172A] text-[#FFFFFF]">Full-time</option>
              <option value="Part-time" className="bg-[#0F172A] text-[#FFFFFF]">Part-time</option>
              <option value="Contract" className="bg-[#0F172A] text-[#FFFFFF]">Contract</option>
              <option value="Intern" className="bg-[#0F172A] text-[#FFFFFF]">Intern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Reporting Manager</label>
            <select
              {...register('reportingManager')}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="" className="bg-[#0F172A] text-[#FFFFFF]">Select Manager</option>
              {managers.map(mgr => (
                <option key={mgr._id} value={mgr._id} className="bg-[#0F172A] text-[#FFFFFF]">{mgr.fullName} ({mgr.employeeId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Employment Status</label>
            <select
              {...register('employmentStatus')}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="Active" className="bg-[#0F172A] text-[#FFFFFF]">Active</option>
              <option value="Probation" className="bg-[#0F172A] text-[#FFFFFF]">Probation</option>
              <option value="Notice Period" className="bg-[#0F172A] text-[#FFFFFF]">Notice Period</option>
              <option value="Terminated" className="bg-[#0F172A] text-[#FFFFFF]">Terminated</option>
              <option value="Resigned" className="bg-[#0F172A] text-[#FFFFFF]">Resigned</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Linked System User Account</label>
            <select
              {...register('user')}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="" className="bg-[#0F172A] text-[#FFFFFF]">No System User</option>
              {users.map(u => (
                <option key={u._id} value={u._id} className="bg-[#0F172A] text-[#FFFFFF]">{u.email} ({u.role})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-b border-[#334155] pb-4 pt-4">
          <h3 className="text-sm font-semibold text-[#FFFFFF] uppercase tracking-wider">Emergency Contact</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Contact Name</label>
            <input
              type="text"
              {...register('emergencyName')}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="Contact person"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Relation</label>
            <input
              type="text"
              {...register('emergencyRelation')}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="e.g. Spouse / Parent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Contact Phone</label>
            <input
              type="text"
              {...register('emergencyPhone')}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="Phone number"
            />
          </div>
        </div>

        <div className="border-b border-[#334155] pb-4 pt-4">
          <h3 className="text-sm font-semibold text-[#FFFFFF] uppercase tracking-wider">Profile Image & Documents</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Profile Image (JPEG, PNG)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImageFile(e.target.files[0])}
              className="w-full text-sm text-[#94A3B8] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2563EB]/20 file:text-[#38BDF8] hover:file:bg-[#2563EB]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">Supporting Documents (PDF, Word, Images)</label>
            <input
              type="file"
              multiple
              onChange={(e) => setDocumentFiles(e.target.files)}
              className="w-full text-sm text-[#94A3B8] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2563EB]/20 file:text-[#38BDF8] hover:file:bg-[#2563EB]/30"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="px-6 py-2.5 border border-[#334155] text-[#CBD5E1] rounded-xl text-sm font-medium hover:bg-[#0F172A] hover:text-[#FFFFFF]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] rounded-xl text-sm font-medium shadow-sm shadow-blue-900/40 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Employee' : 'Onboard Employee')}
          </button>
        </div>
      </form>
    </div>
  );
};
