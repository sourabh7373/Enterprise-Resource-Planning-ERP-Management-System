import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({ category: '', amount: '', paymentMethod: '', paymentDate: '', paymentStatus: 'PAID', description: '' });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/api/finance/transactions?type=EXPENSE');
      setExpenses(res.data.transactions || []);
    } catch (error) {
      console.error('Error fetching expenses', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/finance/expenses', formData);
      fetchExpenses();
      setFormData({ category: '', amount: '', paymentMethod: '', paymentDate: '', paymentStatus: 'PAID', description: '' });
    } catch (error) {
      console.error('Error adding expense', error);
    }
  };

  return (
    <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <h1 className="text-2xl font-bold mb-6">Expense Management</h1>
      <form onSubmit={handleSubmit} className="bg-[#172554] p-6 rounded-xl mb-8 space-y-4">
        <input type="text" placeholder="Category" className="w-full p-2 bg-[#0F172A] rounded" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
        <input type="number" placeholder="Amount" className="w-full p-2 bg-[#0F172A] rounded" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
        <input type="text" placeholder="Payment Method" className="w-full p-2 bg-[#0F172A] rounded" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} required />
        <input type="date" className="w-full p-2 bg-[#0F172A] rounded" value={formData.paymentDate} onChange={(e) => setFormData({...formData, paymentDate: e.target.value})} />
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">Add Expense</button>
      </form>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#334155]">
            <th className="p-2">Category</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(expenses) && expenses.map(exp => (
            <tr key={exp._id} className="border-b border-[#334155]">
              <td className="p-2">{exp.category}</td>
              <td className="p-2">{exp.amount}</td>
              <td className="p-2">{new Date(exp.paymentDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
