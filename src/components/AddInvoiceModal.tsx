import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { InvoiceRecord } from '../types';

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInvoice: (invoice: InvoiceRecord) => void;
  reportingDate: string;
}

export const AddInvoiceModal: React.FC<AddInvoiceModalProps> = ({
  isOpen,
  onClose,
  onAddInvoice,
  reportingDate,
}) => {
  const [customer, setCustomer] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [daysOutstanding, setDaysOutstanding] = useState('');
  const [segment, setSegment] = useState('Corporate');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(outstandingAmount);
    if (isNaN(amountNum)) {
      setError('Please enter a valid numeric outstanding amount.');
      return;
    }

    const daysNum = daysOutstanding.trim() ? parseInt(daysOutstanding, 10) : undefined;

    const newInvoice: InvoiceRecord = {
      id: `manual-${Date.now()}`,
      customer: customer.trim(),
      invoiceNo: invoiceNo.trim() || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceDate: invoiceDate.trim(),
      dueDate: dueDate.trim(),
      outstandingAmount: amountNum,
      daysOutstanding: daysNum,
      segment: segment.trim(),
    };

    onAddInvoice(newInvoice);
    onClose();

    // Reset fields
    setCustomer('');
    setInvoiceNo('');
    setInvoiceDate('');
    setDueDate('');
    setOutstandingAmount('');
    setDaysOutstanding('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Add Trade Receivable (Manual Entry)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ABC Ltd or DEF Pvt"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. INV006"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Segment
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="Corporate">Corporate</option>
                <option value="SME">SME</option>
                <option value="Retail">Retail</option>
                <option value="Government">Government / PSU</option>
                <option value="Exports">Export Counterparties</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Outstanding Amount (₹) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 250000"
                value={outstandingAmount}
                onChange={(e) => setOutstandingAmount(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Days Outstanding (Optional)
              </label>
              <input
                type="number"
                placeholder={`Auto-calc from ${reportingDate}`}
                value={daysOutstanding}
                onChange={(e) => setDaysOutstanding(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Leave blank to calculate from Due Date
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition shadow-xs"
            >
              Add to Working Paper
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
