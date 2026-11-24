import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Edit2, Trash2, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';

export const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let query = `?search=${search}&page=${page}&limit=10`;
      if (departmentFilter) query += `&department=${departmentFilter}`;
      if (statusFilter) query += `&employmentStatus=${statusFilter}`;

      const res = await fetch(`http://localhost:5000/api/employees${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
        setTotalPages(data.pages);
      } else {
        setError(data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setError('Network error while fetching employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/departments?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search, departmentFilter, statusFilter, page]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/employees/${deleteModal.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Employee deleted successfully');
        setDeleteModal({ show: false, id: null, name: '' });
        fetchEmployees();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError(data.message);
        setDeleteModal({ show: false, id: null, name: '' });
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError('Failed to delete employee');
      setDeleteModal({ show: false, id: null, name: '' });
    }
  };

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Personnel</p>
          <h1 className="text-2xl font-bold text-[#FFFFFF] mt-1">Employee Management</h1>
          <p className="text-[#94A3B8] mt-1">Manage company staff, employment statuses and profiles.</p>
        </div>
        <button
          onClick={() => navigate('/employees/create')}
          className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-900/40"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 rounded-xl flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/50 text-rose-300 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-rose-400 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="bg-[#172554] rounded-2xl border border-[#334155] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#334155] grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by name, ID, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-4 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          >
            <option value="" className="bg-[#0F172A] text-[#FFFFFF]">All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id} className="bg-[#0F172A] text-[#FFFFFF]">{dept.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          >
            <option value="" className="bg-[#0F172A] text-[#FFFFFF]">All Statuses</option>
            <option value="Active" className="bg-[#0F172A] text-[#FFFFFF]">Active</option>
            <option value="Probation" className="bg-[#0F172A] text-[#FFFFFF]">Probation</option>
            <option value="Notice Period" className="bg-[#0F172A] text-[#FFFFFF]">Notice Period</option>
            <option value="Terminated" className="bg-[#0F172A] text-[#FFFFFF]">Terminated</option>
            <option value="Resigned" className="bg-[#0F172A] text-[#FFFFFF]">Resigned</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1E3A5F] border-b border-[#334155] text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider">
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-6">ID & Contact</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Designation</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155] text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#94A3B8]">Loading employees...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#94A3B8]">No employees found.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-[#1E3A5F]/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#38BDF8] text-[#0F172A] overflow-hidden flex items-center justify-center font-bold shrink-0">
                          {emp.profileImage ? (
                            <img src={`http://localhost:5000${emp.profileImage}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            emp.fullName?.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-[#FFFFFF]">{emp.fullName}</div>
                          <div className="text-xs text-[#94A3B8]">{emp.employmentType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-mono text-xs font-semibold text-[#38BDF8]">{emp.employeeId}</div>
                      <div className="text-xs text-[#94A3B8]">{emp.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-[#E2E8F0]">{emp.department?.name || 'Unassigned'}</div>
                    </td>
                    <td className="py-4 px-6 text-[#CBD5E1]">{emp.designation}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        emp.employmentStatus === 'Active' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50' :
                        emp.employmentStatus === 'Probation' ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' :
                        'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                      }`}>
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      <button
                        onClick={() => navigate(`/employees/${emp._id}`)}
                        className="p-1.5 text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#2563EB]/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/employees/edit/${emp._id}`)}
                        className="p-1.5 text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#2563EB]/20 rounded-lg transition-colors"
                        title="Edit Employee"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, id: emp._id, name: emp.fullName })}
                        className="p-1.5 text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-[#334155] flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-3 py-1.5 border border-[#334155] text-[#E2E8F0] hover:bg-[#0F172A] rounded-lg text-xs font-medium disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 border border-[#334155] text-[#E2E8F0] hover:bg-[#0F172A] rounded-lg text-xs font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteModal.show && (
        <div className="fixed inset-0 bg-[#0B1120]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#172554] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#334155]">
            <h3 className="text-lg font-bold text-[#FFFFFF]">Delete Employee</h3>
            <p className="text-sm text-[#CBD5E1]">
              Are you sure you want to delete <span className="font-semibold text-[#FFFFFF]">{deleteModal.name}</span>? This action will remove their record or mark as terminated.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                className="px-4 py-2 border border-[#334155] text-[#CBD5E1] rounded-xl text-sm font-medium hover:bg-[#0F172A] hover:text-[#FFFFFF]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-[#FFFFFF] rounded-xl text-sm font-medium shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
