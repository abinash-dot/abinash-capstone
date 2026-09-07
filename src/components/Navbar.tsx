import React from 'react';
import {
  FileSpreadsheet,
  Upload,
  Printer,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  TrendingUp,
  Calendar,
  Building2,
  Download,
} from 'lucide-react';
import { EconomicOutlook } from '../types';

interface NavbarProps {
  reportingDate: string;
  onReportingDateChange: (newDate: string) => void;
  outlook: EconomicOutlook;
  onOutlookChange: (newOutlook: EconomicOutlook) => void;
  onOpenUpload: () => void;
  onOpenAddModal: () => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
  onResetPromptData: () => void;
  onLoadBenchmarkData: () => void;
  validationIssueCount: number;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  reportingDate,
  onReportingDateChange,
  outlook,
  onOutlookChange,
  onOpenUpload,
  onOpenAddModal,
  onExportExcel,
  onExportCsv,
  onResetPromptData,
  onLoadBenchmarkData,
  validationIssueCount,
  activeTab,
  onTabChange,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: 'summary', label: 'Executive Summary & ECL' },
    { id: 'detail', label: 'Required Output Table (Matrix)' },
    { id: 'rates', label: 'Ageing & Default Rates' },
    { id: 'validations', label: 'Data Validation', badge: validationIssueCount },
    { id: 'disclosure', label: 'Ind AS 109 Disclosures' },
    { id: 'audit_wp', label: 'Audit Working Paper (A-F)' },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Authority */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                ECL-Pro
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ind AS 109
                </span>
              </h1>
              <span className="hidden sm:inline-block text-xs text-slate-400">|</span>
              <span className="hidden sm:inline-block text-xs text-slate-300 font-medium">
                Simplified Approach • Trade Receivables
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Chartered Accountant & Financial Instruments Working Paper Engine
            </p>
          </div>
        </div>

        {/* Global Controls: Reporting Date & Economic Outlook */}
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          {/* Reporting Date selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Reporting Date:</span>
            <input
              type="date"
              value={reportingDate}
              onChange={(e) => onReportingDateChange(e.target.value)}
              className="bg-slate-900 text-white text-xs font-mono rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
              title="Reporting Date (Default: 31-Mar-2027)"
            />
          </div>

          {/* Economic Outlook Selector: Ask only one question */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg p-1 text-xs">
            <div className="flex items-center gap-1 px-1.5 text-slate-300 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Economic Outlook:</span>
            </div>
            <div className="flex items-center bg-slate-900 rounded border border-slate-700 p-0.5">
              {(['Optimistic', 'Base', 'Pessimistic'] as EconomicOutlook[]).map((opt) => {
                const isSelected = outlook === opt;
                const multiplier = opt === 'Optimistic' ? '×0.85' : opt === 'Base' ? '×1.00' : '×1.30';
                return (
                  <button
                    key={opt}
                    onClick={() => onOutlookChange(opt)}
                    className={`px-2 py-0.5 text-xs font-medium rounded transition-all flex items-center gap-1 ${
                      isSelected
                        ? opt === 'Optimistic'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : opt === 'Pessimistic'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{opt}</span>
                    <span className="text-[10px] opacity-80 font-mono">({multiplier})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shadow-sm"
              title="Upload Trade Receivables Excel (.xlsx) or CSV"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload File</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
              title="Add invoice manually"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Add Row</span>
            </button>

            <div className="relative group">
              <button
                onClick={onExportExcel}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
                title="Download complete Ind AS 109 working paper in Excel"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
              title="Print / Save Audit Working Paper as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 py-1.5">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        active ? 'bg-amber-500 text-slate-950' : 'bg-amber-900/60 text-amber-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Dataset Switcher */}
          <div className="hidden lg:flex items-center gap-2 text-xs py-1">
            <span className="text-slate-500 text-[11px]">Datasets:</span>
            <button
              onClick={onResetPromptData}
              className="text-xs text-slate-400 hover:text-emerald-400 underline decoration-slate-600 transition"
              title="Load the 5 sample invoices given in the prompt"
            >
              5 Sample Invoices
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={onLoadBenchmarkData}
              className="text-xs text-slate-400 hover:text-indigo-400 underline decoration-slate-600 transition"
              title="Load benchmark portfolio matching prompt's 19,10,000 / 1,91,985 illustration"
            >
              Full Ind AS Matrix (₹19.1L)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
