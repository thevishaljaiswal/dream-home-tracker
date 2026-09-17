// Indian currency helpers (INR, lakh/crore notation)

export const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0));

/** Short Indian notation: ₹1.25 Cr, ₹45 L, ₹80,000 */
export const formatINRShort = (value: number) => {
  const amount = Math.round(Number(value) || 0);
  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  }
  return formatINR(amount);
};

export const INDIAN_LOCATIONS = [
  'Pune - Hinjewadi',
  'Pune - Kharadi',
  'Pune - Bavdhan',
];
