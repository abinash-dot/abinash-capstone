import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Download,
  CheckCircle,
} from 'lucide-react';
import { ComputedInvoiceRow, EclTotals, AgeBucket } from '../types';
import { formatINR, formatPercent, ALL_BUCKETS } from '../utils/eclCalculations';

interface DetailedEclTableProps {
  computedRows: ComputedInvoiceRow[];
  totals: EclTotals;
  onDeleteRow: (id: string) => void;
  onOpenAddModal: () => void;
  onExportCsv: () => void;
}

export const DetailedEclTable: React.FC<DetailedEclTableProps> = ({
  computedRows,
  totals,
  onDeleteRow,
  onOpenAddModal,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBucket, setSelectedBucket] = useState<string>('ALL');
  const [showAdditionalCols, setShowAdditionalCols] = useState(true);
  const [copied, setCopied] = useState(false);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return computedRows.filter((row) => {
      const matchSearch =
        (row.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.invoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.segment || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchBucket = selectedBucket === 'ALL' || row.bucket === selectedBucket;

      return matchSearch && matchBucket;
    });
  }, [computedRows, searchTerm, selectedBucket]);

  // Filtered totals
  const filteredGross = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + (r.outstandingAmount || 0), 0);
  }, [filteredRows]);

  const filteredEcl = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + r.ecl, 0);
  }, [filteredRows]);

  // Copy table to clipboard in tab-delimited format (for Excel pasting)
  const handleCopyTable = () => {
    const headers = ['Customer', 'Outstanding', 'Days', 'Bucket', 'Hist %', 'Adj %', 'ECL'];
    const lines = [headers.join('\t')];

    filteredRows.forEach((r) => {
      lines.push([
        r.customer,
        r.outstandingAmount,
        r.calculatedDays,
        r.bucket,
        r.histRatePercent,
        r.adjRatePercent,
        r.ecl,
      ].join('\t'));
    });

    lines.push([
      'TOTAL',
      filteredGross,
      '-',
      '-',
      '-',
      '-',
      filteredEcl,
    ].join('\t'));

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Required Output Table — Invoice-Level ECL Matrix
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {filteredRows.length} {filteredRows.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Format: Customer | Outstanding | Days | Bucket | Hist % | Adj % | ECL
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTable}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition shadow-2xs"
              title="Copy table formatted for Excel"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied TSV!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy for Excel</span>
                </>
              )}
            </button>

            <button
              onClick={onExportCsv}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Invoice</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 flex-1 max-w-lg">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search customer, invoice #, segment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Bucket Filter */}
            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-md px-2 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Age Buckets</option>
                {ALL_BUCKETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle additional columns */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAdditionalCols}
                onChange={(e) => setShowAdditionalCols(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span>Show Details (Invoice #, Due Date, Segment, Flags)</span>
            </label>
          </div>
        </div>
      </div>

      {/* The EXACT REQUIRED OUTPUT TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-4 sticky left-0 bg-slate-100 z-10">Customer</th>
              <th className="py-2.5 px-3 text-right">Outstanding</th>
              <th className="py-2.5 px-3 text-right">Days</th>
              <th className="py-2.5 px-3 text-center">Bucket</th>
              <th className="py-2.5 px-3 text-right">Hist %</th>
              <th className="py-2.5 px-3 text-right">Adj %</th>
              <th className="py-2.5 px-4 text-right">ECL</th>
              {showAdditionalCols && (
                <>
                  <th className="py-2.5 px-3 text-left">Invoice No</th>
                  <th className="py-2.5 px-3 text-left">Due Date</th>
                  <th className="py-2.5 px-3 text-left">Segment</th>
                  <th className="py-2.5 px-3 text-center">Audit Flags</th>
                  <th className="py-2.5 px-2 text-center">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={showAdditionalCols ? 12 : 7}
                  className="py-8 text-center text-slate-400 text-xs"
                >
                  No trade receivables match your filter or search criteria.
                </td>
              </tr>
            ) : (
              filteredRows.map((r, idx) => {
                const hasFlags = r.validationFlags.length > 0;
                return (
                  <tr
                    key={r.id || idx}
                    className={`hover:bg-slate-50/90 transition ${
                      hasFlags ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Customer */}
                    <td className="py-2.5 px-4 font-semibold text-slate-900 sticky left-0 bg-inherit z-10">
                      <div className="flex items-center gap-1.5">
                        {hasFlags && (
                          <AlertTriangle
                            className="w-3.5 h-3.5 text-amber-500 shrink-0"
                            title={r.validationFlags.join(', ')}
                          />
                        )}
                        <span className={!r.customer?.trim() ? 'text-amber-700 italic' : ''}>
                          {r.customer || '[BLANK CUSTOMER]'}
                        </span>
                      </div>
                    </td>

                    {/* Outstanding Amount */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800 font-medium">
                      {formatINR(r.outstandingAmount)}
                    </td>

                    {/* Days */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {r.calculatedDays}
                    </td>

                    {/* Bucket */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.bucket === 'Current'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.bucket === '1–30'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : r.bucket === '31–60'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : r.bucket === '61–90'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : r.bucket === '91–180'
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.bucket}
                      </span>
                    </td>

                    {/* Hist % */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                      {formatPercent(r.histRatePercent)}
                    </td>

                    {/* Adj % */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-indigo-700 font-semibold">
                      {formatPercent(r.adjRatePercent)}
                    </td>

                    {/* ECL */}
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-rose-700">
                      {formatINR(r.ecl)}
                    </td>

                    {/* Additional columns */}
                    {showAdditionalCols && (
                      <>
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                          {r.invoiceNo || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                          {r.dueDate || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {r.segment || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {hasFlags ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded font-medium">
                              {r.validationFlags[0]}
                              {r.validationFlags.length > 1 && ` +${r.validationFlags.length - 1}`}
                            </span>
                          ) : (
                            <span className="text-emerald-600 text-[11px]">✓ Valid</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => onDeleteRow(r.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition rounded"
                            title="Delete invoice row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* REQUIRED TOTALS ROW */}
          <tfoot>
            <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
              <td className="py-3 px-4 uppercase tracking-wider sticky left-0 bg-slate-900 z-10 text-xs">
                TOTAL
              </td>
              <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-300 text-sm">
                {formatINR(filteredGross)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-slate-400 text-xs">—</td>
              <td className="py-3 px-3 text-center font-mono text-slate-400 text-xs">—</td>
              <td className="py-3 px-3 text-right font-mono text-slate-400 text-xs">—</td>
              <td className="py-3 px-3 text-right font-mono text-slate-400 text-xs">—</td>
              <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-300 text-sm">
                {formatINR(filteredEcl)}
              </td>
              {showAdditionalCols && (
                <>
                  <td colSpan={5} className="py-3 px-3 text-right text-xs text-slate-400 font-normal">
                    {filteredRows.length} receivables • Ind AS 109 Simplified Approach
                  </td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
