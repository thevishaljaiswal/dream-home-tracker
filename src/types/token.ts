export type TokenAction = 'created' | 'updated' | 'status_change' | 'cancelled' | 'refunded';

export interface TokenChange {
  field: string;
  from: string;
  to: string;
}

export interface TokenLogEntry {
  id: string;
  at: string;
  action: TokenAction;
  changes: TokenChange[];
  by?: string;
  remarks?: string;
}

export interface EOIToken {
  id: string;
  tokenNumber: string;

  /** Controlled link to the Lead / Prospect */
  leadId: string;
  leadName: string;
  leadContact?: string;
  /** Optional link to a specific enquiry of that lead */
  enquiryId?: string;

  projectName: string;
  towerBlock?: string;
  unitConfiguration: string;
  preferredUnitNumber?: string;

  /** Masters */
  category: string;
  type: string;
  status: string;

  amount: number;
  paymentMode: string;
  paymentReference?: string;
  receivedAt: string;
  validityDays: number;
  refundable: boolean;

  /** Priority / allotment */
  priorityScore: number;
  allotmentRank?: number;
  manualPriorityOverride?: number;

  remarks?: string;
  createdAt: string;
  updatedAt?: string;
  log: TokenLogEntry[];
}
