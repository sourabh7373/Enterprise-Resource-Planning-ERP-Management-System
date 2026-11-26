import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(`/api/invoices/${id}`);
      setInvoice(res.data);
    } catch (error) {
      console.error('Error fetching invoice', error);
    }
  };

  const handlePayment = async () => {
    try {
      await axios.patch(`/api/invoices/${id}/payment`, { amount: Number(paymentAmount), paymentMethod: 'Cash' });
      fetchInvoice();
      setPaymentAmount('');
    } catch (error) {
      console.error('Error recording payment', error);
    }
  };

  if (!invoice) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex gap-4 mb-6 print:hidden">
        <button
          onClick={() => navigate('/invoices')}
          className="bg-[#1E293B] hover:bg-[#334155] text-white px-4 py-2 rounded-lg transition-colors"
        >
          ← Back to Invoices
        </button>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Print Invoice
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">Invoice {invoice.invoiceNumber}</h1>
      <div className="bg-[#172554] p-6 rounded-xl mb-6 print:bg-white print:text-black print:border print:border-gray-300">
        <p className="font-bold">Invoice #: {invoice.invoiceNumber}</p>
        <p>Customer: {invoice.customer?.name}</p>
        <p>Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
        {invoice.dueDate && <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>}
        {invoice.salesOrderReference && <p>Sales Order: {invoice.salesOrderReference}</p>}
        <div className="mt-4">
          <h3 className="font-bold">Items:</h3>
          {invoice.items?.map((item, index) => (
            <p key={index}>{item.description} - Qty: {item.quantity} - Price: {item.unitPrice} - Total: {item.lineTotal}</p>
          ))}
        </div>
        <div className="mt-4 border-t pt-2">
          <p>Subtotal: {invoice.subtotal}</p>
          <p>Discount: {invoice.discount}</p>
          <p>Tax: {invoice.tax}</p>
          <p className="font-bold">Grand Total: {invoice.grandTotal}</p>
          <p>Amount Paid: {invoice.amountPaid}</p>
          <p>Balance Due: {invoice.balanceDue}</p>
          <p>Status: {invoice.paymentStatus}</p>
        </div>
      </div>
      <div className="bg-[#172554] p-6 rounded-xl print:hidden">
        <h2 className="text-xl font-bold mb-4">Record Payment</h2>
        <input type="number" className="p-2 bg-[#0F172A] rounded mr-2" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Amount" />
        <button onClick={handlePayment} className="bg-blue-600 text-white px-4 py-2 rounded">Pay</button>
      </div>
    </div>
  );
};
