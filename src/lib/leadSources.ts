// Lead origin masters: Source, Source Group, Source Subgroup, Channel, Pathway

export interface Option {
  value: string;
  label: string;
  description?: string;
}

export const LEAD_SOURCES: Option[] = [
  { value: 'digital', label: 'Digital', description: 'Online/digital marketing generated lead' },
  { value: 'website', label: 'Website', description: 'Company/project website' },
  { value: 'property_portals', label: 'Property Portals', description: '99acres, MagicBricks, Housing, etc.' },
  { value: 'social_media', label: 'Social Media', description: 'Facebook, Instagram, LinkedIn, YouTube' },
  { value: 'search_engine', label: 'Search Engine', description: 'Google/Bing search or ads' },
  { value: 'campaign', label: 'Campaign', description: 'Specific marketing campaign' },
  { value: 'events', label: 'Events', description: 'Exhibition, property event, launch event' },
  { value: 'outbound_calling', label: 'Outbound Calling', description: 'Lead generated through calling' },
  { value: 'walk_in', label: 'Walk-in', description: 'Customer directly visits sales office/site' },
  { value: 'channel_partner', label: 'Channel Partner', description: 'External broker/CP' },
  { value: 'referral', label: 'Referral', description: 'Customer/employee/other referral' },
  { value: 'international', label: 'International', description: 'NRI/overseas source' },
  { value: 'corporate', label: 'Corporate', description: 'Corporate/employee tie-up' },
  { value: 'database', label: 'Database', description: 'Existing/old database' },
  { value: 'direct_marketing', label: 'Direct Marketing', description: 'SMS, email, WhatsApp, physical marketing' },
  { value: 'other', label: 'Other', description: 'Other identifiable sources' },
];

export const SOURCE_GROUPS: Option[] = [
  { value: 'online', label: 'Online' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'digital_campaign', label: 'Digital Campaign' },
  { value: 'offline_marketing', label: 'Offline Marketing' },
  { value: 'events_activations', label: 'Events & Activations' },
  { value: 'direct_sales', label: 'Direct Sales' },
  { value: 'channel_network', label: 'Channel Network' },
  { value: 'customer_network', label: 'Customer Network' },
  { value: 'international', label: 'International' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'database', label: 'Database' },
  { value: 'partner_ecosystem', label: 'Partner Ecosystem' },
  { value: 'other', label: 'Other' },
];

export const SOURCE_SUBGROUPS: Record<string, Option[]> = {
  online: [
    { value: 'company_website', label: 'Company Website' },
    { value: 'project_website', label: 'Project Website' },
    { value: 'landing_page', label: 'Landing Page' },
    { value: 'property_listing', label: 'Property Listing' },
    { value: 'google_organic', label: 'Google Organic' },
    { value: 'google_search', label: 'Google Search' },
    { value: 'google_display', label: 'Google Display' },
    { value: 'property_portal', label: 'Property Portal' },
    { value: 'mobile_app', label: 'Mobile App' },
    { value: 'portal_99acres', label: '99acres' },
    { value: 'portal_magicbricks', label: 'MagicBricks' },
    { value: 'portal_housing', label: 'Housing.com' },
    { value: 'portal_nobroker', label: 'NoBroker' },
    { value: 'portal_square_yards', label: 'Square Yards' },
    { value: 'portal_commonfloor', label: 'CommonFloor' },
    { value: 'portal_other', label: 'Other Property Portal' },
  ],
  social_media: [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'x', label: 'X' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'other_social', label: 'Other Social Media' },
  ],
  digital_campaign: [
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'meta_ads', label: 'Meta Ads' },
    { value: 'display_ads', label: 'Display Ads' },
  ],
  offline_marketing: [
    { value: 'hoarding', label: 'Hoarding' },
    { value: 'newspaper', label: 'Newspaper' },
    { value: 'magazine', label: 'Magazine' },
    { value: 'radio', label: 'Radio' },
    { value: 'pamphlet', label: 'Pamphlet' },
    { value: 'flyer', label: 'Flyer' },
    { value: 'brochure', label: 'Brochure' },
    { value: 'transit_advertising', label: 'Bus/Transit Advertising' },
    { value: 'outdoor_branding', label: 'Outdoor Branding' },
  ],
  events_activations: [
    { value: 'property_exhibition', label: 'Property Exhibition' },
    { value: 'project_launch', label: 'Project Launch' },
    { value: 'mall_activity', label: 'Mall Activity' },
    { value: 'corporate_event', label: 'Corporate Event' },
    { value: 'society_activity', label: 'Society Activity' },
    { value: 'investor_meet', label: 'Investor Meet' },
    { value: 'nri_event', label: 'NRI Event' },
  ],
  direct_sales: [
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'outbound_calling', label: 'Outbound Calling' },
  ],
  channel_network: [
    { value: 'broker', label: 'Broker' },
    { value: 'channel_partner', label: 'Channel Partner' },
    { value: 'property_consultant', label: 'Property Consultant' },
    { value: 'corporate_broker', label: 'Corporate Broker' },
    { value: 'nri_channel_partner', label: 'NRI Channel Partner' },
    { value: 'digital_channel_partner', label: 'Digital Channel Partner' },
  ],
  customer_network: [
    { value: 'existing_customer', label: 'Existing Customer' },
    { value: 'employee', label: 'Employee' },
    { value: 'friend_family', label: 'Friend/Family' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'resident', label: 'Resident' },
    { value: 'other_referral', label: 'Other Referral' },
  ],
  international: [
    { value: 'nri_campaign', label: 'NRI Campaign' },
    { value: 'overseas_event', label: 'Overseas Event' },
    { value: 'international_cp', label: 'International Channel Partner' },
  ],
  corporate: [
    { value: 'corporate_tie_up', label: 'Corporate Tie-up' },
    { value: 'employee_housing', label: 'Employee Housing' },
  ],
  database: [
    { value: 'existing_customer_db', label: 'Existing Customer' },
    { value: 'lost_lead', label: 'Lost Lead' },
    { value: 'old_lead', label: 'Old Lead' },
  ],
  partner_ecosystem: [
    { value: 'bank', label: 'Bank' },
    { value: 'broker_partner', label: 'Broker' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'alliance', label: 'Alliance' },
  ],
  other: [{ value: 'other', label: 'Other' }],
};

