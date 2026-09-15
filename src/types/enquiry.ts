export interface CostSheetCharge {
  id: string;
  label: string;
  amount: number;
}

export interface CostSheet {
  quotationNumber: string;
  generatedAt: string;
  version: number;
  charges: CostSheetCharge[];
  discountPercent: number;
  gstPercent: number;
  stampDutyPercent: number;
  registrationCharges: number;
  validityDays: number;
  paymentPlan: string;
  remarks?: string;
}

export interface QuotationChange {
  field: string;
  from: string;
  to: string;
}

export interface QuotationLogEntry {
  id: string;
  at: string;
  version: number;
  quotationNumber: string;
  action: 'created' | 'updated';
  grandTotal: number;
  changes: QuotationChange[];
  changedBy?: string;
}

export interface Enquiry {
  id: string;
  createdAt: string;
  projectName: string;
  towerBlock: string;
  unitNumber: string;
  unitConfiguration: string;
  carpetArea: number;
  ratePerSqft: number;
  channel: string;
  status: string;
  notes?: string;
  costSheet?: CostSheet;
}

export const UNIT_CONFIGURATIONS = [
  '1RK',
  '1BHK',
  '2BHK',
  '2.5BHK',
  '3BHK',
  '4BHK',
  'Duplex',
  'Penthouse',
  'Villa',
  'Plot',
  'Office Space',
  'Retail Shop',
];

export const ENQUIRY_CHANNELS = [
  { value: 'website', label: 'Website Inquiry' },
  { value: 'social_media', label: 'Social Media Campaign' },
  { value: 'portal_99acres', label: '99acres' },
  { value: 'portal_magicbricks', label: 'MagicBricks' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'call_center', label: 'Call Center' },
  { value: 'email_marketing', label: 'Email Marketing' },
  { value: 'chatbot', label: 'Chatbot / Virtual Assistant' },
  { value: 'channel_partner', label: 'Channel Partner' },
  { value: 'referral', label: 'Referral' },
];

export const ENQUIRY_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'booked', label: 'Booked' },
  { value: 'lost', label: 'Lost' },
];

export const PAYMENT_PLANS = [
  'Construction Linked Plan',
  'Down Payment Plan',
  'Possession Linked Plan',
  'Flexi Payment Plan',
];

export const defaultCharges = (baseValue: number): CostSheetCharge[] => [
  { id: 'plc', label: 'Preferential Location Charges (PLC)', amount: Math.round(baseValue * 0.02) },
  { id: 'parking', label: 'Car Parking', amount: 350000 },
  { id: 'clubhouse', label: 'Clubhouse Membership', amount: 150000 },
  { id: 'infra', label: 'Infrastructure & Development', amount: Math.round(baseValue * 0.015) },
  { id: 'maintenance', label: 'Advance Maintenance (12 months)', amount: 60000 },
  { id: 'legal', label: 'Legal & Documentation', amount: 25000 },
];
