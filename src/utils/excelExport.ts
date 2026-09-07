import * as XLSX from 'xlsx';
import { ComputedInvoiceRow, BucketSummary, EclTotals, AuditSignOff, ValidationIssue, EconomicOutlook } from '../types';

export function exportToExcel(
  computedRows: ComputedInvoiceRow[],
  bucketSummaries: BucketSummary[],
  totals: EclTotals,
  outlook: EconomicOutlook,
  reportingDate: string,
  signOff: AuditSignOff,
  validationIssues: ValidationIssue[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: ECL Summary & Buckets
  const summaryData = [
    ['ECL-PRO: IND AS 109 EXPECTED CREDIT LOSS WORKING PAPER', ''],
    ['Entity Name / Client:', signOff.auditFirmName ? 'Client Trade Receivables Portfolio' : 'Company Portfolio'],
    ['Reporting Date:', reportingDate],
    ['Economic Outlook Selected:', outlook],
    ['Working Paper Reference:', signOff.workingPaperRef],
    ['Audit Status:', signOff.auditStatus],
    [],
    ['EXECUTIVE SUMMARY TOTALS', ''],
    ['Total Trade Receivables (Gross):', totals.totalGrossReceivable],
    ['Total Loss Allowance (ECL):', totals.totalEcl],
    ['Portfolio ECL %:', `${totals.eclPercentage.toFixed(2)}%`],
    ['Largest Single ECL Exposure:', totals.largestDefaultExposure ? `${totals.largestDefaultExposure.customer} (₹${totals.largestDefaultExposure.ecl.toLocaleString('en-IN')})` : 'N/A'],
    ['Highest Ageing Bucket by Gross:', totals.highestAgeingBucket ? `${totals.highestAgeingBucket.bucket} (₹${totals.highestAgeingBucket.grossAmount.toLocaleString('en-IN')})` : 'N/A'],
    [],
    ['AGEING BUCKET SUMMARY (IND AS 109 PROVISION MATRIX)', '', '', '', ''],
    ['Bucket', 'Gross Receivable (₹)', 'Hist Default %', 'Adj Default %', 'ECL Amount (₹)', '% of Gross'],
    ...bucketSummaries.map((b) => [
      b.bucket,
      b.grossReceivable,
      b.histRatePercent,
      b.adjRatePercent,
      b.ecl,
      `${b.percentOfTotalGross.toFixed(2)}%`,
    ]),
    ['TOTAL', totals.totalGrossReceivable, '-', '-', totals.totalEcl, '100.00%'],
    [],
    ['JOURNAL ENTRY (IND AS 109 IMPAIRMENT RECORDING)', ''],
    ['Debit:', 'Impairment Loss on Trade Receivables (P&L)', `₹ ${totals.totalEcl.toLocaleString('en-IN')}`],
    ['Credit:', 'Loss Allowance (ECL) - Contra Asset', `₹ ${totals.totalEcl.toLocaleString('en-IN')}`],
    ['Narration:', `Being provision for expected credit loss recognized under Ind AS 109 Simplified Approach for FY ending ${reportingDate}`],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'ECL_Summary');

  // 2. Sheet: Detailed Invoice Matrix (Exact required output table)
  const detailHeaders = [
    'Customer',
    'Outstanding',
    'Days',
    'Bucket',
    'Hist %',
    'Adj %',
    'ECL',
    'Invoice No',
    'Invoice Date',
    'Due Date',
    'Segment',
    'Audit Flags',
  ];

  const detailRows = computedRows.map((r) => [
    r.customer,
    r.outstandingAmount,
    r.calculatedDays,
    r.bucket,
    r.histRatePercent,
    r.adjRatePercent,
    r.ecl,
    r.invoiceNo,
    r.invoiceDate,
    r.dueDate,
    r.segment || '',
    r.validationFlags.join(', '),
  ]);

  // Add Totals row
  detailRows.push([
    'TOTAL',
    totals.totalGrossReceivable,
    '-',
    '-',
    '-',
    '-',
    totals.totalEcl,
    '',
    '',
    '',
    '',
    '',
  ]);

  const wsDetail = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Invoice_ECL_Matrix');

  // 3. Sheet: Data Validation Exceptions
  const valHeaders = ['Row #', 'Invoice No', 'Customer', 'Exception Type', 'Severity', 'Audit Message'];
  const valRows = validationIssues.map((v) => [
    v.rowNumber || '-',
    v.invoiceNo || '-',
    v.customer || '-',
    v.type,
    v.severity.toUpperCase(),
    v.message,
  ]);
  if (valRows.length === 0) {
    valRows.push(['-', '-', '-', 'None', 'INFO', 'No validation exceptions detected in the dataset.']);
  }
  const wsValidation = XLSX.utils.aoa_to_sheet([valHeaders, ...valRows]);
  XLSX.utils.book_append_sheet(wb, wsValidation, 'Validation_Exceptions');

  // 4. Sheet: Audit Working Paper & Sign-off
  const auditData = [
    ['AUDIT WORKING PAPER: IMPAIRMENT OF TRADE RECEIVABLES (IND AS 109)', ''],
    ['Working Paper Ref:', signOff.workingPaperRef],
    ['Engagement Code:', signOff.engagementCode],
    ['Audit Firm:', signOff.auditFirmName],
    ['Status:', signOff.auditStatus],
    [],
    ['A. OBJECTIVE', 'To compute lifetime Expected Credit Loss (ECL) on trade receivables using the simplified approach prescribed under Ind AS 109.'],
    ['B. SOURCE OF DATA', 'Trade receivables ledger, sales invoices, ageing trial balance as at reporting date, and historical credit loss experience.'],
    ['C. METHODOLOGY', 'Application of a provision matrix categorized by past-due ageing intervals, calibrated with macroeconomic forward-looking factors.'],
    ['D. ASSUMPTIONS', 'Historical loss rates over the preceding 3-5 fiscal cycles adjusted for current and forecasted economic conditions.'],
    ['E. RISK ASSESSMENT', 'Credit concentration risk in aged buckets evaluated; counterparty solvency and historical settlement trends reviewed.'],
    ['F. CONCLUSION', `Total loss allowance of ₹${totals.totalEcl.toLocaleString('en-IN')} determined to be adequate and in compliance with Ind AS 109 requirements.`],
    [],
    ['SIGN-OFF & APPROVALS', ''],
    ['Prepared By:', `${signOff.preparedBy} (${signOff.preparedByDesignation})`, 'Date:', signOff.preparedDate],
    ['Reviewed By:', `${signOff.reviewedBy} (${signOff.reviewedByDesignation})`, 'Date:', signOff.reviewedDate],
    ['Engagement Partner Sign-off:', signOff.partnerSignOff, 'Date:', signOff.partnerDate],
    ['Reviewer Notes:', signOff.reviewNotes],
  ];
  const wsAudit = XLSX.utils.aoa_to_sheet(auditData);
  XLSX.utils.book_append_sheet(wb, wsAudit, 'Audit_WP_Signoff');

  // Write and trigger download
  const dateTag = reportingDate.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `ECL_Pro_Working_Paper_${dateTag}.xlsx`);
}

