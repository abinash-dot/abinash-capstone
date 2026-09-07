import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  BookOpen,
  Printer,
  Scale,
} from 'lucide-react';
import { BucketSummary, EclTotals, EconomicOutlook } from '../types';
import { formatINR, formatPercent } from '../utils/eclCalculations';

interface StatutoryDisclosureProps {
  totals: EclTotals;
  bucketSummaries: BucketSummary[];
  outlook: EconomicOutlook;
  reportingDate: string;
}

export const StatutoryDisclosure: React.FC<StatutoryDisclosureProps> = ({
  totals,
  bucketSummaries,
  outlook,
  reportingDate,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate full text disclosure note
  const getDisclosurePlainText = () => {
    return `NOTES TO THE FINANCIAL STATEMENTS FOR THE YEAR ENDED ${reportingDate}
NOTE [X]: FINANCIAL INSTRUMENTS — CREDIT RISK & EXPECTED CREDIT LOSS (ECL) ON TRADE RECEIVABLES

1. BASIS OF IMPAIRMENT MODEL & SIMPLIFIED APPROACH
The Company applies the 'Simplified Approach' permitted under Ind AS 109 'Financial Instruments' for the recognition of impairment loss on trade receivables arising from contracts with customers. Under this approach, the Company does not track changes in credit risk from initial recognition, but instead recognizes a loss allowance based on lifetime Expected Credit Loss (Lifetime ECL) at each reporting date.

2. LIFETIME ECL MEASUREMENT & PROVISION MATRIX
Trade receivables are evaluated using a provision matrix based on historically observed default rates over the expected life of trade receivables, categorized into distinct ageing intervals based on days past due from contractual due dates. 

3. AGEING METHODOLOGY & PAST DUE STRATIFICATION
Ageing of trade receivables is computed from the respective invoice due dates up to the reporting date (${reportingDate}) and stratified into standard intervals:
- Current (not yet due or <= 0 days past due)
- 1 to 30 days past due
- 31 to 60 days past due
- 61 to 90 days past due
- 91 to 180 days past due
- More than 180 days past due

4. HISTORICAL DEFAULT BASIS & FORWARD-LOOKING ADJUSTMENTS
Historical credit loss rates are calculated based on actual bad debt and collection experience over preceding periods. In accordance with Ind AS 109, these historical loss rates are adjusted to incorporate forward-looking macroeconomic factors that reflect current and forecasted economic conditions. For the reporting period ended ${reportingDate}, the Company has evaluated prevailing monetary, sectoral, and GDP parameters under a '${outlook}' outlook (calibrated with a macroeconomic factor of ${
      outlook === 'Optimistic' ? '0.85' : outlook === 'Base' ? '1.00' : '1.30'
    }x).

5. PROVISION MATRIX TABLE AS AT ${reportingDate}:
Bucket\tGross Carrying Amount (₹)\tAdjusted Default Rate (%)\tLifetime ECL Allowance (₹)
${bucketSummaries
  .map(
    (b) =>
      `${b.bucket}\t${b.grossReceivable}\t${b.adjRatePercent.toFixed(2)}%\t${b.ecl}`
  )
  .join('\n')}
TOTAL\t${totals.totalGrossReceivable}\t${totals.eclPercentage.toFixed(2)}%\t${totals.totalEcl}

6. MANAGEMENT JUDGEMENTS & ESTIMATION UNCERTAINTIES
The determination of expected credit losses involves significant management judgement, including the segmentation of debtors, assessment of past recovery profiles, and selection of forward-looking macroeconomic coefficients. Management periodically reviews customer credit limits, payment history, and subsequent collections up to the date of approval of these financial statements.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getDisclosurePlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Statutory Financial Statement Disclosure (Ind AS 109)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Drafted in statutory financial reporting language for direct incorporation into the Annual Report Notes to Accounts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied Statutory Note</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Note to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* STATUTORY NOTE CONTENT CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6 md:p-8 space-y-6 font-serif text-slate-800 leading-relaxed text-sm">
        {/* Note Title */}
        <div className="border-b border-slate-300 pb-4 text-center font-sans">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block">
            Annual Financial Statements • Notes to Accounts
          </span>
          <h3 className="text-base md:text-lg font-bold text-slate-900 mt-1">
            Note [X]: Financial Instruments — Credit Risk & Expected Credit Losses (Ind AS 109)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            As at and for the year ended {reportingDate}
          </span>
        </div>

        {/* Section 1: Basis of Impairment Model & Simplified Approach */}
        <div className="space-y-2">
          <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            1. Basis of Impairment Model & Simplified Approach
          </h4>
          <p className="text-justify text-slate-700 text-xs sm:text-sm">
            The Company applies the <strong>Simplified Approach</strong> permitted under paragraph 5.5.15 of
            <strong> Ind AS 109 <em>'Financial Instruments'</em></strong> for measuring expected credit losses on trade
            receivables arising from contracts with customers that do not contain a significant financing component.
            Under this approach, the Company is not required to track changes in credit risk from initial recognition;
            instead, an impairment allowance is recognized at an amount equal to <strong>Lifetime Expected Credit Losses (Lifetime ECL)</strong> at each reporting date.
          </p>
        </div>

        {/* Section 2: Lifetime ECL Applied & Provision Matrix */}
        <div className="space-y-2">
          <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            2. Lifetime ECL Measurement & Provision Matrix
          </h4>
          <p className="text-justify text-slate-700 text-xs sm:text-sm">
            Lifetime ECL represents the expected credit losses that will result from all possible default events
            over the expected life of trade receivables. The Company computes the loss allowance using a comprehensive
            <strong> Provision Matrix</strong> stratified by customer segmentation and past-due ageing categories.
          </p>
        </div>

        {/* Section 3: Ageing Methodology */}
        <div className="space-y-2">
          <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            3. Ageing Methodology & Past Due Stratification
          </h4>
          <p className="text-justify text-slate-700 text-xs sm:text-sm">
            The past-due status of each invoice is measured from its respective contractual due date to the balance
            sheet reporting date ({reportingDate}). In accordance with standard industry practices and MCA Division II
            Schedule III disclosures, trade receivables are categorized into the following ageing buckets:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1 pl-2">
            <li><strong>Current:</strong> Not past due or up to 0 days from due date</li>
            <li><strong>1–30 days past due</strong></li>
            <li><strong>31–60 days past due</strong></li>
            <li><strong>61–90 days past due</strong></li>
            <li><strong>91–180 days past due</strong></li>
            <li><strong>Above 180 days past due</strong></li>
          </ul>
        </div>

        {/* Section 4: Historical Default Basis & Forward-Looking Adjustment */}
        <div className="space-y-2">
          <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            4. Historical Default Basis & Forward-Looking Adjustment
          </h4>
          <p className="text-justify text-slate-700 text-xs sm:text-sm">
            Historical loss rates are determined based on historical default experiences over the preceding 3 to 5
            fiscal cycles. In compliance with Ind AS 109, these historical default rates are calibrated with
            <strong> forward-looking economic factors</strong> to reflect current economic realities and reasonable and
            supportable forecasts. For the financial year ended {reportingDate}, management evaluated macroeconomic
            indicators (including prevailing inflation rates, interest rate trajectories, and industry sector outlooks)
            and applied a <strong>{outlook} outlook multiplier of {
              outlook === 'Optimistic' ? '×0.85' : outlook === 'Base' ? '×1.00' : '×1.30'
            }</strong> to determine adjusted default rates.
          </p>
        </div>

        {/* Section 5: Quantitative Ageing & ECL Matrix Table */}
        <div className="space-y-2 font-sans">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            5. Quantitative Ageing & Expected Credit Loss Matrix
          </h4>
          <p className="text-xs text-slate-600 font-serif">
            The following table summarizes the gross carrying amount and the corresponding loss allowance recognized
            under the Simplified Approach as at {reportingDate}:
          </p>

          <div className="overflow-x-auto border border-slate-300 rounded mt-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <th className="py-2.5 px-4 border-r border-slate-300">Ageing Bucket</th>
                  <th className="py-2.5 px-4 text-right border-r border-slate-300">Gross Carrying Amount (₹)</th>
                  <th className="py-2.5 px-4 text-right border-r border-slate-300">Historical Rate %</th>
                  <th className="py-2.5 px-4 text-right border-r border-slate-300">Adjusted Rate %</th>
                  <th className="py-2.5 px-4 text-right">Loss Allowance (ECL) (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bucketSummaries.map((b) => (
                  <tr key={b.bucket}>
                    <td className="py-2 px-4 font-medium border-r border-slate-300">{b.bucket}</td>
                    <td className="py-2 px-4 text-right font-mono tabular-nums border-r border-slate-300">
                      {formatINR(b.grossReceivable)}
                    </td>
                    <td className="py-2 px-4 text-right font-mono tabular-nums border-r border-slate-300 text-slate-600">
                      {formatPercent(b.histRatePercent)}
                    </td>
                    <td className="py-2 px-4 text-right font-mono tabular-nums border-r border-slate-300 font-semibold text-slate-800">
                      {formatPercent(b.adjRatePercent)}
                    </td>
                    <td className="py-2 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      {formatINR(b.ecl)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                  <td className="py-2.5 px-4 uppercase tracking-wider border-r border-slate-300">Total</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums border-r border-slate-300">
                    {formatINR(totals.totalGrossReceivable)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono border-r border-slate-300 text-slate-400">—</td>
                  <td className="py-2.5 px-4 text-right font-mono border-r border-slate-300 text-slate-400">
                    {formatPercent(totals.eclPercentage)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-950">
                    {formatINR(totals.totalEcl)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Section 6: Management Judgement & Estimation Uncertainties */}
        <div className="space-y-2">
          <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            6. Critical Accounting Estimates and Management Judgement
          </h4>
          <p className="text-justify text-slate-700 text-xs sm:text-sm">
            The calculation of expected credit loss requires significant management judgment regarding the selection
            of historical observational windows, debtor portfolio segmentation, evaluation of macroeconomic forecasts,
            and counterparty credit standing. Management actively monitors realization patterns subsequent to the balance
            sheet date and tests for individual specific impairment on accounts showing clear indicators of financial distress.
          </p>
        </div>
      </div>
    </div>
  );
};
