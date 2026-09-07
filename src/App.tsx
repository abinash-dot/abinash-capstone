import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { DetailedEclTable } from './components/DetailedEclTable';
import { RateMatrixView } from './components/RateMatrixView';
import { ValidationExceptions } from './components/ValidationExceptions';
import { StatutoryDisclosure } from './components/StatutoryDisclosure';
import { AuditWorkingPaperView } from './components/AuditWorkingPaperView';
import { FileUploadModal } from './components/FileUploadModal';
import { AddInvoiceModal } from './components/AddInvoiceModal';
import {
  SAMPLE_INVOICES_PROMPT,
  BENCHMARK_FULL_DATASET,
  DEFAULT_HISTORICAL_RATES,
  DEFAULT_REPORTING_DATE,
  INITIAL_AUDIT_SIGNOFF,
} from './data/sampleData';
import {
  InvoiceRecord,
  EconomicOutlook,
  AgeBucket,
  AuditSignOff,
} from './types';
import {
  validateInvoices,
  computeEclRows,
  computeBucketSummaries,
  computeEclTotals,
} from './utils/eclCalculations';
import { exportToExcel, exportCsvDetailedMatrix } from './utils/excelExport';

export default function App() {
  // State initialization
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(SAMPLE_INVOICES_PROMPT);
  const [reportingDate, setReportingDate] = useState<string>(DEFAULT_REPORTING_DATE);
  const [outlook, setOutlook] = useState<EconomicOutlook>('Base');
  const [historicalRates, setHistoricalRates] = useState<Record<string, number>>(DEFAULT_HISTORICAL_RATES);
  const [signOff, setSignOff] = useState<AuditSignOff>(INITIAL_AUDIT_SIGNOFF);
  const [activeTab, setActiveTab] = useState<string>('summary');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 1. Data Validation
  const { issues: validationIssues, duplicateInvoiceSet } = useMemo(() => {
    return validateInvoices(invoices, reportingDate);
  }, [invoices, reportingDate]);

  // 2. Compute Row-Level ECL
  const computedRows = useMemo(() => {
    return computeEclRows(invoices, reportingDate, historicalRates, outlook, duplicateInvoiceSet);
  }, [invoices, reportingDate, historicalRates, outlook, duplicateInvoiceSet]);

  // 3. Compute Bucket Summaries
  const bucketSummaries = useMemo(() => {
    return computeBucketSummaries(computedRows, historicalRates, outlook);
  }, [computedRows, historicalRates, outlook]);

  // 4. Compute Final Totals and Key CA Metrics
  const totals = useMemo(() => {
    return computeEclTotals(computedRows, bucketSummaries);
  }, [computedRows, bucketSummaries]);

  // Quick lookup for bucket gross amounts (used in sensitivity calculations)
  const bucketGrossAmounts = useMemo(() => {
    const map: Record<string, number> = {};
    bucketSummaries.forEach((b) => {
      map[b.bucket] = b.grossReceivable;
    });
    return map;
  }, [bucketSummaries]);

  // Handlers
  const handleAddInvoice = (newInv: InvoiceRecord) => {
    setInvoices((prev) => [newInv, ...prev]);
  };

  const handleDeleteRow = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDataLoaded = (newInvoices: InvoiceRecord[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setInvoices(newInvoices);
    } else {
      setInvoices((prev) => [...prev, ...newInvoices]);
    }
  };

  const handleUpdateHistoricalRate = (bucket: AgeBucket, newRate: number) => {
    setHistoricalRates((prev) => ({
      ...prev,
      [bucket]: newRate,
    }));
  };

  const handleResetRates = () => {
    setHistoricalRates(DEFAULT_HISTORICAL_RATES);
  };

  const handleResetPromptData = () => {
    setInvoices(SAMPLE_INVOICES_PROMPT);
    setOutlook('Base');
    setReportingDate(DEFAULT_REPORTING_DATE);
    setHistoricalRates(DEFAULT_HISTORICAL_RATES);
  };

  const handleLoadBenchmarkData = () => {
    setInvoices(BENCHMARK_FULL_DATASET);
    setOutlook('Base');
    setReportingDate(DEFAULT_REPORTING_DATE);
    setHistoricalRates(DEFAULT_HISTORICAL_RATES);
  };

  const handleExportExcel = () => {
    exportToExcel(
      computedRows,
      bucketSummaries,
      totals,
      outlook,
      reportingDate,
      signOff,
      validationIssues
    );
  };

  const handleExportCsv = () => {
    exportCsvDetailedMatrix(computedRows, totals);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Navigation and Top Controls */}
      <Navbar
        reportingDate={reportingDate}
        onReportingDateChange={setReportingDate}
        outlook={outlook}
        onOutlookChange={setOutlook}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        onResetPromptData={handleResetPromptData}
        onLoadBenchmarkData={handleLoadBenchmarkData}
        validationIssueCount={validationIssues.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'summary' && (
          <ExecutiveSummary
            totals={totals}
            bucketSummaries={bucketSummaries}
            outlook={outlook}
            reportingDate={reportingDate}
            onViewDetailedTable={() => setActiveTab('detail')}
            onViewValidation={() => setActiveTab('validations')}
            validationIssueCount={validationIssues.length}
          />
        )}

        {activeTab === 'detail' && (
          <DetailedEclTable
            computedRows={computedRows}
            totals={totals}
            onDeleteRow={handleDeleteRow}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === 'rates' && (
          <RateMatrixView
            historicalRates={historicalRates}
            onUpdateHistoricalRate={handleUpdateHistoricalRate}
            onResetRates={handleResetRates}
            outlook={outlook}
            onOutlookChange={setOutlook}
            totalGrossReceivable={totals.totalGrossReceivable}
            bucketGrossAmounts={bucketGrossAmounts}
          />
        )}

        {activeTab === 'validations' && (
          <ValidationExceptions
            issues={validationIssues}
            totalRecordsCount={invoices.length}
          />
        )}

        {activeTab === 'disclosure' && (
          <StatutoryDisclosure
            totals={totals}
            bucketSummaries={bucketSummaries}
            outlook={outlook}
            reportingDate={reportingDate}
          />
        )}

        {activeTab === 'audit_wp' && (
          <AuditWorkingPaperView
            signOff={signOff}
            onUpdateSignOff={setSignOff}
            totals={totals}
            bucketSummaries={bucketSummaries}
            outlook={outlook}
            reportingDate={reportingDate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">ECL-Pro</span>
            <span>• Ind AS 109 Financial Instruments (Simplified Approach)</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Working Paper Ref: {signOff.workingPaperRef} | Engagement: {signOff.engagementCode}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
        reportingDate={reportingDate}
      />

      <AddInvoiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddInvoice={handleAddInvoice}
        reportingDate={reportingDate}
      />
    </div>
  );
}
