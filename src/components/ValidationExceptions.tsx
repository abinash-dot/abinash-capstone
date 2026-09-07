import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { ValidationIssue } from '../types';

interface ValidationExceptionsProps {
  issues: ValidationIssue[];
  totalRecordsCount: number;
}

export const ValidationExceptions: React.FC<ValidationExceptionsProps> = ({
  issues,
  totalRecordsCount,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  const filteredIssues = issues.filter((i) => {
    if (filterType === 'ALL') return true;
    return i.type === filterType;
  });

  const handleCopyExceptions = () => {
    const lines = [
      'IND AS 109 DATA VALIDATION & EXCEPTION AUDIT LOG',
      `Total Records: ${totalRecordsCount} | Total Exceptions: ${issues.length}`,
      '--------------------------------------------------------------------------------',
      'Row #\tType\tSeverity\tCustomer\tInvoice #\tMessage',
    ];

    issues.forEach((i) => {
      lines.push(
        `${i.rowNumber || '-'}\t${i.type}\t${i.severity.toUpperCase()}\t${i.customer || '-'}\t${i.invoiceNo || '-'}\t${i.message}`
      );
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Data Validation & Audit Exception Log
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated audit verification against Ind AS 109 data integrity and ledger sanity rules.
            </p>
          </div>

          <button
            onClick={handleCopyExceptions}
            disabled={issues.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied Log</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Audit Log</span>
              </>
            )}
          </button>
        </div>

        {/* Severity Count Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Inspected
            </span>
            <span className="text-lg font-bold font-mono text-slate-800 tabular-nums">
              {totalRecordsCount} Records
            </span>
          </div>

          <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
              Errors (Critical)
            </span>
            <span className="text-lg font-bold font-mono text-rose-800 tabular-nums">
              {errors.length}
            </span>
          </div>

          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
              Warnings (Attention)
            </span>
            <span className="text-lg font-bold font-mono text-amber-800 tabular-nums">
              {warnings.length}
            </span>
          </div>

          <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
            <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider block">
              Notices / Info
            </span>
            <span className="text-lg font-bold font-mono text-sky-800 tabular-nums">
              {infos.length}
            </span>
          </div>
        </div>
      </div>

      {/* VALIDATION RULES REFERENCE & CHECKLIST */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Auditor Verification Protocols
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-xs">
          <div className="p-2.5 bg-white border border-slate-200 rounded">
            <span className="font-bold text-slate-800 block">1. Negative Receivable</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Flagged as error. Must be investigated for unapplied credit notes or advances.
            </p>
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded">
            <span className="font-bold text-slate-800 block">2. Duplicate Invoice</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Highlighted for duplicate billing or split payments across lines.
            </p>
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded">
            <span className="font-bold text-slate-800 block">3. Missing Due Date</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Calculated from standard credit terms or reported if days cannot be computed.
            </p>
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded">
            <span className="font-bold text-slate-800 block">4. Non-Numeric Amount</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Rejected from ECL calculations to preserve arithmetic integrity.
            </p>
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded">
            <span className="font-bold text-slate-800 block">5. Blank Customer</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Flagged for missing counterparty master record in accounting system.
            </p>
          </div>
        </div>
      </div>

      {/* EXCEPTION ITEMS LIST */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Exceptions Listing ({filteredIssues.length})
          </h3>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Exception Categories</option>
              <option value="Negative receivable">Negative Receivable</option>
              <option value="Duplicate invoice">Duplicate Invoice</option>
              <option value="Missing due date">Missing Due Date</option>
              <option value="Non-numeric amount">Non-numeric Amount</option>
              <option value="Blank customer">Blank Customer</option>
            </select>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Clean Dataset</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No validation exceptions found for the selected filter. All invoice records satisfy
              standard Ind AS 109 completeness and sanity checks.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-3.5 hover:bg-slate-50/80 transition flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {issue.severity === 'error' ? (
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                    ) : issue.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Info className="w-4 h-4 text-sky-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          issue.severity === 'error'
                            ? 'bg-rose-100 text-rose-800'
                            : issue.severity === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {issue.type}
                      </span>

                      {issue.rowNumber && (
                        <span className="text-xs font-mono font-medium text-slate-500">
                          Row #{issue.rowNumber}
                        </span>
                      )}

                      {issue.invoiceNo && (
                        <span className="text-xs font-mono font-semibold text-slate-800">
                          Inv: {issue.invoiceNo}
                        </span>
                      )}

                      {issue.customer && (
                        <span className="text-xs font-medium text-slate-700">
                          • {issue.customer}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 mt-1">{issue.message}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[11px] font-semibold ${
                      issue.severity === 'error'
                        ? 'text-rose-700'
                        : issue.severity === 'warning'
                        ? 'text-amber-700'
                        : 'text-sky-700'
                    }`}
                  >
                    {issue.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
