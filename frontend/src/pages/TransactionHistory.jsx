import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({ type: '', category: '', paymentStatus: '', startDate: '', endDate: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    fetchTransactions(1);
  }, [filters]);

  const fetchTransactions = async (page) => {
    try {
      const query = new URLSearchParams({ ...filters, page }).toString();
      const res = await axios.get(`/api/finance/transactions?${query}`);
      setTransactions(res.data.transactions || []);
      setPagination({ page: res.data.currentPage || 1, totalPages: res.data.totalPages || 1 });
    } catch (error) {
      console.error('Error fetching transactions', error);
      setTransactions([]);
    }
  };

  const clearFilters = () => {
    setFilters({ type: '', category: '', paymentStatus: '', startDate: '', endDate: '' });
  };

  return (
    <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <select className="p-2 bg-[#0F172A] rounded" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <input type="text" placeholder="Category" className="p-2 bg-[#0F172A] rounded" value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} />
        <select className="p-2 bg-[#0F172A] rounded" value={filters.paymentStatus} onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}>
          <option value="">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
        <input type="date" className="p-2 bg-[#0F172A] rounded" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
        <input type="date" className="p-2 bg-[#0F172A] rounded" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
        <button onClick={clearFilters} className="p-2 bg-red-600 rounded">Clear</button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#334155]">
            <th className="p-2">Type</th>
            <th className="p-2">Category</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(transactions) && transactions.length > 0 ? (
            transactions.map(t => (
              <tr key={t._id} className="border-b border-[#334155]">
                <td className="p-2">{t.type}</td>
              <td className="p-2">{t.category}</td>
              <td className="p-2">{t.amount}</td>
              <td className="p-2">{new Date(t.paymentDate).toLocaleDateString()}</td>
            </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center">No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="mt-4 flex gap-2">
        <button disabled={pagination.page === 1} onClick={() => fetchTransactions(pagination.page - 1)} className="p-2 bg-[#1E293B] rounded">Prev</button>
        <span className="p-2">Page {pagination.page} of {pagination.totalPages}</span>
        <button disabled={pagination.page === pagination.totalPages} onClick={() => fetchTransactions(pagination.page + 1)} className="p-2 bg-[#1E293B] rounded">Next</button>
      </div>
    </div>
  );
};
