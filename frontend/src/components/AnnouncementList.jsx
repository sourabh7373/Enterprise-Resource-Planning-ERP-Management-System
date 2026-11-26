import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Plus, Calendar, Shield, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

const AnnouncementList = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetRoles, setTargetRoles] = useState(['EMPLOYEE']);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState('PUBLISHED');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'HR_MANAGER');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching announcements', err);
      setError('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleRoleToggle = (role) => {
    if (targetRoles.includes(role)) {
      if (targetRoles.length > 1) {
        setTargetRoles(targetRoles.filter((r) => r !== role));
      }
    } else {
      setTargetRoles([...targetRoles, role]);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    if (new Date(startDate) > new Date(expiryDate)) {
      setFormError('Expiry date must be after start date.');
      return;
    }

    if (targetRoles.length === 0) {
      setFormError('Select at least one target role.');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/announcements',
        {
          title,
          description,
          targetRoles,
          startDate,
          expiryDate,
          status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle('');
      setDescription('');
      setTargetRoles(['EMPLOYEE']);
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      console.error('Error creating announcement', err);
      setFormError(err.response?.data?.message || 'Failed to create announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#2563EB]/20 text-[#38BDF8] rounded-xl border border-[#2563EB]/40">
            <Megaphone size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#FFFFFF]">Announcements</h1>
            <p className="text-sm text-[#CBD5E1] mt-0.5">
              Enterprise communications and broadcasts targeted to your role.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow transition-all text-sm"
          >
            <Plus size={18} />
            <span>Create Announcement</span>
          </button>
        )}
      </div>

      {/* Main Content State Handling */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#38BDF8]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-950/40 border border-red-900/50 p-6 rounded-2xl text-center text-red-300">
          <AlertCircle size={32} className="mx-auto mb-2 text-red-400" />
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchAnnouncements}
            className="mt-4 px-4 py-2 bg-red-900/50 hover:bg-red-900 text-white rounded-xl text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-[#172554] border border-[#334155] rounded-2xl p-12 text-center">
          <Megaphone size={48} className="mx-auto mb-3 text-[#94A3B8]" />
          <h3 className="text-lg font-bold text-[#FFFFFF]">No Announcements Found</h3>
          <p className="text-sm text-[#CBD5E1] mt-1">
            There are currently no active announcements targeted to your role.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className="bg-[#172554] border border-[#334155] rounded-2xl p-6 shadow-sm hover:border-[#38BDF8]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="font-bold text-lg text-[#FFFFFF] line-clamp-1">{ann.title}</h3>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      ann.status === 'PUBLISHED'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                    }`}
                  >
                    {ann.status}
                  </span>
                </div>

                <p className="text-sm text-[#CBD5E1] mb-4 whitespace-pre-line line-clamp-4">
                  {ann.description}
                </p>
              </div>

              <div className="border-t border-[#334155] pt-4 mt-4 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {ann.targetRoles?.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1 bg-[#0F172A] text-[#38BDF8] border border-[#334155] px-2 py-0.5 rounded-md text-[10px] font-semibold"
                    >
                      <Shield size={10} />
                      {role.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(ann.startDate).toLocaleDateString()} - {new Date(ann.expiryDate).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-[#CBD5E1]">
                    By {ann.createdBy?.name || 'Administrator'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#172554] border border-[#334155] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[#334155]">
              <h2 className="text-lg font-bold text-[#FFFFFF]">Create Announcement</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#CBD5E1] hover:text-white p-1 rounded-lg bg-[#0F172A] border border-[#334155]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-950/60 border border-red-900/50 text-red-300 p-3 rounded-xl text-xs font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. System Maintenance Notice"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed announcement content..."
                  rows="4"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                  Target Roles *
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#0F172A] p-3 border border-[#334155] rounded-xl">
                  {['SUPER_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER', 'SALES_MANAGER', 'INVENTORY_MANAGER', 'EMPLOYEE'].map(
                    (role) => (
                      <label
                        key={role}
                        className="flex items-center gap-2 text-xs text-[#E2E8F0] cursor-pointer p-1.5 hover:bg-[#172554] rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={targetRoles.includes(role)}
                          onChange={() => handleRoleToggle(role)}
                          className="rounded bg-[#172554] border-[#334155] text-[#2563EB] focus:ring-0"
                        />
                        {role.replace('_', ' ')}
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3.5 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3.5 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3.5 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-[#0F172A] border border-[#334155] hover:bg-[#111C33] text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow"
                >
                  {submitting ? 'Creating...' : 'Save Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementList;
