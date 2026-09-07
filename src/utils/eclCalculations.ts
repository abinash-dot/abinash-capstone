import {
  AgeBucket,
  EconomicOutlook,
  InvoiceRecord,
  ComputedInvoiceRow,
  BucketSummary,
  ValidationIssue,
  EclTotals,
} from '../types';
import { OUTLOOK_MULTIPLIERS } from '../data/sampleData';

export const ALL_BUCKETS: AgeBucket[] = [
  'Current',
  '1–30',
  '31–60',
  '61–90',
  '91–180',
  'Above 180',
];

/**
 * Parses date string in multiple formats (YYYY-MM-DD, DD-MMM-YYYY, DD/MM/YYYY, etc.)
 */
export function parseAnyDate(dateStr: string | undefined): Date | null {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return null;
  }
  const clean = dateStr.trim();

  // Try standard ISO
  const isoDate = new Date(clean);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Check format like 15-Apr-2026 or 15-April-2026
  const parts = clean.split(/[-/.\s]+/);
  if (parts.length === 3) {
    const monthNames: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      january: 0, february: 1, march: 2, april: 3, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    };

    // Check if parts[1] is month name
    const mStr = parts[1].toLowerCase();
    if (mStr in monthNames) {
      const day = parseInt(parts[0], 10);
      const month = monthNames[mStr];
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }

    // Check if parts[0] is year (YYYY-MM-DD)
    if (parts[0].length === 4) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return new Date(y, m, d);
    }

    // Check if DD-MM-YYYY
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }

  return null;
}

/**
 * Calculates days outstanding from Due Date relative to Reporting Date
 */
