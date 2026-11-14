export type PersonaKey = 'sharma' | 'sengupta' | 'mehta';

export interface PersonaConfig {
  key: PersonaKey;
  userName: string;
  userEmail: string;
  userRole: string;
  workspaceName: string;
  tier: 'STARTER' | 'GROWTH' | 'AGENCY';
  phone: string;
  industry: string;
  colors: { primary: string; secondary: string };
  doctorName?: string;
  degrees?: string;
  registration?: string;
  address: string;
  tones: string[];
  pillars: Array<{ name: string; weight: number }>;
  campaignTopic: string;
  badge: string;
  category: string;
  emoji: string;
  iconBg: string;
}

export const PERSONAS: Record<PersonaKey, PersonaConfig> = {
  // 1. Retail & Local Commerce Archetype
  sharma: {
    key: 'sharma',
    userName: 'Rajesh Sharma',
    userEmail: 'rajesh.sharma@kuiro.in',
    userRole: 'Founder & Retail Director',
    workspaceName: 'Sharma Heritage Handlooms & Retail',
    tier: 'GROWTH',
    phone: '+919830124589',
    industry: 'Retail, Apparel & Local Commerce',
    colors: { primary: '#FF7A00', secondary: '#0B0F14' },
    doctorName: 'Rajesh Sharma',
    degrees: 'Retail Director',
    registration: 'WB-RET-8921',
    address: 'Gariahat Market, Kolkata, WB',
    tones: ['Warm & Hospitable', 'Culturally Rooted (Handloom Pride)', 'Authentic', 'Customer-First'],
    pillars: [
      { name: 'Pure Silk & Handcrafted Weaves', weight: 40 },
      { name: 'Festive Lookbooks & Style Guides', weight: 35 },
      { name: 'In-Store Showcase & Artisan Stories', weight: 25 },
    ],
    campaignTopic: 'Diwali Festive Pure Silk & Handcrafted Weaves Showcase',
    badge: 'Retail & Commerce',
    category: 'Retail & Commerce',
    emoji: '🛍️',
    iconBg: 'bg-orange-50 text-[#FF7A00] border-orange-200',
  },

  // 2. Personal Brand, Solopreneur & Tech Founder Archetype
  sengupta: {
    key: 'sengupta',
    userName: 'Arjun Sen',
    userEmail: 'arjun.sen@kuiro.in',
    userRole: 'Founder & Executive Growth Advisor',
    workspaceName: 'Arjun Sen Advisory & Studio',
    tier: 'AGENCY',
    phone: '+919831298450',
    industry: 'Consultancy, Growth & Creator Brand',
    colors: { primary: '#6366F1', secondary: '#EC4899' },
    doctorName: 'Arjun Sen',
    degrees: 'Executive Advisor',
    registration: 'KA-ADV-4102',
    address: 'Indiranagar, Bengaluru, KA',
    tones: ['Authoritative Thought Leader', 'Direct & Insightful', 'Action-Oriented', 'High Agency'],
    pillars: [
      { name: 'Zero-CAC Distribution Playbooks', weight: 45 },
      { name: 'Executive Systems & Leverage', weight: 30 },
      { name: 'Case Studies: 0 to 10M ARR', weight: 25 },
    ],
    campaignTopic: 'Building High-Velocity B2B Growth Engines with Zero Paid Ads',
    badge: 'Creator & Founder',
    category: 'Creator & Founder',
    emoji: '🚀',
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },

  // 3. Professional Practice & Healthcare Clinic Archetype
  mehta: {
    key: 'mehta',
    userName: 'Dr. Ananya Mehta',
    userEmail: 'dr.ananya@kuiro.in',
    userRole: 'Medical Director & Lead Clinician',
    workspaceName: 'Apex Healthcare & Care Clinic',
    tier: 'GROWTH',
    phone: '+919820034891',
    industry: 'Healthcare, Diagnostics & Practice',
    colors: { primary: '#00C88C', secondary: '#064E3B' },
    doctorName: 'Dr. Ananya Mehta',
    degrees: 'MBBS, MD (Family Medicine & Diagnostics)',
    registration: 'WBMC-48291',
    address: 'Bandra West, Mumbai, MH',
    tones: ['Clinically Authoritative', 'Empathetic & Reassuring', 'Jargon-Free', 'Preventive First'],
    pillars: [
      { name: 'Preventive Health & Early Screenings', weight: 40 },
      { name: 'Patient Education & Myth Busting', weight: 35 },
      { name: 'Family Wellness & Seasonal Care', weight: 25 },
    ],
    campaignTopic: 'Monsoon Wellness Checkup & Preventative Diagnostic Drive',
    badge: 'Professional Practice',
    category: 'Healthcare & Practice',
    emoji: '🩺',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
};

export const PERSONAS_LIST = Object.values(PERSONAS).map((p) => ({
  key: p.key,
  name: p.workspaceName,
  doctor: `${p.userName} • ${p.category}`,
  subtext: `${p.userName} • ${p.category}`,
  category: p.category,
  color: p.colors.primary,
  iconBg: p.iconBg,
  emoji: p.emoji,
}));
