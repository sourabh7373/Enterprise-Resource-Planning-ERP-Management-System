import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';

const ProductForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    SKU: '',
    description: '',
    category: '',
    supplier: '',
    purchasePrice: '',
    sellingPrice: '',
    currentStock: 0,
    minimumStockLevel: 5,
    status: 'ACTIVE'
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const token = localStorage.getItem('token');
        const [catRes, supRes] = await Promise.all([
          axios.get('/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/suppliers', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCategories(catRes.data);
        setSuppliers(supRes.data);

        if (isEditing) {
          const prodRes = await axios.get(`/api/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const p = prodRes.data;
          setFormData({
            name: p.name || '',
            SKU: p.SKU || '',
            description: p.description || '',
            category: p.category?._id || p.category || '',
            supplier: p.supplier?._id || p.supplier || '',
            purchasePrice: p.purchasePrice !== undefined ? p.purchasePrice : '',
            sellingPrice: p.sellingPrice !== undefined ? p.sellingPrice : '',
            currentStock: p.currentStock !== undefined ? p.currentStock : 0,
            minimumStockLevel: p.minimumStockLevel !== undefined ? p.minimumStockLevel : 5,
            status: p.status || 'ACTIVE'
          });
        }
      } catch (err) {
        setError('Failed to load form data');
      }
    };
    fetchMetadata();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        currentStock: Number(formData.currentStock),
        minimumStockLevel: Number(formData.minimumStockLevel)
      };

      if (isEditing) {
        await axios.put(`/api/products/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/products', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0] max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 bg-[#1E293B] hover:bg-[#334155] rounded-lg text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Inventory</p>
          <h1 className="text-2xl font-bold text-[#FFFFFF] mt-1">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
      </div>

      {error && <div className="bg-red-950 border border-red-800 text-red-300 p-4 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-[#172554] border border-[#334155] rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
              placeholder="e.g. Wireless Ergonomic Mouse"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">SKU *</label>
            <input
              type="text"
              name="SKU"
              required
              value={formData.SKU}
              onChange={handleChange}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
              placeholder="e.g. WEM-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Supplier *</label>
            <select
              name="supplier"
              required
              value={formData.supplier}
              onChange={handleChange}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
            >
              <option value="">Select Supplier</option>
              {suppliers.map(s => (
                <option key={s._id} value={s._id}>{s.companyName} ({s.name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Purchase Price ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="purchasePrice"
              required
              value={formData.purchasePrice}
              onChange={handleChange}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Selling Price ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="sellingPrice"
              required
              value={formData.sellingPrice}
              onChange={handleChange}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium mb-2">Initial Current Stock *</label>
              <input
                type="number"
                min="0"
                name="currentStock"
                required
                value={formData.currentStock}
                onChange={handleChange}
                className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Minimum Stock Level *</label>
            <input
              type="number"
              min="0"
              name="minimumStockLevel"
              required
              value={formData.minimumStockLevel}
              onChange={handleChange}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
            placeholder="Product description..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-[#334155] hover:bg-[#475569] text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
