import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get('/api/invoices');
      setInvoices(res.data);
    } catch (error) {
      console.error('Error fetching invoices', error);
    }
  };

  return (
    <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button onClick={() => navigate('/invoices/create')} className="bg-blue-600 text-white px-4 py-2 rounded">Create Invoice</button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#334155]">
            <th className="p-2">Invoice #</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Total</th>
            <th className="p-2">Balance</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv._id} className="border-b border-[#334155]">
              <td className="p-2">{inv.invoiceNumber}</td>
              <td className="p-2">{inv.customer?.name}</td>
              <td className="p-2">{inv.grandTotal}</td>
              <td className="p-2">{inv.balanceDue}</td>
              <td className="p-2">{inv.paymentStatus}</td>
              <td className="p-2">
                <button onClick={() => navigate(`/invoices/${inv._id}`)} className="text-blue-400">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