export const CHANNELS: Option[] = [
  { value: 'direct', label: 'Direct', description: 'Lead directly generated/handled by company' },
  { value: 'channel_partner', label: 'Channel Partner', description: 'Through CP/broker network' },
  { value: 'referral', label: 'Referral', description: 'Referred by customer/employee/other person' },
  { value: 'international', label: 'International', description: 'International/NRI market' },
  { value: 'marginal', label: 'Marginal', description: 'Non-core/low-volume/other lead sources' },
];

export const PATHWAYS: Option[] = [
  { value: 'website_enquiry', label: 'Website → Enquiry' },
  { value: 'website_call', label: 'Website → Call' },
  { value: 'website_whatsapp', label: 'Website → WhatsApp' },
  { value: 'google_landing_page', label: 'Google → Landing Page' },
  { value: 'google_website', label: 'Google → Website' },
  { value: 'meta_lead_form', label: 'Meta → Lead Form' },
  { value: 'meta_whatsapp', label: 'Meta → WhatsApp' },
  { value: 'portal_lead', label: 'Portal → Lead' },
  { value: 'portal_call', label: 'Portal → Call' },
  { value: 'social_dm', label: 'Social Media → DM' },
  { value: 'campaign_lead_form', label: 'Campaign → Lead Form' },
  { value: 'campaign_call', label: 'Campaign → Call' },
  { value: 'walk_in_sales', label: 'Walk-in → Sales' },
  { value: 'call_sales', label: 'Call → Sales' },
  { value: 'event_sales', label: 'Event → Sales' },
  { value: 'cp_sales', label: 'CP → Sales' },
  { value: 'cp_call', label: 'CP → Call' },
  { value: 'customer_referral', label: 'Customer → Referral' },
  { value: 'employee_referral', label: 'Employee → Referral' },
  { value: 'international_event_sales', label: 'International Event → Sales' },
  { value: 'nri_campaign_lead', label: 'NRI Campaign → Lead' },
  { value: 'email_enquiry', label: 'Email → Enquiry' },
  { value: 'whatsapp_enquiry', label: 'WhatsApp → Enquiry' },
  { value: 'sms_enquiry', label: 'SMS → Enquiry' },
  { value: 'database_calling', label: 'Database → Calling' },
  { value: 'database_campaign', label: 'Database → Campaign' },
];

export const labelOf = (options: Option[], value?: string) =>
  options.find((o) => o.value === value)?.label ?? value ?? '—';

export const subgroupLabel = (group?: string, value?: string) =>
  labelOf(SOURCE_SUBGROUPS[group ?? ''] ?? [], value);
