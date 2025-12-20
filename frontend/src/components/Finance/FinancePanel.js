// =====================================================
// FINANCE PANEL
// Contextual finance panel for filing
// Shows invoice status, payment options
// Only visible when allowedActions includes relevant finance actions
// =====================================================

import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import financeService from '../../services/api/financeService';

const FinancePanel = ({ filingId, allowedActions = [] }) => {
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filingId) {
      setLoading(false);
      return;
    }

    async function fetchInvoice() {
      try {
        setLoading(true);
        const invoiceData = await financeService.getInvoice(filingId);
        setInvoice(invoiceData.invoice);
        
        if (invoiceData.invoice?.id) {
          // Fetch payments for this invoice
          const paymentsData = await financeService.getPayments(invoiceData.invoice.id);
          setPayments(paymentsData.payments || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load invoice');
        console.error('Failed to fetch invoice', { filingId, error: err });
      } finally {
        setLoading(false);
      }
    }

    fetchInvoice();
  }, [filingId]);

  // Don't show panel if no invoice or if filing doesn't have finance actions
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return null; // Don't show panel if there's an error or no invoice
  }

  const isPaid = invoice.paymentStatus === 'paid';
  const isPending = invoice.paymentStatus === 'pending';
  const isOverdue = invoice.status === 'overdue';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Invoice Details
        </h3>
        {isPaid && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </span>
        )}
        {isPending && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )}
        {isOverdue && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Overdue
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Invoice Number</p>
          <p className="text-base font-medium text-gray-900">{invoice.invoiceNumber}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Amount</p>
          <p className="text-2xl font-bold text-gray-900">₹{invoice.totalAmount?.toLocaleString('en-IN') || '0'}</p>
        </div>

        {invoice.dueDate && (
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="text-base text-gray-900">
              {new Date(invoice.dueDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}

        {isPending && allowedActions.includes('pay_invoice') && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                // Handle payment initiation
                window.location.href = `/finance/invoices/${invoice.id}/pay`;
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Pay Invoice
            </button>
          </div>
        )}

        {payments.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900 mb-2">Payment History</p>
            <div className="space-y-2">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {payment.method} - ₹{payment.amount?.toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      payment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancePanel;

