import { CostSheet, QuotationChange, QuotationLogEntry } from '@/types/enquiry';

export const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(value) || 0);

export const computeCostSheetTotals = (sheet: CostSheet, baseValue: number) => {
  const chargesTotal = sheet.charges.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const discount = (baseValue * (Number(sheet.discountPercent) || 0)) / 100;
  const agreementValue = baseValue - discount + chargesTotal;
  const gst = (agreementValue * (Number(sheet.gstPercent) || 0)) / 100;
  const stampDuty = (agreementValue * (Number(sheet.stampDutyPercent) || 0)) / 100;
  const grandTotal = agreementValue + gst + stampDuty + (Number(sheet.registrationCharges) || 0);

  return { chargesTotal, discount, agreementValue, gst, stampDuty, grandTotal };
};

const percent = (v: number) => `${Number(v) || 0}%`;

export const diffCostSheets = (
  prev: CostSheet | undefined,
  next: CostSheet,
  baseValue: number
): QuotationChange[] => {
  const changes: QuotationChange[] = [];

  if (!prev) {
    changes.push({
      field: 'Quotation',
      from: '—',
      to: `Created with total ${formatINR(computeCostSheetTotals(next, baseValue).grandTotal)}`,
    });
    return changes;
  }

  const push = (field: string, from: string | number, to: string | number) => {
    if (String(from) !== String(to)) changes.push({ field, from: String(from), to: String(to) });
  };

  push('Discount', percent(prev.discountPercent), percent(next.discountPercent));
  push('GST', percent(prev.gstPercent), percent(next.gstPercent));
  push('Stamp duty', percent(prev.stampDutyPercent), percent(next.stampDutyPercent));
  push(
    'Registration charges',
    formatINR(prev.registrationCharges),
    formatINR(next.registrationCharges)
  );
  push('Validity', `${prev.validityDays} days`, `${next.validityDays} days`);
  push('Payment plan', prev.paymentPlan, next.paymentPlan);
  push('Remarks', prev.remarks || '—', next.remarks || '—');

  const prevById = new Map(prev.charges.map((c) => [c.id, c]));
  const nextById = new Map(next.charges.map((c) => [c.id, c]));

  next.charges.forEach((charge) => {
    const before = prevById.get(charge.id);
    if (!before) {
      changes.push({
        field: `Charge added: ${charge.label || 'Untitled'}`,
        from: '—',
        to: formatINR(charge.amount),
      });
      return;
    }
    if (before.label !== charge.label) {
      push(`Charge renamed`, before.label || 'Untitled', charge.label || 'Untitled');
    }
    if (Number(before.amount) !== Number(charge.amount)) {
      push(
        `Charge: ${charge.label || 'Untitled'}`,
        formatINR(before.amount),
        formatINR(charge.amount)
      );
    }
  });

  prev.charges.forEach((charge) => {
    if (!nextById.has(charge.id)) {
      changes.push({
        field: `Charge removed: ${charge.label || 'Untitled'}`,
        from: formatINR(charge.amount),
        to: '—',
      });
    }
  });

  const prevTotal = computeCostSheetTotals(prev, baseValue).grandTotal;
  const nextTotal = computeCostSheetTotals(next, baseValue).grandTotal;
  if (Math.round(prevTotal) !== Math.round(nextTotal)) {
    changes.push({
      field: 'Total payable',
      from: formatINR(prevTotal),
      to: formatINR(nextTotal),
    });
  }

  return changes;
};

export const buildLogEntry = (
  prev: CostSheet | undefined,
  next: CostSheet,
  baseValue: number,
  changedBy?: string
): QuotationLogEntry | null => {
  const changes = diffCostSheets(prev, next, baseValue);
  if (changes.length === 0) return null;

  return {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    version: next.version,
    quotationNumber: next.quotationNumber,
    action: prev ? 'updated' : 'created',
    grandTotal: computeCostSheetTotals(next, baseValue).grandTotal,
    changes,
    changedBy,
  };
};
