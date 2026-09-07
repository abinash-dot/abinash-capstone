import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  Edit3,
  CheckCircle,
  AlertCircle,
  Building,
  UserCheck,
  Calendar,
  Save,
} from 'lucide-react';
import { AuditSignOff, BucketSummary, EclTotals, EconomicOutlook } from '../types';
import { formatINR, formatPercent } from '../utils/eclCalculations';

interface AuditWorkingPaperViewProps {
  signOff: AuditSignOff;
  onUpdateSignOff: (updated: AuditSignOff) => void;
  totals: EclTotals;
  bucketSummaries: BucketSummary[];
  outlook: EconomicOutlook;
  reportingDate: string;
}

export const AuditWorkingPaperView: React.FC<AuditWorkingPaperViewProps> = ({
  signOff,
  onUpdateSignOff,
  totals,
  bucketSummaries,
  outlook,
  reportingDate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<AuditSignOff>({ ...signOff });

  const handleSave = () => {
    onUpdateSignOff(formState);
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Statutory Audit Working Paper (WP)
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Ref: {signOff.workingPaperRef}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit Documentation complying with Standards on Auditing (SA 230 / SA 540) & Ind AS 109
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Sign-off Fields</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Working Paper</span>
          </button>
        </div>
      </div>

      {/* WORKING PAPER FORMAL DOCUMENT */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-xs p-6 md:p-8 space-y-6 text-slate-800 text-xs sm:text-sm">
        {/* Working Paper Metadata Header */}
        <div className="border-b-2 border-slate-900 pb-4">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                AUDIT WORKING PAPER • IND AS 109 FINANCIAL INSTRUMENTS
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                EVALUATION OF IMPAIRMENT LOSS (ECL) ON TRADE RECEIVABLES
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Standard: Ind AS 109 (Simplified Approach) | Engagement: {signOff.engagementCode}
              </p>
            </div>

            <div className="text-right text-xs space-y-1">
              <div>
                <span className="text-slate-500 font-medium">WP Ref: </span>
                <span className="font-mono font-bold text-slate-900">{signOff.workingPaperRef}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Reporting Date: </span>
                <span className="font-mono font-semibold text-slate-900">{reportingDate}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Audit Status: </span>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    signOff.auditStatus === 'Approved & Signed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : signOff.auditStatus === 'Queries Raised'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {signOff.auditStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded">
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Total Gross Receivables</span>
              <span className="font-mono font-bold text-slate-900">{formatINR(totals.totalGrossReceivable)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Recommended Loss Allowance</span>
              <span className="font-mono font-bold text-rose-700">{formatINR(totals.totalEcl)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Economic Outlook</span>
              <span className="font-semibold text-slate-900">{outlook} ({outlook === 'Optimistic' ? '×0.85' : outlook === 'Base' ? '×1.00' : '×1.30'})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Overall ECL %</span>
              <span className="font-mono font-bold text-indigo-700">{formatPercent(totals.eclPercentage)}</span>
            </div>
          </div>
        </div>

        {/* REQUIRED WORKING PAPER SECTIONS: A through F */}
        <div className="space-y-6 divide-y divide-slate-200">
          {/* SECTION A. OBJECTIVE */}
          <div className="pt-4 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-mono">
                A
              </span>
              Objective
            </h4>
            <p className="text-slate-700 leading-relaxed pl-7 text-justify">
              To verify the existence, completeness, valuation, and allocation of Trade Receivables as of{' '}
              <strong>{reportingDate}</strong>, and to independently calculate and audit the Expected Credit Loss
              (ECL) provision required under the <strong>Simplified Approach of Ind AS 109 'Financial Instruments'</strong>{' '}
              (paragraph 5.5.15), ensuring proper recognition in the Statement of Profit and Loss and disclosure in the Notes to Accounts.
            </p>
          </div>

          {/* SECTION B. SOURCE OF DATA */}
          <div className="pt-4 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-mono">
                B
              </span>
              Source of Data
            </h4>
            <div className="pl-7 space-y-2 text-slate-700">
              <p>The audit team extracted and reconciled the following primary records:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
                <li>Trade Receivables sub-ledger trial balance as at {reportingDate} reconciled with the General Ledger.</li>
                <li>Invoice master register detailing customer names, invoice numbers, invoice dates, contractual due dates, and outstanding amounts.</li>
                <li>Historical collection, default, and bad-debt write-off history spanning the preceding 3 to 5 financial cycles.</li>
                <li>Bank statements and subsequent realization registers post {reportingDate} to evaluate recovery of overdue accounts.</li>
              </ul>
            </div>
          </div>

          {/* SECTION C. METHODOLOGY */}
          <div className="pt-4 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-mono">
                C
              </span>
              Methodology
            </h4>
            <div className="pl-7 space-y-2 text-slate-700 text-justify">
              <p>
                In accordance with Ind AS 109 Implementation Guidance (Para B5.5.35), the provision matrix methodology
                was applied as follows:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-600">
                <li><strong>Ageing Stratification:</strong> Individual invoices classified into 6 standardized overdue ageing intervals based on elapsed days from due date to reporting date.</li>
                <li><strong>Historical Default Calibration:</strong> Baseline historical loss percentages mapped to each past-due interval.</li>
                <li><strong>Forward-Looking Adjustment:</strong> Baseline loss rates calibrated using a macroeconomic coefficient ({outlook === 'Optimistic' ? '×0.85' : outlook === 'Base' ? '×1.00' : '×1.30'}) based on selected economic outlook ({outlook}).</li>
                <li><strong>Provision Computation:</strong> ECL calculated for each line item as <code>Outstanding Amount × Adjusted Default Rate</code> and rounded to the nearest Rupee.</li>
              </ol>
            </div>
          </div>

          {/* SECTION D. ASSUMPTIONS */}
          <div className="pt-4 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-mono">
                D
              </span>
              Assumptions
            </h4>
            <div className="pl-7 space-y-1.5 text-slate-700 text-justify">
              <p>
                • <strong>Homogeneity of Receivables:</strong> Trade receivables reflect consistent risk profiles within defined customer segments (Corporate, SME, Retail).
              </p>
              <p>
                • <strong>Macroeconomic Multiplier:</strong> The selected <strong>{outlook}</strong> outlook multiplier appropriately reflects the forward-looking economic headwinds/tailwinds impacting customer settlement horizons over the next 12 months.
              </p>
              <p>
                • <strong>Contractual Enforceability:</strong> Sales invoices are supported by valid purchase orders, delivery challans, and enforceable contracts.
              </p>
            </div>
          </div>

          {/* SECTION E. RISK ASSESSMENT */}
          <div className="pt-4 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-mono">
                E
              </span>
              Risk Assessment
            </h4>
            <div className="pl-7 space-y-2 text-slate-700 text-justify">
              <p>
                • <strong>Concentration Risk:</strong> Largest individual default exposure resides with{' '}
                <strong>{totals.largestDefaultExposure?.customer || 'N/A'}</strong> with an expected credit loss of{' '}
                <strong>{totals.largestDefaultExposure ? formatINR(totals.largestDefaultExposure.ecl) : '₹0'}</strong>.
              </p>
              <p>
                • <strong>Aged Receivables (&gt;90 Days):</strong> The highest ageing exposure lies in the{' '}
                <strong>{totals.highestAgeingBucket?.bucket}</strong> bucket amounting to{' '}
                <strong>{totals.highestAgeingBucket ? formatINR(totals.highestAgeingBucket.grossAmount) : '₹0'}</strong>.
                Management follow-up and credit pause protocols are strongly advised for accounts exceeding 180 days past due.
              </p>
              <p>
                • <strong>Data Integrity Risk:</strong> Data validation checks performed for negative balances, duplicate invoice numbers, and missing due dates.
              </p>
            </div>
          </div>

          {/* SECTION F. CONCLUSION */}
          <div className="pt-4 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-mono">
                F
              </span>
              Conclusion & Audit Opinion
            </h4>
            <div className="pl-7 space-y-3 text-slate-700 text-justify">
              <p>
                Based on the audit procedures executed, the calculation mechanics, ageing classification, and
                macroeconomic adjustments comply in all material respects with the principles of{' '}
                <strong>Ind AS 109 'Financial Instruments'</strong>.
              </p>
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 font-medium">
                A total loss allowance of <strong>{formatINR(totals.totalEcl)}</strong> is determined to be adequate
                and properly stated as at {reportingDate}. The following accounting entry is recommended for posting:
                <div className="mt-2 font-mono text-xs text-slate-900 bg-white p-2.5 rounded border border-emerald-200">
                  <div>Dr. Impairment Loss on Trade Receivables (P&L) &nbsp;&nbsp;&nbsp;&nbsp;{formatINR(totals.totalEcl)}</div>
                  <div className="pl-8">Cr. Loss Allowance (ECL) - Balance Sheet &nbsp;&nbsp;&nbsp;&nbsp;{formatINR(totals.totalEcl)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWER SIGN-OFF FIELDS */}
        <div className="border-t-2 border-slate-900 pt-6 mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Audit Review & Quality Control Sign-Offs (SA 230)
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              Audit Firm: {signOff.auditFirmName}
            </span>
          </div>

          {isEditing ? (
            /* Editable Form */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {/* Prepared By */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block uppercase">
                  Prepared By (Senior / Specialist)
                </label>
                <input
                  type="text"
                  value={formState.preparedBy}
                  onChange={(e) => setFormState({ ...formState, preparedBy: e.target.value })}
                  placeholder="Name"
                  className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                />
                <input
                  type="text"
                  value={formState.preparedByDesignation}
                  onChange={(e) => setFormState({ ...formState, preparedByDesignation: e.target.value })}
                  placeholder="Designation"
                  className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                />
                <input
                  type="date"
                  value={formState.preparedDate}
                  onChange={(e) => setFormState({ ...formState, preparedDate: e.target.value })}
                  className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white font-mono"
                />
              </div>

              {/* Reviewed By */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block uppercase">
                  Reviewed By (Audit Manager / Director)
                </label>
                <input
                  type="text"
                  value={formState.reviewedBy}
                  onChange={(e) => setFormState({ ...formState, reviewedBy: e.target.value })}
                  placeholder="Name"
                  className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                />
                <input
                  type="text"
                  value={formState.reviewedByDesignation}
                  onChange={(e) => setFormState({ ...formState, reviewedByDesignation: e.target.value })}
                  placeholder="Designation"
                  className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                />
                <input
                  type="date"
                  value={formState.reviewedDate}
                  onChange={(e) => setFormState({ ...formState, reviewedDate: e.target.value })}
                  className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white font-mono"
                />
              </div>

              {/* Partner Sign-Off */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block uppercase">
                  Engagement Partner / Quality Reviewer
                </label>
                <input
                  type="text"
                  value={formState.partnerSignOff}
                  onChange={(e) => setFormState({ ...formState, partnerSignOff: e.target.value })}
                  placeholder="Partner Name"
                  className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                />
                <select
                  value={formState.auditStatus}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      auditStatus: e.target.value as AuditSignOff['auditStatus'],
                    })
                  }
                  className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white font-semibold"
                >
                  <option value="Draft">Draft</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Queries Raised">Queries Raised</option>
                  <option value="Approved & Signed">Approved & Signed</option>
                </select>
                <input
                  type="date"
                  value={formState.partnerDate}
                  onChange={(e) => setFormState({ ...formState, partnerDate: e.target.value })}
                  className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white font-mono"
                />
              </div>

              {/* Review Notes */}
              <div className="col-span-full space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block uppercase">
                  Reviewer Notes & Technical Sign-off Remarks
                </label>
                <textarea
                  value={formState.reviewNotes}
                  onChange={(e) => setFormState({ ...formState, reviewNotes: e.target.value })}
                  rows={2}
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
          ) : (
            /* Printable / Visual Sign-off Block */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prepared by */}
              <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                  Prepared By
                </span>
                <span className="text-sm font-bold text-slate-900 block mt-1">
                  {signOff.preparedBy}
                </span>
                <span className="text-xs text-slate-600 block">{signOff.preparedByDesignation}</span>
                <span className="text-[11px] text-slate-500 font-mono block mt-2">
                  Date: {signOff.preparedDate}
                </span>
                <div className="mt-2 text-emerald-600 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Calculations Verified</span>
                </div>
              </div>

              {/* Reviewed by */}
              <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                  Reviewed By
                </span>
                <span className="text-sm font-bold text-slate-900 block mt-1">
                  {signOff.reviewedBy}
                </span>
                <span className="text-xs text-slate-600 block">{signOff.reviewedByDesignation}</span>
                <span className="text-[11px] text-slate-500 font-mono block mt-2">
                  Date: {signOff.reviewedDate}
                </span>
                <div className="mt-2 text-emerald-600 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Methodology Approved</span>
                </div>
              </div>

              {/* Partner Sign-off */}
              <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                  Engagement Partner
                </span>
                <span className="text-sm font-bold text-slate-900 block mt-1">
                  {signOff.partnerSignOff}
                </span>
                <span className="text-xs text-slate-600 block">Senior Partner / Technical Reviewer</span>
                <span className="text-[11px] text-slate-500 font-mono block mt-2">
                  Date: {signOff.partnerDate}
                </span>
                <div className="mt-2 text-indigo-700 text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Final Audit Sign-Off</span>
                </div>
              </div>

              {/* Reviewer Commentary */}
              {signOff.reviewNotes && (
                <div className="col-span-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                  <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider mb-1">
                    Quality Review Notes:
                  </span>
                  <p className="italic">{signOff.reviewNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
