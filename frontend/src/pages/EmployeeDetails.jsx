import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, Shield, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEmployee(data.data);
      } else {
        setError(data.message || 'Failed to fetch employee details');
      }
    } catch (err) {
      setError('Network error while fetching employee details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/employees/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ employmentStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Employment status updated successfully');
        fetchEmployeeDetails();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 min-h-screen bg-[#F5F7FB]">Loading employee details...</div>;
  }

  if (error && !employee) {
    return (
      <div className="p-8 max-w-xl mx-auto min-h-screen bg-[#F5F7FB]">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-[#F5F7FB] min-h-screen max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 border border-slate-200 rounded-xl hover:bg-white transition-colors text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Personnel Profile</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{employee?.fullName}</h1>
          </div>
        </div>
        <button
          onClick={() => navigate(`/employees/edit/${employee._id}`)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          Edit Profile
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-center">
          <div className="w-28 h-28 mx-auto rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-600 shadow-inner">
            {employee?.profileImage ? (
              <img src={`http://localhost:5000${employee.profileImage}`} alt="" className="w-full h-full object-cover" />
            ) : (
              employee?.fullName?.charAt(0)
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{employee?.fullName}</h2>
            <p className="text-sm text-indigo-600 font-mono font-semibold">{employee?.employeeId}</p>
            <p className="text-xs text-slate-500 mt-1">{employee?.designation}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-center">
            <select
              value={employee?.employmentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Active">Active</option>
              <option value="Probation">Probation</option>
              <option value="Notice Period">Notice Period</option>
              <option value="Terminated">Terminated</option>
              <option value="Resigned">Resigned</option>
            </select>
          </div>

          <div className="space-y-3 text-left pt-4 border-t border-slate-100 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <span className="truncate">{employee?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone size={16} className="text-slate-400 shrink-0" />
              <span>{employee?.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Building2 size={16} className="text-slate-400 shrink-0" />
              <span>{employee?.department?.name || 'Unassigned'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <MapPin size={16} className="text-slate-400 shrink-0" />
              <span className="truncate">{employee?.address || 'No address provided'}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Employment Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Employment Type</span>
                <span className="font-medium text-slate-800">{employee?.employmentType}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Joining Date</span>
                <span className="font-medium text-slate-800">{employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Date of Birth</span>
                <span className="font-medium text-slate-800">{employee?.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Reporting Manager</span>
                <span className="font-medium text-slate-800">{employee?.reportingManager?.fullName || 'None'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">System User Link</span>
                <span className="font-medium text-slate-800">{employee?.user ? 'Linked' : 'Not Linked'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Emergency Contact</h3>
            {employee?.emergencyContact?.name ? (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">Name</span>
                  <span className="font-medium text-slate-800">{employee.emergencyContact.name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Relation</span>
                  <span className="font-medium text-slate-800">{employee.emergencyContact.relation}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Phone</span>
                  <span className="font-medium text-slate-800">{employee.emergencyContact.phone}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No emergency contact provided.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Documents & Files</h3>
            {employee?.documents && employee.documents.length > 0 ? (
              <div className="space-y-2">
                {employee.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-indigo-600" />
                      <div>
                        <div className="font-medium text-slate-800">{doc.name}</div>
                        <div className="text-xs text-slate-400">Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <a
                      href={`http://localhost:5000${doc.path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
                    >
                      Download / View
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No documents uploaded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
