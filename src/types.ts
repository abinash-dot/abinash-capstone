export type AgeBucket = 'Current' | '1–30' | '31–60' | '61–90' | '91–180' | 'Above 180';

export type EconomicOutlook = 'Optimistic' | 'Base' | 'Pessimistic';

export interface HistoricalRate {
  bucket: AgeBucket;
  ratePercent: number; // e.g. 0.20 for 0.20%
}

export interface InvoiceRecord {
  id: string;
  customer: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  outstandingAmount: number;
  daysOutstanding?: number;
  segment?: string;
}

export interface ComputedInvoiceRow extends InvoiceRecord {
  calculatedDays: number;
  bucket: AgeBucket;
  histRatePercent: number;
  multiplier: number;
  adjRatePercent: number;
  ecl: number;
  validationFlags: string[];
}

export interface BucketSummary {
  bucket: AgeBucket;
  grossReceivable: number;
  histRatePercent: number;
  adjRatePercent: number;
  ecl: number;
  count: number;
  percentOfTotalGross: number;
}

export interface ValidationIssue {
  id: string;
  rowNumber?: number;
  invoiceNo?: string;
  customer?: string;
  type: 'Negative receivable' | 'Duplicate invoice' | 'Missing due date' | 'Non-numeric amount' | 'Blank customer' | 'Warning';
  severity: 'error' | 'warning' | 'info';
  message: string;
  originalData?: any;
}

export interface AuditSignOff {
  preparedBy: string;
  preparedByDesignation: string;
  preparedDate: string;
  reviewedBy: string;
  reviewedByDesignation: string;
  reviewedDate: string;
  partnerSignOff: string;
  partnerDate: string;
  auditStatus: 'Draft' | 'Under Review' | 'Queries Raised' | 'Approved & Signed';
  auditFirmName: string;
  engagementCode: string;
  workingPaperRef: string;
  reviewNotes: string;
}

export interface EclTotals {
  totalGrossReceivable: number;
  totalEcl: number;
  eclPercentage: number;
  largestDefaultExposure: {
    customer: string;
    invoiceNo: string;
    amount: number;
    ecl: number;
  } | null;
  highestAgeingBucket: {
    bucket: AgeBucket;
    grossAmount: number;
    eclAmount: number;
  } | null;
  recommendedAction: string;
}
