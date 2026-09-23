export interface MasterOption {
  value: string;
  label: string;
  description?: string;
}

/** ---------------- Token Category master ---------------- */
/** Broad commercial intent of the token money */
export interface TokenCategoryMaster extends MasterOption {
  minAmount: number;
  defaultValidityDays: number;
  refundable: boolean;
  /** weight used in the priority/allotment engine */
  weight: number;
}

export const TOKEN_CATEGORIES: TokenCategoryMaster[] = [
  {
    value: 'pre_launch_eoi',
    label: 'Pre-Launch EOI',
    description: 'Interest registered before RERA launch / price declaration',
    minAmount: 100000,
    defaultValidityDays: 90,
    refundable: true,
    weight: 30,
  },
  {
    value: 'launch_eoi',
    label: 'Launch EOI',
    description: 'Interest registered during the launch window',
    minAmount: 200000,
    defaultValidityDays: 60,
    refundable: true,
    weight: 25,
  },
  {
    value: 'priority_eoi',
    label: 'Priority EOI',
    description: 'Higher token amount for first-right of unit selection',
    minAmount: 500000,
    defaultValidityDays: 45,
    refundable: true,
    weight: 40,
  },
  {
    value: 'nri_eoi',
    label: 'NRI / International EOI',
    description: 'EOI received from NRI or overseas prospects',
    minAmount: 300000,
    defaultValidityDays: 90,
    refundable: true,
    weight: 30,
  },
  {
    value: 'corporate_eoi',
    label: 'Corporate / Bulk EOI',
    description: 'Corporate tie-up or multi-unit bulk interest',
    minAmount: 1000000,
    defaultValidityDays: 60,
    refundable: true,
    weight: 35,
  },
  {
    value: 'loyalty_eoi',
    label: 'Loyalty / Existing Customer EOI',
    description: 'Repeat customer or referral-linked EOI',
    minAmount: 100000,
    defaultValidityDays: 90,
    refundable: true,
    weight: 35,
  },
];

/** ---------------- Token Type master ---------------- */
export interface TokenTypeMaster extends MasterOption {
  adjustable: boolean;
  weight: number;
}

export const TOKEN_TYPES: TokenTypeMaster[] = [
  {
    value: 'refundable_token',
    label: 'Refundable Token',
    description: 'Fully refundable if allotment is not confirmed',
    adjustable: true,
    weight: 10,
  },
  {
    value: 'non_refundable_token',
    label: 'Non-Refundable Token',
    description: 'Forfeited on withdrawal, highest commitment',
    adjustable: true,
    weight: 25,
  },
  {
    value: 'adjustable_booking_token',
    label: 'Adjustable Booking Token',
    description: 'Adjusted against booking amount on allotment',
    adjustable: true,
    weight: 20,
  },
  {
    value: 'cheque_token',
    label: 'Cheque / PDC Token',
    description: 'Token held as cheque, banked on allotment',
    adjustable: true,
    weight: 8,
  },
  {
    value: 'digital_token',
    label: 'Digital / Online Token',
    description: 'Collected through payment gateway or UPI',
    adjustable: true,
    weight: 12,
  },
  {
    value: 'channel_partner_token',
    label: 'Channel Partner Token',
    description: 'Collected and deposited by CP on behalf of prospect',
    adjustable: true,
    weight: 10,
  },
];

/** ---------------- Token Status master (controlled transitions) ---------------- */
export interface TokenStatusMaster extends MasterOption {
  /** statuses this status can move to */
  next: string[];
  terminal?: boolean;
  tone: 'neutral' | 'progress' | 'success' | 'warning' | 'danger';
}

