import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, FileText, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ 
    income: 0, 
    expenses: 0, 
    netBalance: 0,
    paidTransactions: 0,
    pendingTransactions: 0,
    overdueTransactions: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoiceAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('/api/finance/summary');
        setSummary(res.data);
      } catch (error) {
        console.error('Error fetching finance summary', error);
        setError('Failed to load finance summary.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const cards = [
    { title: 'Income', value: summary.income.toFixed(2), icon: TrendingUp, color: 'bg-green-600', path: '/finance/income' },
    { title: 'Expenses', value: summary.expenses.toFixed(2), icon: TrendingDown, color: 'bg-red-600', path: '/finance/expenses' },
    { title: 'Net Balance', value: summary.netBalance.toFixed(2), icon: DollarSign, color: 'bg-blue-600', path: '/finance/transactions' },
    { title: 'Total Invoices', value: summary.totalInvoices, icon: FileText, color: 'bg-indigo-600', path: '/invoices' },
    { title: 'Paid Transactions', value: summary.paidTransactions, icon: CheckCircle, color: 'bg-green-500', path: '/finance/transactions' },
    { title: 'Pending Transactions', value: summary.pendingTransactions, icon: Clock, color: 'bg-yellow-500', path: '/finance/transactions' },
    { title: 'Overdue Transactions', value: summary.overdueTransactions, icon: XCircle, color: 'bg-red-500', path: '/finance/transactions' },
    { title: 'Pending Invoice Amt', value: summary.pendingInvoiceAmount.toFixed(2), icon: AlertCircle, color: 'bg-orange-500', path: '/invoices' },
  ];

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div>
        <h1 className="text-3xl font-bold text-[#FFFFFF]">Finance Dashboard</h1>
        <p className="text-[#94A3B8]">Overview of financial performance.</p>
      </div>

      {loading ? (
        <div className="text-white">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(card.path)}
                className="bg-[#172554] border border-[#334155] rounded-2xl p-6 hover:border-[#38BDF8] transition-all cursor-pointer shadow-sm"
              >
                <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center text-white mb-4`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-sm text-[#94A3B8]">{card.title}</h3>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
