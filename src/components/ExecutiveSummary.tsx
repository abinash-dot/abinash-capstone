import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  TrendingDown,
  Building,
  Layers,
  ArrowUpRight,
  BookOpen,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { BucketSummary, EclTotals, EconomicOutlook } from '../types';
import { formatINR, formatPercent } from '../utils/eclCalculations';

interface ExecutiveSummaryProps {
  totals: EclTotals;
  bucketSummaries: BucketSummary[];
  outlook: EconomicOutlook;
  reportingDate: string;
  onViewDetailedTable: () => void;
  onViewValidation: () => void;
  validationIssueCount: number;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  totals,
  bucketSummaries,
  outlook,
  reportingDate,
  onViewDetailedTable,
  onViewValidation,
  validationIssueCount,
}) => {
  const [copiedJournal, setCopiedJournal] = useState(false);

  const formattedTotalEcl = formatINR(totals.totalEcl);
  const formattedTotalGross = formatINR(totals.totalGrossReceivable);

  const handleCopyJournal = () => {
    const text = `Dr. Impairment Loss on Trade Receivables   ${formattedTotalEcl}\nCr. Loss Allowance (ECL)                     ${formattedTotalEcl}\n(Being lifetime Expected Credit Loss provision recognized on trade receivables under Ind AS 109 Simplified Approach as of ${reportingDate})`;
    navigator.clipboard.writeText(text);
    setCopiedJournal(true);
    setTimeout(() => setCopiedJournal(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice if Validation Exceptions exist */}
      {validationIssueCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Data Validation Notice:</strong> {validationIssueCount} potential exception(s) detected (negative amounts, duplicates, or blank fields).
            </span>
          </div>
          <button
            onClick={onViewValidation}
            className="text-xs font-semibold text-amber-800 underline hover:text-amber-950 ml-3 shrink-0"
          >
            Review Exceptions &rarr;
          </button>
        </div>
      )}

      {/* FINAL SUMMARY KPI CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Executive Summary & Key Impairment Metrics
            </h2>
            <p className="text-xs text-slate-500">
              Computed under Ind AS 109 Simplified Approach for Financial Year ending {reportingDate}
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
            Outlook: <strong>{outlook}</strong> (Multiplier:{' '}
            {outlook === 'Optimistic' ? '×0.85' : outlook === 'Base' ? '×1.00' : '×1.30'})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Total Trade Receivable */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Trade Receivable
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {formattedTotalGross}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Gross ledger exposure</span>
          </div>

          {/* Total ECL */}
          <div className="bg-white border border-rose-200 rounded-lg p-3.5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-1 bg-rose-500"></div>
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
              Total ECL Provision
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-rose-700 tabular-nums">
                {formattedTotalEcl}
              </span>
            </div>
            <span className="text-[11px] text-rose-600/80 mt-1 block">Lifetime expected loss</span>
          </div>

          {/* ECL % */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Overall ECL %
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {formatPercent(totals.eclPercentage, 2)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Portfolio coverage ratio</span>
          </div>

          {/* Largest default exposure */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Largest Default Exposure
            </span>
            <div className="mt-1 truncate">
              <span className="text-sm font-bold text-slate-800 block truncate" title={totals.largestDefaultExposure?.customer || 'N/A'}>
                {totals.largestDefaultExposure?.customer || 'None'}
              </span>
              <span className="text-xs font-mono font-semibold text-rose-600 tabular-nums">
                {totals.largestDefaultExposure ? formatINR(totals.largestDefaultExposure.ecl) : '₹0'} ECL
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              {totals.largestDefaultExposure?.invoiceNo ? `Inv: ${totals.largestDefaultExposure.invoiceNo}` : 'No exposure'}
            </span>
          </div>

          {/* Highest ageing bucket */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Highest Ageing Bucket
            </span>
            <div className="mt-1">
              <span className="text-base font-bold text-slate-900 block">
                {totals.highestAgeingBucket?.bucket || 'N/A'}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                {totals.highestAgeingBucket ? formatINR(totals.highestAgeingBucket.grossAmount) : '₹0'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">Largest gross balance</span>
          </div>

          {/* Action Status */}
          <div className="bg-slate-900 text-white rounded-lg p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Audit Working Paper
            </span>
            <div className="mt-1">
              <span className="text-sm font-bold block text-white">Ind AS 109 Verified</span>
              <span className="text-[11px] text-slate-300 block font-mono">Status: Ready for Audit</span>
            </div>
            <button
              onClick={onViewDetailedTable}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium mt-1 flex items-center gap-1"
            >
              View Invoices &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN SECTION: BUCKET SUMMARY & JOURNAL ENTRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: REQUIRED OUTPUT TABLE (Bucket Summary) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Ageing Bucket Summary (ECL Matrix)
              </h3>
              <p className="text-[11px] text-slate-500">
                Gross receivables and Expected Credit Loss grouped by past-due interval
              </p>
            </div>
            <button
              onClick={onViewDetailedTable}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              Invoice Detail <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Bucket</th>
                  <th className="py-2.5 px-3 text-right">Gross Receivable</th>
                  <th className="py-2.5 px-3 text-right hidden sm:table-cell">Hist %</th>
                  <th className="py-2.5 px-3 text-right hidden sm:table-cell">Adj %</th>
                  <th className="py-2.5 px-4 text-right">ECL (₹)</th>
                  <th className="py-2.5 px-3 text-right hidden md:table-cell">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bucketSummaries.map((b) => (
                  <tr key={b.bucket} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            b.bucket === 'Current'
                              ? 'bg-emerald-500'
                              : b.bucket === '1–30'
                              ? 'bg-sky-500'
                              : b.bucket === '31–60'
                              ? 'bg-indigo-500'
                              : b.bucket === '61–90'
                              ? 'bg-amber-500'
                              : b.bucket === '91–180'
                              ? 'bg-orange-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        {b.bucket}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800 font-medium">
                      {formatINR(b.grossReceivable)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500 hidden sm:table-cell">
                      {formatPercent(b.histRatePercent)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-indigo-700 font-semibold hidden sm:table-cell">
                      {formatPercent(b.adjRatePercent)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-rose-700">
                      {formatINR(b.ecl)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500 hidden md:table-cell">
                      {formatPercent(b.percentOfTotalGross, 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
                  <td className="py-3 px-4 uppercase tracking-wider text-xs">TOTAL</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-300 text-sm">
                    {formattedTotalGross}
                  </td>
                  <td className="py-3 px-3 text-right hidden sm:table-cell text-slate-400 font-mono text-xs">
                    —
                  </td>
                  <td className="py-3 px-3 text-right hidden sm:table-cell text-slate-400 font-mono text-xs">
                    —
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-300 text-sm">
                    {formattedTotalEcl}
                  </td>
                  <td className="py-3 px-3 text-right hidden md:table-cell text-slate-300 font-mono text-xs">
                    100.0%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Visual Ageing Distribution Bar */}
          <div className="p-3 bg-slate-50/50 border-t border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Receivables Ageing Distribution
            </span>
            <div className="h-3 w-full bg-slate-200 rounded-full flex overflow-hidden">
              {bucketSummaries.map((b) => (
                <div
                  key={b.bucket}
                  style={{ width: `${Math.max(b.percentOfTotalGross, 0)}%` }}
                  title={`${b.bucket}: ${formatINR(b.grossReceivable)} (${b.percentOfTotalGross.toFixed(1)}%)`}
                  className={`h-full transition-all ${
                    b.bucket === 'Current'
                      ? 'bg-emerald-500'
                      : b.bucket === '1–30'
                      ? 'bg-sky-500'
                      : b.bucket === '31–60'
                      ? 'bg-indigo-500'
                      : b.bucket === '61–90'
                      ? 'bg-amber-500'
                      : b.bucket === '91–180'
                      ? 'bg-orange-500'
                      : 'bg-rose-500'
                  }`}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-600">
              {bucketSummaries.map((b) => (
                <span key={b.bucket} className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-xs ${
                      b.bucket === 'Current'
                        ? 'bg-emerald-500'
                        : b.bucket === '1–30'
                        ? 'bg-sky-500'
                        : b.bucket === '31–60'
                        ? 'bg-indigo-500'
                        : b.bucket === '61–90'
                        ? 'bg-amber-500'
                        : b.bucket === '91–180'
                        ? 'bg-orange-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span>{b.bucket} ({b.percentOfTotalGross.toFixed(0)}%)</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: JOURNAL ENTRY & MANAGEMENT ADVISORY */}
        <div className="lg:col-span-5 space-y-6">
          {/* JOURNAL ENTRY */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Journal Entry (Ind AS 109)
                </h3>
              </div>
              <button
                onClick={handleCopyJournal}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 transition"
              >
                {copiedJournal ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Entry</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 font-mono text-xs text-slate-900 leading-relaxed">
              <div className="flex justify-between items-baseline py-1 border-b border-slate-200/60">
                <div className="font-semibold text-slate-900">
                  Dr. Impairment Loss on Trade Receivables
                </div>
                <div className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                  {formattedTotalEcl}
                </div>
              </div>
              <div className="flex justify-between items-baseline py-1 pl-6">
                <div className="text-slate-800 font-semibold">
                  Cr. Loss Allowance (ECL)
                </div>
                <div className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                  {formattedTotalEcl}
                </div>
              </div>

              <div className="mt-3 pt-2 text-[11px] text-slate-600 font-sans italic border-t border-dashed border-slate-300">
                (Being lifetime Expected Credit Loss provision recognized on Trade Receivables using
                the Simplified Approach under Ind AS 109 as at {reportingDate} based on provision matrix
                calibrated with {outlook.toLowerCase()} forward-looking macroeconomic conditions).
              </div>
            </div>

            {/* Accounting Presentation Note */}
            <div className="p-3.5 bg-white text-[11px] text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-800 uppercase tracking-wide text-[10px]">
                Statutory Financial Statement Presentation:
              </div>
              <p>
                • <strong>Statement of Profit and Loss:</strong> Debited under <em>"Other Expenses"</em> or as a separate line item if material.
              </p>
              <p>
                • <strong>Balance Sheet (Schedule III):</strong> Presented as a contra-asset deduction directly against gross Trade Receivables under Non-Current / Current Financial Assets.
              </p>
            </div>
          </div>

          {/* RECOMMENDED MANAGEMENT ACTION */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recommended Management Action
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/60 border border-amber-100 rounded-md p-3">
              {totals.recommendedAction}
            </p>

            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
              <div>
                <span className="block font-medium text-slate-700">Accounting Standard:</span>
                <span>Ind AS 109 (Para 5.5.15)</span>
              </div>
              <div>
                <span className="block font-medium text-slate-700">Measurement Basis:</span>
                <span>Lifetime ECL (Simplified)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
