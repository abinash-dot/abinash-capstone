import { HistoricalRate, InvoiceRecord, AuditSignOff } from '../types';

export const DEFAULT_REPORTING_DATE = '2027-03-31';

export const DEFAULT_HISTORICAL_RATES: Record<string, number> = {
  'Current': 0.20,
  '1–30': 0.80,
  '31–60': 2.10,
  '61–90': 4.50,
  '91–180': 9.00,
  'Above 180': 22.00,
};

export const OUTLOOK_MULTIPLIERS = {
  Optimistic: 0.85,
  Base: 1.00,
  Pessimistic: 1.30,
};

export const SAMPLE_INVOICES_PROMPT: InvoiceRecord[] = [
  {
    id: 'row-1',
    customer: 'ABC Ltd',
    invoiceNo: 'INV001',
    invoiceDate: '2026-04-15',
    dueDate: '2026-05-15',
    outstandingAmount: 250000,
    daysOutstanding: 35,
    segment: 'Corporate',
  },
  {
    id: 'row-2',
    customer: 'XYZ Pvt',
    invoiceNo: 'INV002',
    invoiceDate: '2026-03-01',
    dueDate: '2026-03-31',
    outstandingAmount: 180000,
    daysOutstanding: 72,
    segment: 'SME',
  },
  {
    id: 'row-3',
    customer: 'PQR Ltd',
    invoiceNo: 'INV003',
    invoiceDate: '2026-01-20',
    dueDate: '2026-02-19',
    outstandingAmount: 425000,
    daysOutstanding: 165,
    segment: 'Corporate',
  },
  {
    id: 'row-4',
    customer: 'LMN LLP',
    invoiceNo: 'INV004',
    invoiceDate: '2026-02-05',
    dueDate: '2026-03-07',
    outstandingAmount: 95000,
    daysOutstanding: 92,
    segment: 'Retail',
  },
  {
    id: 'row-5',
    customer: 'DEF Ltd',
    invoiceNo: 'INV005',
    invoiceDate: '2025-12-10',
    dueDate: '2026-01-09',
    outstandingAmount: 640000,
    daysOutstanding: 240,
    segment: 'Corporate',
  },
];

// Comprehensive benchmark dataset matching the exact bucket totals from the Ind AS 109 prompt illustration
export const BENCHMARK_FULL_DATASET: InvoiceRecord[] = [
  {
    id: 'bm-1',
    customer: 'TATA Steel Solutions Ltd',
    invoiceNo: 'INV-2027-010',
    invoiceDate: '2027-03-10',
    dueDate: '2027-04-10',
    outstandingAmount: 250000,
    daysOutstanding: 0, // Current bucket (<= 0)
    segment: 'Corporate',
  },
  {
    id: 'bm-2',
    customer: 'Zenith Logistics LLP',
    invoiceNo: 'INV-2027-044',
    invoiceDate: '2027-02-15',
    dueDate: '2027-03-15',
    outstandingAmount: 180000,
    daysOutstanding: 16, // 1–30 bucket
    segment: 'SME',
  },
  {
    id: 'bm-3',
    customer: 'Apex Healthcare Pvt Ltd',
    invoiceNo: 'INV-2027-078',
    invoiceDate: '2027-01-10',
    dueDate: '2027-02-10',
    outstandingAmount: 320000,
    daysOutstanding: 49, // 31–60 bucket
    segment: 'Corporate',
  },
  {
    id: 'bm-4',
    customer: 'Aura Consumer Brands',
    invoiceNo: 'INV-2026-112',
    invoiceDate: '2026-11-28',
    dueDate: '2026-12-28',
    outstandingAmount: 95000,
    daysOutstanding: 83, // 61–90 bucket
    segment: 'Retail',
  },
  {
    id: 'bm-5',
    customer: 'Nova Infra Projects Ltd',
    invoiceNo: 'INV-2026-190',
    invoiceDate: '2026-09-15',
    dueDate: '2026-10-15',
    outstandingAmount: 425000,
    daysOutstanding: 167, // 91–180 bucket
    segment: 'Corporate',
  },
  {
    id: 'bm-6',
    customer: 'Sterling Heavy Engineering',
    invoiceNo: 'INV-2026-231',
    invoiceDate: '2026-05-20',
    dueDate: '2026-06-20',
    outstandingAmount: 640000,
    daysOutstanding: 284, // Above 180 bucket
    segment: 'Corporate',
  },
];

export const INITIAL_AUDIT_SIGNOFF: AuditSignOff = {
  preparedBy: 'CA. Abinash K. (ACA, DISA)',
  preparedByDesignation: 'Senior Manager - Financial Instruments & Ind AS',
  preparedDate: '2027-04-12',
  reviewedBy: 'CA. R. Sundaram (FCA)',
  reviewedByDesignation: 'Audit Director / Technical Quality Reviewer',
  reviewedDate: '2027-04-15',
  partnerSignOff: 'CA. M. V. Ramanathan (Senior Partner)',
  partnerDate: '2027-04-18',
  auditStatus: 'Approved & Signed',
  auditFirmName: 'Sundaram, Ramanathan & Associates, Chartered Accountants (FRN: 004812S)',
  engagementCode: 'ENG/2026-27/INDAS109/TR-04',
  workingPaperRef: 'WP-INDAS109-TR-ECL-FY27',
  reviewNotes: 'Verified calculation mechanics of simplified approach provision matrix. Sample ageing verified against sales ledger and bank realization statements subsequent to reporting date. Forward-looking macroeconomic coefficient of 1.00 (Base Scenario) approved based on monetary policy and industry recovery index.',
};
