import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    status: 'ACTIVE'
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/suppliers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(res.data);
    } catch (err) {
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', companyName: '', address: '', status: 'ACTIVE' });
    setShowModal(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingId(sup._id);
    setFormData({
      name: sup.name,
      email: sup.email,
      phone: sup.phone,
      companyName: sup.companyName,
      address: sup.address || '',
      status: sup.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/suppliers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSuppliers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete supplier');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`/api/suppliers/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/suppliers', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save supplier');
    }
  };

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Inventory</p>
          <h1 className="text-2xl font-bold text-[#FFFFFF] mt-1">Supplier Management</h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-400">{error}</div>
      ) : (
        <div className="bg-[#172554] rounded-xl border border-[#334155] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#0F172A] text-[#94A3B8] text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {suppliers.map(s => (
                <tr key={s._id} className="hover:bg-[#1E293B]">
                  <td className="px-6 py-4 font-medium">{s.companyName}</td>
                  <td className="px-6 py-4">{s.name}</td>
                  <td className="px-6 py-4 text-[#38BDF8]">{s.email}</td>
                  <td className="px-6 py-4">{s.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${s.status === 'ACTIVE' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleOpenEdit(s)} className="text-yellow-500 hover:text-white"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-white"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {suppliers.length === 0 && <div className="p-6 text-center text-[#94A3B8]">No suppliers found.</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#172554] border border-[#334155] rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-xl font-bold">{editingId ? 'Edit Supplier' : 'Add New Supplier'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                  rows="2"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-[#334155] hover:bg-[#475569] rounded-lg text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
