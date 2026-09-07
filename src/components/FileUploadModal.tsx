import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
  Info,
} from 'lucide-react';
import { InvoiceRecord } from '../types';
import { downloadSampleCsvTemplate } from '../utils/excelExport';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (invoices: InvoiceRecord[], mode: 'replace' | 'append') => void;
  reportingDate: string;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  reportingDate,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<InvoiceRecord[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [loadMode, setLoadMode] = useState<'replace' | 'append'>('replace');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Header normalizer to match various column names
  const normalizeHeader = (hdr: string): string => {
    const clean = hdr.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.includes('customer') || clean.includes('debtor') || clean.includes('client') || clean.includes('party')) {
      return 'customer';
    }
    if (clean.includes('invoiceno') || clean.includes('invno') || clean.includes('billno') || clean === 'invoice' || clean === 'inv') {
      return 'invoiceNo';
    }
    if (clean.includes('invoicedate') || clean.includes('invdate') || clean.includes('billdate')) {
      return 'invoiceDate';
    }
    if (clean.includes('duedate') || clean.includes('due')) {
      return 'dueDate';
    }
    if (clean.includes('outstanding') || clean.includes('amount') || clean.includes('balance') || clean.includes('gross')) {
      return 'outstandingAmount';
    }
    if (clean.includes('days') || clean.includes('overdue')) {
      return 'daysOutstanding';
    }
    if (clean.includes('segment') || clean.includes('category') || clean.includes('type')) {
      return 'segment';
    }
    return clean;
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('Could not read file.');

        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse to JSON array of objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('The uploaded file is empty or has no recognizable data rows.');
        }

        // Map column headers
        const invoices: InvoiceRecord[] = rawJson.map((row, idx) => {
          const mapped: any = { id: `import-${Date.now()}-${idx + 1}` };

          Object.keys(row).forEach((origKey) => {
            const normKey = normalizeHeader(origKey);
            let val = row[origKey];

            // Convert Date objects to YYYY-MM-DD
            if (val instanceof Date) {
              const y = val.getFullYear();
              const m = String(val.getMonth() + 1).padStart(2, '0');
              const d = String(val.getDate()).padStart(2, '0');
              val = `${y}-${m}-${d}`;
            }

            if (normKey === 'customer') mapped.customer = String(val).trim();
            else if (normKey === 'invoiceNo') mapped.invoiceNo = String(val).trim();
            else if (normKey === 'invoiceDate') mapped.invoiceDate = String(val).trim();
            else if (normKey === 'dueDate') mapped.dueDate = String(val).trim();
            else if (normKey === 'outstandingAmount') {
              const parsedNum = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
              mapped.outstandingAmount = isNaN(parsedNum) ? 0 : parsedNum;
            } else if (normKey === 'daysOutstanding') {
              const daysNum = parseInt(String(val).replace(/[^0-9-]/g, ''), 10);
              if (!isNaN(daysNum)) mapped.daysOutstanding = daysNum;
            } else if (normKey === 'segment') mapped.segment = String(val).trim();
          });

          // Fallback defaults
          if (!mapped.customer) mapped.customer = '';
          if (!mapped.invoiceNo) mapped.invoiceNo = `INV-${idx + 1}`;
          if (mapped.outstandingAmount === undefined) mapped.outstandingAmount = 0;

          return mapped as InvoiceRecord;
        });

        if (invoices.length === 0) {
          throw new Error('No valid trade receivable rows could be extracted.');
        }

        setParsedPreview(invoices);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to parse Excel/CSV file.');
        setParsedPreview([]);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Failed reading file from disk.');
    };

    reader.readAsBinaryString(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    if (parsedPreview.length > 0) {
      onDataLoaded(parsedPreview, loadMode);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Upload Trade Receivables Data</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Instructions and Expected Columns */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Required Columns:
              </span>
              <button
                onClick={downloadSampleCsvTemplate}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 underline"
              >
                <Download className="w-3.5 h-3.5" />
                Download Template CSV
              </button>
            </div>
            <p className="text-xs text-slate-600 font-mono">
              Customer | Invoice No | Invoice Date | Due Date | Outstanding Amount | Days Outstanding | Segment
            </p>
            <p className="text-[11px] text-slate-500">
              * If <em>Days Outstanding</em> is blank, it will be automatically calculated from Due Date using Reporting Date ({reportingDate}).
            </p>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0]);
                }
              }}
            />
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <span className="font-bold text-sm text-slate-800 block">
              Drag and drop your Excel (.xlsx, .xls) or CSV file here
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Or click to browse from your computer
            </span>
          </div>

          {/* Error display */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview of Parsed Data */}
          {parsedPreview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Successfully parsed {parsedPreview.length} invoices from "{fileName}"
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      checked={loadMode === 'replace'}
                      onChange={() => setLoadMode('replace')}
                    />
                    <span>Replace data</span>
                  </label>
                  <label className="flex items-center gap-1 text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      checked={loadMode === 'append'}
                      onChange={() => setLoadMode('append')}
                    />
                    <span>Append to data</span>
                  </label>
                </div>
              </div>

              {/* Sample 3 rows preview */}
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Customer</th>
                      <th className="p-2">Invoice #</th>
                      <th className="p-2 text-right">Outstanding (₹)</th>
                      <th className="p-2 text-right">Days</th>
                      <th className="p-2">Segment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {parsedPreview.slice(0, 5).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 font-sans font-medium">{r.customer}</td>
                        <td className="p-2">{r.invoiceNo}</td>
                        <td className="p-2 text-right">₹{r.outstandingAmount?.toLocaleString('en-IN')}</td>
                        <td className="p-2 text-right">{r.daysOutstanding !== undefined ? r.daysOutstanding : 'Auto'}</td>
                        <td className="p-2 font-sans">{r.segment || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedPreview.length > 5 && (
                <p className="text-[11px] text-slate-500 italic">
                  Showing first 5 rows of {parsedPreview.length} total rows...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={parsedPreview.length === 0}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition disabled:opacity-50 shadow-xs flex items-center gap-1.5"
          >
            <span>Apply to Working Paper</span>
          </button>
        </div>
      </div>
    </div>
  );
};
