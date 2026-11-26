import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [prodRes, catRes] = await Promise.all([
        axios.get('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/categories', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.SKU.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || (p.category && p.category._id === selectedCategory);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Inventory</p>
          <h1 className="text-2xl font-bold text-[#FFFFFF] mt-1">Product Management</h1>
        </div>
        <button
          onClick={() => navigate('/products/create')}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-[#94A3B8]" size={18} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#38BDF8]"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
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
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Selling Price</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {filteredProducts.map(p => {
                const isLowStock = p.currentStock <= p.minimumStockLevel;
                return (
                  <tr key={p._id} className="hover:bg-[#1E293B]">
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-[#38BDF8] font-mono">{p.SKU}</td>
                    <td className="px-6 py-4">{p.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{p.supplier?.companyName || p.supplier?.name || 'N/A'}</td>
                    <td className="px-6 py-4">${p.sellingPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 font-semibold">{p.currentStock}</td>
                    <td className="px-6 py-4">
                      {isLowStock ? (
                        <span className="flex items-center gap-1 text-red-400 bg-red-950 px-2 py-1 rounded-full text-xs w-fit">
                          <AlertTriangle size={14} /> Low Stock
                        </span>
                      ) : (
                        <span className="text-green-400 bg-green-950 px-2 py-1 rounded-full text-xs">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => navigate(`/products/edit/${p._id}`)} className="text-yellow-500 hover:text-white"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-white"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && <div className="p-6 text-center text-[#94A3B8]">No products found.</div>}
        </div>
      )}
    </div>
  );
};

export default ProductList;
