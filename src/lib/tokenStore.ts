import { EOIToken, TokenChange, TokenLogEntry, TokenAction } from '@/types/token';
import {
  ALLOTMENT_ELIGIBLE_STATUSES,
  PRIORITY_RULES,
  PAYMENT_MODES,
  TOKEN_CATEGORIES,
  TOKEN_TYPES,
  categoryOf,
  labelOf,
  statusOf,
  typeOf,
} from '@/lib/eoiMasters';
import { formatINR } from '@/lib/currency';

const STORAGE_KEY = 'eoi_tokens';

export const loadTokens = (): EOIToken[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveTokens = (tokens: EOIToken[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
};

export const tokensForLead = (leadId: string) =>
  loadTokens().filter((t) => t.leadId === leadId);

export const generateTokenNumber = (existing: EOIToken[]) => {
  const now = new Date();
  const prefix = `EOI-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const sameMonth = existing.filter((t) => t.tokenNumber.startsWith(prefix));
  return `${prefix}-${String(sameMonth.length + 1).padStart(4, '0')}`;
};

/** ---------------- Priority engine ---------------- */
const ruleEnabled = (value: string) =>
  PRIORITY_RULES.find((r) => r.value === value)?.enabled !== false;

export interface ScoreBreakdown {
  rule: string;
  label: string;
  points: number;
}

export const scoreToken = (token: EOIToken): ScoreBreakdown[] => {
  const breakdown: ScoreBreakdown[] = [];

  if (ruleEnabled('token_amount_slab')) {
    const points = Math.min(40, Math.round((token.amount / 2500000) * 40));
    breakdown.push({ rule: 'token_amount_slab', label: 'Token Amount Slab', points });
  }

  if (ruleEnabled('receipt_sequence')) {
    const days = Math.max(
      0,
      Math.floor((Date.now() - new Date(token.receivedAt).getTime()) / 86400000)
    );
    // earliest receipts retain the full 20 points, decaying is reversed:
    // a token received long ago keeps seniority, so older = higher.
    const points = Math.min(20, days);
    breakdown.push({ rule: 'receipt_sequence', label: 'Receipt Seniority', points });
  }

  if (ruleEnabled('category_weight')) {
    breakdown.push({
      rule: 'category_weight',
      label: 'Category Weight',
      points: categoryOf(token.category)?.weight || 0,
    });
  }

  if (ruleEnabled('type_weight')) {
    breakdown.push({
      rule: 'type_weight',
      label: 'Type Weight',
      points: typeOf(token.type)?.weight || 0,
    });
  }

  if (ruleEnabled('kyc_reference')) {
    let points = 0;
    if (token.paymentReference && token.paymentReference.trim().length > 3) points += 5;
    if (['verified', 'allotment_pending', 'allotted', 'converted'].includes(token.status))
      points += 5;
    breakdown.push({ rule: 'kyc_reference', label: 'Payment Reference / Verified', points });
  }

  if (ruleEnabled('manual_override') && token.manualPriorityOverride) {
    const points = Math.max(-20, Math.min(20, token.manualPriorityOverride));
    breakdown.push({ rule: 'manual_override', label: 'Management Override', points });
  }

  return breakdown;
};

export const totalScore = (token: EOIToken) =>
  scoreToken(token).reduce((sum, b) => sum + b.points, 0);

export const isAllotmentEligible = (token: EOIToken) =>
  ALLOTMENT_ELIGIBLE_STATUSES.includes(token.status);

/** Ranks eligible tokens per project; returns tokens with priorityScore + allotmentRank set. */
export const rankTokens = (tokens: EOIToken[]): EOIToken[] => {
  const scored = tokens.map((t) => ({ ...t, priorityScore: totalScore(t) }));

  const byProject = new Map<string, EOIToken[]>();
  scored.forEach((t) => {
    if (!isAllotmentEligible(t)) return;
    const key = t.projectName.trim().toLowerCase();
    byProject.set(key, [...(byProject.get(key) || []), t]);
  });

  const rankMap = new Map<string, number>();
  byProject.forEach((list) => {
    list
      .sort((a, b) => {
        if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
        return new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime();
      })
      .forEach((t, index) => rankMap.set(t.id, index + 1));
  });

  return scored.map((t) => ({ ...t, allotmentRank: rankMap.get(t.id) }));
};

export const expiryDate = (token: EOIToken) => {
  const d = new Date(token.receivedAt);
  d.setDate(d.getDate() + (token.validityDays || 0));
  return d;
};

/** ---------------- Change log ---------------- */
const fieldLabels: Record<string, string> = {
  projectName: 'Project',
  towerBlock: 'Tower / Block',
  unitConfiguration: 'Unit Configuration',
  preferredUnitNumber: 'Preferred Unit',
  category: 'Token Category',
  type: 'Token Type',
  status: 'Token Status',
  amount: 'Token Amount',
  paymentMode: 'Payment Mode',
  paymentReference: 'Payment Reference',
  receivedAt: 'Received On',
  validityDays: 'Validity (days)',
  refundable: 'Refundable',
  manualPriorityOverride: 'Management Override',
  remarks: 'Remarks',
  enquiryId: 'Linked Enquiry',
};

const display = (field: string, value: unknown): string => {
  if (value === undefined || value === null || value === '') return '—';
  switch (field) {
    case 'amount':
      return formatINR(Number(value));
    case 'category':
      return labelOf(TOKEN_CATEGORIES, String(value));
    case 'type':
      return labelOf(TOKEN_TYPES, String(value));
    case 'status':
      return statusOf(String(value))?.label || String(value);
    case 'paymentMode':
      return labelOf(PAYMENT_MODES, String(value));
    case 'receivedAt':
      return new Date(String(value)).toLocaleDateString('en-IN');
    case 'refundable':
      return value ? 'Yes' : 'No';
    default:
      return String(value);
  }
};

export const diffTokens = (before: EOIToken, after: EOIToken): TokenChange[] => {
  const changes: TokenChange[] = [];
  (Object.keys(fieldLabels) as (keyof EOIToken)[]).forEach((key) => {
    const field = key as string;
    const from = before[key];
    const to = after[key];
    if ((from ?? '') === (to ?? '')) return;
    changes.push({
      field: fieldLabels[field],
      from: display(field, from),
      to: display(field, to),
    });
  });
  return changes;
};

export const buildLogEntry = (
  action: TokenAction,
  changes: TokenChange[],
  remarks?: string
): TokenLogEntry => ({
  id: crypto.randomUUID(),
  at: new Date().toISOString(),
  action,
  changes,
  remarks,
});

export const upsertToken = (token: EOIToken): EOIToken[] => {
  const tokens = loadTokens();
  const index = tokens.findIndex((t) => t.id === token.id);
  const next = index >= 0
    ? tokens.map((t) => (t.id === token.id ? token : t))
    : [...tokens, token];
  const ranked = rankTokens(next);
  saveTokens(ranked);
  return ranked;
};

export const deleteToken = (id: string): EOIToken[] => {
  const ranked = rankTokens(loadTokens().filter((t) => t.id !== id));
  saveTokens(ranked);
  return ranked;
};
