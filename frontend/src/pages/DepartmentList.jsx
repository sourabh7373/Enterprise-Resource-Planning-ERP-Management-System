import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Edit2, Trash2, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';

export const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/departments?search=${search}&page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data);
        setTotalPages(data.pages);
      } else {
        setError(data.message || 'Failed to fetch departments');
      }
    } catch (err) {
      setError('Network error while fetching departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [search, page]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/departments/${deleteModal.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Department deleted successfully');
        setDeleteModal({ show: false, id: null, name: '' });
        fetchDepartments();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError(data.message);
        setDeleteModal({ show: false, id: null, name: '' });
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError('Failed to delete department');
      setDeleteModal({ show: false, id: null, name: '' });
    }
  };

  return (
    <div className="p-8 space-y-6 bg-[#F5F7FB] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Organization</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Departments Management</h1>
          <p className="text-slate-500 mt-1">Manage company departments and department heads.</p>
        </div>
        <button
          onClick={() => navigate('/departments/create')}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search departments by name, code, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Code</th>
                <th className="py-3.5 px-6">Department Head</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">Loading departments...</td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">No departments found.</td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{dept.name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{dept.description || 'No description'}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-indigo-600">{dept.code}</td>
                    <td className="py-4 px-6">
                      {dept.departmentHead ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-600">
                            {dept.departmentHead.profileImage ? (
                              <img src={`http://localhost:5000${dept.departmentHead.profileImage}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                              dept.departmentHead.fullName?.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{dept.departmentHead.fullName}</div>
                            <div className="text-xs text-slate-500">{dept.departmentHead.employeeId}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        dept.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {dept.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/departments/edit/${dept._id}`)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Department"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, id: dept._id, name: dept.name })}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Department"
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
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteModal.show && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Delete Department</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteModal.name}</span>? This action cannot be undone and will fail if employees are assigned to this department.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium shadow-sm"
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