export function calculateDaysFromDueDate(dueDateStr: string, reportingDateStr: string): number | null {
  const due = parseAnyDate(dueDateStr);
  const rep = parseAnyDate(reportingDateStr);
  if (!due || !rep) return null;

  // Difference in milliseconds
  const diffTime = rep.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Maps days outstanding to Ind AS 109 Ageing Bucket:
 * Current: Days <= 0
 * 1–30
 * 31–60
 * 61–90
 * 91–180
 * Above 180
 */
export function getBucketForDays(days: number): AgeBucket {
  if (days <= 0) return 'Current';
  if (days <= 30) return '1–30';
  if (days <= 60) return '31–60';
  if (days <= 90) return '61–90';
  if (days <= 180) return '91–180';
  return 'Above 180';
}

/**
 * Validates invoice dataset according to standard rules:
 * - Negative receivable -> Flag error
 * - Duplicate invoice -> Highlight
 * - Missing due date -> Report
 * - Non-numeric amount -> Reject / flag
 * - Blank customer -> Flag
 */
export function validateInvoices(
  invoices: InvoiceRecord[],
  reportingDate: string
): { issues: ValidationIssue[]; duplicateInvoiceSet: Set<string> } {
  const issues: ValidationIssue[] = [];
  const invoiceCounts = new Map<string, number>();

  // First pass: count invoice numbers to find duplicates
  invoices.forEach((inv) => {
    const invNo = (inv.invoiceNo || '').trim().toUpperCase();
    if (invNo) {
      invoiceCounts.set(invNo, (invoiceCounts.get(invNo) || 0) + 1);
    }
  });

  const duplicateInvoiceSet = new Set<string>();
  invoiceCounts.forEach((count, no) => {
    if (count > 1) {
      duplicateInvoiceSet.add(no);
    }
  });

  // Second pass: inspect each row
  invoices.forEach((inv, idx) => {
    const rowNum = idx + 1;
    const invNoClean = (inv.invoiceNo || '').trim().toUpperCase();

    // 1. Blank customer
    if (!inv.customer || !inv.customer.trim()) {
      issues.push({
        id: `blank-cust-${rowNum}`,
        rowNumber: rowNum,
        invoiceNo: inv.invoiceNo || 'N/A',
        customer: 'BLANK',
        type: 'Blank customer',
        severity: 'warning',
        message: `Row #${rowNum}: Customer name is blank or missing.`,
        originalData: inv,
      });
    }

    // 2. Duplicate invoice
    if (invNoClean && duplicateInvoiceSet.has(invNoClean)) {
      issues.push({
        id: `dup-inv-${rowNum}-${invNoClean}`,
        rowNumber: rowNum,
        invoiceNo: inv.invoiceNo,
        customer: inv.customer,
        type: 'Duplicate invoice',
        severity: 'warning',
        message: `Row #${rowNum}: Duplicate invoice number "${inv.invoiceNo}" found in dataset (${invoiceCounts.get(invNoClean)} occurrences).`,
        originalData: inv,
      });
    }

    // 3. Non-numeric amount
    const amtNum = Number(inv.outstandingAmount);
    if (isNaN(amtNum) || inv.outstandingAmount === null || inv.outstandingAmount === undefined) {
      issues.push({
        id: `nan-amt-${rowNum}`,
        rowNumber: rowNum,
        invoiceNo: inv.invoiceNo,
        customer: inv.customer,
        type: 'Non-numeric amount',
        severity: 'error',
        message: `Row #${rowNum}: Outstanding amount is non-numeric or empty ("${inv.outstandingAmount}").`,
        originalData: inv,
      });
    } else if (amtNum < 0) {
      // 4. Negative receivable
      issues.push({
        id: `neg-amt-${rowNum}`,
        rowNumber: rowNum,
        invoiceNo: inv.invoiceNo,
        customer: inv.customer,
        type: 'Negative receivable',
        severity: 'error',
        message: `Row #${rowNum}: Negative outstanding receivable (₹${Math.abs(amtNum).toLocaleString('en-IN')}). Verify if this is an unadjusted credit note or advance payment.`,
        originalData: inv,
      });
    }

    // 5. Missing due date
    if (!inv.dueDate || !inv.dueDate.trim()) {
      // Check if daysOutstanding is given
      if (inv.daysOutstanding === undefined || inv.daysOutstanding === null) {
        issues.push({
          id: `missing-due-${rowNum}`,
          rowNumber: rowNum,
          invoiceNo: inv.invoiceNo,
          customer: inv.customer,
          type: 'Missing due date',
          severity: 'error',
          message: `Row #${rowNum}: Missing Due Date and no Days Outstanding provided. Unable to determine ageing bucket without assumptions.`,
          originalData: inv,
        });
      } else {
        issues.push({
          id: `missing-due-has-days-${rowNum}`,
          rowNumber: rowNum,
          invoiceNo: inv.invoiceNo,
          customer: inv.customer,
          type: 'Missing due date',
          severity: 'info',
          message: `Row #${rowNum}: Missing Due Date, but explicit Days Outstanding (${inv.daysOutstanding} days) was provided.`,
          originalData: inv,
        });
      }
    }
  });

  return { issues, duplicateInvoiceSet };
}

/**
 * Computes detailed row-level ECL for each invoice
 */
export function computeEclRows(
  invoices: InvoiceRecord[],
  reportingDate: string,
  historicalRates: Record<string, number>,
  outlook: EconomicOutlook,
  duplicateInvoiceSet: Set<string>
): ComputedInvoiceRow[] {
  const multiplier = OUTLOOK_MULTIPLIERS[outlook] || 1.0;

  return invoices.map((inv) => {
    let days = 0;

    // "If Days Outstanding is blank, calculate it from Due Date using Reporting Date"
    if (inv.daysOutstanding !== undefined && inv.daysOutstanding !== null && !isNaN(Number(inv.daysOutstanding))) {
      days = Number(inv.daysOutstanding);
    } else if (inv.dueDate) {
      const calc = calculateDaysFromDueDate(inv.dueDate, reportingDate);
      days = calc !== null ? calc : 0;
    }

    const bucket = getBucketForDays(days);
    const histRatePercent = historicalRates[bucket] ?? 0;
    const adjRatePercent = Number((histRatePercent * multiplier).toFixed(4));
    
    // ECL = Outstanding Amount × Adjusted Default Rate. Round to nearest Rupee.
    const rawAmt = Number(inv.outstandingAmount) || 0;
    // For negative amounts, standard practice is 0 ECL or flag; calculate on positive exposure
    const effectiveAmt = rawAmt > 0 ? rawAmt : 0;
    const ecl = Math.round(effectiveAmt * (adjRatePercent / 100));

    // Flags
    const flags: string[] = [];
    if (!inv.customer || !inv.customer.trim()) flags.push('Blank Customer');
    if (rawAmt < 0) flags.push('Negative Receivable');
    if (isNaN(Number(inv.outstandingAmount))) flags.push('Non-numeric');
    if (!inv.dueDate && inv.daysOutstanding === undefined) flags.push('Missing Due Date');
    const invNoClean = (inv.invoiceNo || '').trim().toUpperCase();
    if (invNoClean && duplicateInvoiceSet.has(invNoClean)) flags.push('Duplicate Invoice');

    return {
      ...inv,
      calculatedDays: days,
      bucket,
      histRatePercent,
      multiplier,
      adjRatePercent,
      ecl,
      validationFlags: flags,
    };
  });
}

/**
 * Computes Bucket Summary Table:
 * Bucket | Gross Receivable | ECL
 */
export function computeBucketSummaries(
  computedRows: ComputedInvoiceRow[],
  historicalRates: Record<string, number>,
  outlook: EconomicOutlook
): BucketSummary[] {
  const multiplier = OUTLOOK_MULTIPLIERS[outlook] || 1.0;

  const totalGross = computedRows.reduce((sum, r) => sum + (r.outstandingAmount || 0), 0);

  return ALL_BUCKETS.map((bucket) => {
    const rowsInBucket = computedRows.filter((r) => r.bucket === bucket);
    const gross = rowsInBucket.reduce((sum, r) => sum + (r.outstandingAmount || 0), 0);
    const ecl = rowsInBucket.reduce((sum, r) => sum + r.ecl, 0);
    const histRate = historicalRates[bucket] ?? 0;
    const adjRate = Number((histRate * multiplier).toFixed(4));
    const percentOfTotal = totalGross > 0 ? (gross / totalGross) * 100 : 0;

    return {
      bucket,
      grossReceivable: gross,
      histRatePercent: histRate,
      adjRatePercent: adjRate,
      ecl,
      count: rowsInBucket.length,
      percentOfTotalGross: percentOfTotal,
    };
  });
}

/**
 * Computes Key Stats and Final CA Summary
 */
export function computeEclTotals(
  computedRows: ComputedInvoiceRow[],
  bucketSummaries: BucketSummary[]
): EclTotals {
  const totalGrossReceivable = computedRows.reduce((sum, r) => sum + (r.outstandingAmount || 0), 0);
  const totalEcl = computedRows.reduce((sum, r) => sum + r.ecl, 0);
  const eclPercentage = totalGrossReceivable > 0 ? (totalEcl / totalGrossReceivable) * 100 : 0;

  // Largest default exposure (by individual ECL)
  let largestDefaultExposure: EclTotals['largestDefaultExposure'] = null;
  if (computedRows.length > 0) {
    const sortedByEcl = [...computedRows].sort((a, b) => b.ecl - a.ecl);
    if (sortedByEcl[0] && sortedByEcl[0].ecl > 0) {
      largestDefaultExposure = {
        customer: sortedByEcl[0].customer || 'Unknown',
        invoiceNo: sortedByEcl[0].invoiceNo || 'N/A',
        amount: sortedByEcl[0].outstandingAmount,
        ecl: sortedByEcl[0].ecl,
      };
    }
  }

  // Highest ageing bucket by gross outstanding
  let highestAgeingBucket: EclTotals['highestAgeingBucket'] = null;
  const sortedBuckets = [...bucketSummaries].sort((a, b) => b.grossReceivable - a.grossReceivable);
  if (sortedBuckets[0] && sortedBuckets[0].grossReceivable > 0) {
    highestAgeingBucket = {
      bucket: sortedBuckets[0].bucket,
      grossAmount: sortedBuckets[0].grossReceivable,
      eclAmount: sortedBuckets[0].ecl,
    };
  }

  // Actionable CA recommendation
  let recommendedAction = '';
  const highRiskGross = (bucketSummaries.find(b => b.bucket === 'Above 180')?.grossReceivable || 0) +
                         (bucketSummaries.find(b => b.bucket === '91–180')?.grossReceivable || 0);
  const highRiskPercent = totalGrossReceivable > 0 ? (highRiskGross / totalGrossReceivable) * 100 : 0;

  if (highRiskPercent > 35) {
    recommendedAction = `Immediate recovery and legal notice protocol required: ${highRiskPercent.toFixed(1)}% of total receivables sit beyond 90 days overdue. Recommend halting fresh credit limits for defaulting accounts and initiating formal reconciliation.`;
  } else if (eclPercentage > 10) {
    recommendedAction = `Review credit underwriting and customer credit terms: Overall portfolio ECL stands at ${eclPercentage.toFixed(2)}%. Focus on top exposures in the >90 days bucket to prevent migration to default status.`;
  } else {
    recommendedAction = `Portfolio credit risk remains within standard operating tolerances. Maintain periodic monitoring of 61-90 day bucket transitions and ensure timely collection follow-ups.`;
  }

  return {
    totalGrossReceivable,
    totalEcl,
    eclPercentage,
    largestDefaultExposure,
    highestAgeingBucket,
    recommendedAction,
  };
}

/**
 * Format Indian Rupee currency with standard Indian Numbering system (e.g. ₹ 1,91,985)
 */
export function formatINR(val: number): string {
  if (val === null || val === undefined || isNaN(val)) return '₹ 0';
  const rounded = Math.round(val);
  return `₹ ${rounded.toLocaleString('en-IN')}`;
}

export function formatPercent(val: number, decimals: number = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '0.00%';
  return `${val.toFixed(decimals)}%`;
}
