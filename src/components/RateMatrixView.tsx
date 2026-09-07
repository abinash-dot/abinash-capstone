import React, { useState } from 'react';
import {
  TrendingUp,
  RotateCcw,
  Sliders,
  CheckCircle,
  HelpCircle,
  BarChart3,
  Percent,
} from 'lucide-react';
import { AgeBucket, EconomicOutlook } from '../types';
import { ALL_BUCKETS, formatINR, formatPercent } from '../utils/eclCalculations';
import { DEFAULT_HISTORICAL_RATES, OUTLOOK_MULTIPLIERS } from '../data/sampleData';

interface RateMatrixViewProps {
  historicalRates: Record<string, number>;
  onUpdateHistoricalRate: (bucket: AgeBucket, newRate: number) => void;
  onResetRates: () => void;
  outlook: EconomicOutlook;
  onOutlookChange: (newOutlook: EconomicOutlook) => void;
  totalGrossReceivable: number;
  bucketGrossAmounts: Record<string, number>;
}

export const RateMatrixView: React.FC<RateMatrixViewProps> = ({
  historicalRates,
  onUpdateHistoricalRate,
  onResetRates,
  outlook,
  onOutlookChange,
  totalGrossReceivable,
  bucketGrossAmounts,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Compute total ECL for each of the 3 scenarios for sensitivity table
  const computeScenarioTotalEcl = (mult: number) => {
    return ALL_BUCKETS.reduce((sum, bucket) => {
      const gross = bucketGrossAmounts[bucket] || 0;
      const histRate = historicalRates[bucket] ?? 0;
      const adjRate = histRate * mult;
      const ecl = Math.round(gross * (adjRate / 100));
      return sum + ecl;
    }, 0);
  };

  const optimisticEcl = computeScenarioTotalEcl(OUTLOOK_MULTIPLIERS.Optimistic);
  const baseEcl = computeScenarioTotalEcl(OUTLOOK_MULTIPLIERS.Base);
  const pessimisticEcl = computeScenarioTotalEcl(OUTLOOK_MULTIPLIERS.Pessimistic);

  return (
    <div className="space-y-6">
      {/* HEADER EXPLANATION */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Ind AS 109 Provision Matrix & Forward-Looking Adjustments
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simplified approach default rate calibration as per Ind AS 109 Para B5.5.35
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
            >
              {isEditing ? 'Done Editing' : 'Customize Historical Rates'}
            </button>
            <button
              onClick={onResetRates}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
              title="Reset to Ind AS 109 sample benchmark rates"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* ECONOMIC OUTLOOK SELECTOR: Ask only one question */}
        <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Forward-Looking Macroeconomic Factor
              </span>
              <p className="text-xs text-slate-600">
                Select Economic Outlook to calibrate historical default rates:
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
              Active Multiplier: {OUTLOOK_MULTIPLIERS[outlook]}x
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['Optimistic', 'Base', 'Pessimistic'] as EconomicOutlook[]).map((opt) => {
              const isSelected = outlook === opt;
              const mult = OUTLOOK_MULTIPLIERS[opt];
              return (
                <div
                  key={opt}
                  onClick={() => onOutlookChange(opt)}
                  className={`cursor-pointer border rounded-lg p-3.5 transition-all ${
                    isSelected
                      ? opt === 'Optimistic'
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : opt === 'Pessimistic'
                        ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20'
                        : 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{opt}</span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Multiplier: ×{mult.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {opt === 'Optimistic' && 'Favorable credit cycle, declining default rates across industry sectors.'}
                    {opt === 'Base' && 'Stable macroeconomic trend mirroring historical baseline default rates.'}
                    {opt === 'Pessimistic' && 'Stressed macro outlook, tightening liquidity and heightened default risk.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MATRIX TABLE & SENSITIVITY TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Provision Matrix Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Provision Matrix (Historical Rate × Forward Multiplier)
            </h3>
            <p className="text-xs text-slate-500">
              Formula: Adjusted Default Rate = Historical Rate × {OUTLOOK_MULTIPLIERS[outlook]}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Age Bucket</th>
                  <th className="py-2.5 px-3">Days Range</th>
                  <th className="py-2.5 px-3 text-right">Historical Default %</th>
                  <th className="py-2.5 px-3 text-right">Multiplier</th>
                  <th className="py-2.5 px-4 text-right bg-indigo-50/50">Adjusted Default %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_BUCKETS.map((b) => {
                  const hist = historicalRates[b] ?? 0;
                  const mult = OUTLOOK_MULTIPLIERS[outlook];
                  const adj = Number((hist * mult).toFixed(4));
                  return (
                    <tr key={b} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {b}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {b === 'Current' && 'Days ≤ 0'}
                        {b === '1–30' && '1 to 30 days past due'}
                        {b === '31–60' && '31 to 60 days past due'}
                        {b === '61–90' && '61 to 90 days past due'}
                        {b === '91–180' && '91 to 180 days past due'}
                        {b === 'Above 180' && 'Days > 180 overdue'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            value={hist}
                            onChange={(e) =>
                              onUpdateHistoricalRate(b, parseFloat(e.target.value) || 0)
                            }
                            className="w-16 px-1 py-0.5 text-right font-mono text-xs border border-indigo-400 rounded focus:outline-none"
                          />
                        ) : (
                          <span className="text-slate-700 font-medium">{formatPercent(hist)}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                        ×{mult.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-indigo-700 bg-indigo-50/30">
                        {formatPercent(adj)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sensitivity Analysis (Optimistic vs Base vs Pessimistic) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Macroeconomic Sensitivity Analysis
              </h3>
              <p className="text-[11px] text-slate-400">
                P&L Impairment variance under alternative scenarios
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="p-4 space-y-3.5">
            {/* Base Scenario */}
            <div
              className={`p-3 rounded-lg border transition ${
                outlook === 'Base'
                  ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/30'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  Base Scenario (×1.00)
                  {outlook === 'Base' && (
                    <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100 px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  )}
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatINR(baseEcl)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>ECL Coverage:</span>
                <span className="font-mono">
                  {totalGrossReceivable > 0
                    ? `${((baseEcl / totalGrossReceivable) * 100).toFixed(2)}%`
                    : '0.00%'}
                </span>
              </div>
            </div>

            {/* Optimistic Scenario */}
            <div
              className={`p-3 rounded-lg border transition ${
                outlook === 'Optimistic'
                  ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  Optimistic Scenario (×0.85)
                  {outlook === 'Optimistic' && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  )}
                </span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {formatINR(optimisticEcl)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>Variance vs Base:</span>
                <span className="font-mono text-emerald-600 font-medium">
                  {formatINR(optimisticEcl - baseEcl)} ({(((optimisticEcl - baseEcl) / (baseEcl || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Pessimistic Scenario */}
            <div
              className={`p-3 rounded-lg border transition ${
                outlook === 'Pessimistic'
                  ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500/30'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  Pessimistic Scenario (×1.30)
                  {outlook === 'Pessimistic' && (
                    <span className="text-[10px] text-rose-700 font-bold bg-rose-100 px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  )}
                </span>
                <span className="font-mono font-bold text-rose-700 text-sm">
                  {formatINR(pessimisticEcl)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>Variance vs Base:</span>
                <span className="font-mono text-rose-600 font-medium">
                  +{formatINR(pessimisticEcl - baseEcl)} (+{(((pessimisticEcl - baseEcl) / (baseEcl || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