export function exportCsvDetailedMatrix(computedRows: ComputedInvoiceRow[], totals: EclTotals) {
  const headers = ['Customer', 'Outstanding', 'Days', 'Bucket', 'Hist %', 'Adj %', 'ECL', 'Invoice No', 'Due Date', 'Segment'];
  const rows = computedRows.map((r) => [
    `"${(r.customer || '').replace(/"/g, '""')}"`,
    r.outstandingAmount,
    r.calculatedDays,
    `"${r.bucket}"`,
    r.histRatePercent,
    r.adjRatePercent,
    r.ecl,
    `"${r.invoiceNo || ''}"`,
    `"${r.dueDate || ''}"`,
    `"${r.segment || ''}"`,
  ]);

  rows.push([
    '"TOTAL"',
    totals.totalGrossReceivable,
    '""',
    '""',
    '""',
    '""',
    totals.totalEcl,
    '""',
    '""',
    '""',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ECL_Matrix_IndAS109.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadSampleCsvTemplate() {
  const headers = ['Customer', 'Invoice No', 'Invoice Date', 'Due Date', 'Outstanding Amount', 'Days Outstanding', 'Segment'];
  const samples = [
    ['ABC Ltd', 'INV001', '15-Apr-2026', '15-May-2026', '250000', '35', 'Corporate'],
    ['XYZ Pvt', 'INV002', '01-Mar-2026', '31-Mar-2026', '180000', '72', 'SME'],
    ['PQR Ltd', 'INV003', '20-Jan-2026', '19-Feb-2026', '425000', '165', 'Corporate'],
    ['LMN LLP', 'INV004', '05-Feb-2026', '07-Mar-2026', '95000', '92', 'Retail'],
    ['DEF Ltd', 'INV005', '10-Dec-2025', '09-Jan-2026', '640000', '240', 'Corporate'],
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...samples.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ECL_Trade_Receivables_Template.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