export const TOKEN_STATUSES: TokenStatusMaster[] = [
  {
    value: 'draft',
    label: 'Draft',
    description: 'Token entry created, payment not yet received',
    next: ['payment_pending', 'cancelled'],
    tone: 'neutral',
  },
  {
    value: 'payment_pending',
    label: 'Payment Pending',
    description: 'Awaiting token amount / cheque realisation',
    next: ['received', 'cancelled', 'expired'],
    tone: 'warning',
  },
  {
    value: 'received',
    label: 'Token Received',
    description: 'Amount received and receipt issued',
    next: ['verified', 'refund_requested', 'cancelled'],
    tone: 'progress',
  },
  {
    value: 'verified',
    label: 'Verified',
    description: 'Payment verified by accounts, eligible for allotment',
    next: ['allotment_pending', 'refund_requested', 'cancelled'],
    tone: 'progress',
  },
  {
    value: 'allotment_pending',
    label: 'Allotment Pending',
    description: 'In the priority queue awaiting unit allotment',
    next: ['allotted', 'waitlisted', 'refund_requested'],
    tone: 'progress',
  },
  {
    value: 'waitlisted',
    label: 'Waitlisted',
    description: 'Eligible but no inventory in the chosen configuration',
    next: ['allotment_pending', 'allotted', 'refund_requested', 'expired'],
    tone: 'warning',
  },
  {
    value: 'allotted',
    label: 'Allotted',
    description: 'Unit allotted against this token',
    next: ['converted', 'refund_requested', 'cancelled'],
    tone: 'success',
  },
  {
    value: 'converted',
    label: 'Converted to Booking',
    description: 'Token adjusted into the booking amount',
    next: [],
    terminal: true,
    tone: 'success',
  },
  {
    value: 'refund_requested',
    label: 'Refund Requested',
    description: 'Prospect has requested withdrawal of the token',
    next: ['refunded', 'allotment_pending'],
    tone: 'danger',
  },
  {
    value: 'refunded',
    label: 'Refunded',
    description: 'Token amount refunded and closed',
    next: [],
    terminal: true,
    tone: 'danger',
  },
  {
    value: 'expired',
    label: 'Expired',
    description: 'Validity lapsed without allotment',
    next: ['refund_requested', 'cancelled'],
    tone: 'danger',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    description: 'Token cancelled by company or prospect',
    next: [],
    terminal: true,
    tone: 'danger',
  },
];

export const TOKEN_INITIAL_STATUS = 'draft';

/** Statuses that make a token eligible for the allotment priority queue */
export const ALLOTMENT_ELIGIBLE_STATUSES = [
  'verified',
  'allotment_pending',
  'waitlisted',
  'allotted',
];

/** ---------------- Payment modes ---------------- */
export const PAYMENT_MODES: MasterOption[] = [
  { value: 'neft_rtgs', label: 'NEFT / RTGS' },
  { value: 'imps', label: 'IMPS' },
  { value: 'upi', label: 'UPI' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'demand_draft', label: 'Demand Draft' },
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'payment_gateway', label: 'Online Payment Gateway' },
  { value: 'wire_transfer', label: 'Wire Transfer (NRI)' },
];

/** ---------------- Priority / Allotment Rules master ---------------- */
export interface PriorityRule {
  value: string;
  label: string;
  description: string;
  /** max points contributed by this rule */
  maxPoints: number;
  enabled: boolean;
}

export const PRIORITY_RULES: PriorityRule[] = [
  {
    value: 'token_amount_slab',
    label: 'Token Amount Slab',
    description: 'Higher token amount earns higher priority points (up to ₹25 L slab).',
    maxPoints: 40,
    enabled: true,
  },
  {
    value: 'receipt_sequence',
    label: 'First-Come-First-Serve (Receipt Date)',
    description: 'Earlier token receipt date scores higher — decays 1 point per day.',
    maxPoints: 20,
    enabled: true,
  },
  {
    value: 'category_weight',
    label: 'Token Category Weight',
    description: 'Priority / Corporate / Loyalty EOIs carry a higher category weight.',
    maxPoints: 40,
    enabled: true,
  },
  {
    value: 'type_weight',
    label: 'Token Type Weight',
    description: 'Non-refundable and adjustable tokens indicate stronger commitment.',
    maxPoints: 25,
    enabled: true,
  },
  {
    value: 'kyc_reference',
    label: 'Payment Reference / KYC Captured',
    description: 'Complete payment reference and verified status adds confidence points.',
    maxPoints: 10,
    enabled: true,
  },
  {
    value: 'manual_override',
    label: 'Management Override',
    description: 'Sales head can add or deduct points for strategic prospects.',
    maxPoints: 20,
    enabled: true,
  },
];

export const labelOf = (options: MasterOption[], value: string) =>
  options.find((o) => o.value === value)?.label || value;

export const categoryOf = (value: string) =>
  TOKEN_CATEGORIES.find((c) => c.value === value);

export const typeOf = (value: string) => TOKEN_TYPES.find((t) => t.value === value);

export const statusOf = (value: string) =>
  TOKEN_STATUSES.find((s) => s.value === value);

export const allowedNextStatuses = (value: string) => {
  const current = statusOf(value);
  if (!current) return TOKEN_STATUSES.map((s) => s.value);
  return current.next;
};

export const statusBadgeClass = (value: string) => {
  const tone = statusOf(value)?.tone || 'neutral';
  switch (tone) {
    case 'success':
      return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
    case 'progress':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'warning':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    case 'danger':
      return 'bg-rose-100 text-rose-800 hover:bg-rose-100';
    default:
      return 'bg-secondary text-secondary-foreground hover:bg-secondary';
  }
};
