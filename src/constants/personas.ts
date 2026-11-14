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
  doctorName: string;
  degrees: string;
  registration: string;
  address: string;
  tones: string[];
  pillars: Array<{ name: string; weight: number }>;
  campaignTopic: string;
  badge: string;
  category: 'Healthcare' | 'Dermatology' | 'Fitness/Wellness';
  emoji: string;
  iconBg: string;
}

export const PERSONAS: Record<PersonaKey, PersonaConfig> = {
  sharma: {
    key: 'sharma',
    userName: 'Dr. Rajesh Sharma',
    userEmail: 'dr.sharma@kuiro.in',
    userRole: 'Founder & Clinic Director',
    workspaceName: 'Dr. Sharma Dental Clinics',
    tier: 'GROWTH',
    phone: '+919830124589',
    industry: 'Healthcare & Dental Surgery',
    colors: { primary: '#FF7A00', secondary: '#0B0F14' },
    doctorName: 'Dr. Rajesh Sharma',
    degrees: 'BDS, MDS (Orthodontics & Dentofacial Orthopedics)',
    registration: 'WBMC-48291',
    address: 'Park Circus, Kolkata, WB',
    tones: ['Clinical', 'Reassuring', 'Empathetic', 'Authoritative'],
    pillars: [
      { name: 'Preventive Dentistry', weight: 40 },
      { name: 'Smile Makeovers & Clear Aligners', weight: 35 },
      { name: 'Children Oral Health', weight: 25 },
    ],
    campaignTopic: 'Holi Festive Smiles & Organic Color Dental Safety Guide',
    badge: 'Healthcare',
    category: 'Healthcare',
    emoji: '🩺',
    iconBg: 'bg-orange-50 text-[#FF7A00] border-orange-200',
  },
  sengupta: {
    key: 'sengupta',
    userName: 'Dr. Debolina Sengupta',
    userEmail: 'dr.sengupta@kuiro.in',
    userRole: 'Founder & Medical Director',
    workspaceName: 'Sengupta Aesthetic & Skin Clinic',
    tier: 'AGENCY',
    phone: '+919831298450',
    industry: 'Dermatology & Medical Cosmetology',
    colors: { primary: '#6366F1', secondary: '#EC4899' },
    doctorName: 'Dr. Debolina Sengupta',
    degrees: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    registration: 'WBMC-98124',
    address: 'Ballygunge Circular Road, Kolkata, WB',
    tones: ['Scientific', 'Empathetic', 'Elegantly Professional', 'Inclusive'],
    pillars: [
      { name: 'Melanin-Safe Laser Treatments', weight: 45 },
      { name: 'Acne Scar Subcision & Microneedling', weight: 30 },
      { name: 'Medical Peels & Glow Science', weight: 25 },
    ],
    campaignTopic: 'Post-Holi Skin Barrier Repair & Hyperpigmentation Reversal',
    badge: 'Dermatology',
    category: 'Dermatology',
    emoji: '✨',
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  mehta: {
    key: 'mehta',
    userName: 'Ananya Mehta',
    userEmail: 'ananya.mehta@kuiro.in',
    userRole: 'Founder & Chief Wellness Guide',
    workspaceName: 'Mehta Yoga & Holistic Wellness',
    tier: 'GROWTH',
    phone: '+919820034891',
    industry: 'Fitness, Yoga & Integrative Wellness',
    colors: { primary: '#00C88C', secondary: '#064E3B' },
    doctorName: 'Ananya Mehta',
    degrees: 'E-RYT 500, MSc Yoga Therapy & Integrative Medicine',
    registration: 'YAI-90214',
    address: 'Bandra West, Mumbai, MH',
    tones: ['Mindful', 'Culturally Rooted', 'Energizing', 'Warm'],
    pillars: [
      { name: 'Stress Relief & Daily Pranayama', weight: 40 },
      { name: 'Spinal Alignment & Vinyasa Flow', weight: 35 },
      { name: 'Ayurvedic Seasonal Nutrition', weight: 25 },
    ],
    campaignTopic: 'Spring Equinox Morning Flow & Mindful Detoxification Workshop',
    badge: 'Fitness & Wellness',
    category: 'Fitness/Wellness',
    emoji: '🧘',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
};

export const PERSONAS_LIST = Object.values(PERSONAS).map((p) => ({
  key: p.key,
  name: p.workspaceName,
  doctor: `${p.doctorName} (${p.degrees.split(',')[0]})`,
  category: p.category,
  color: p.colors.primary,
  iconBg: p.iconBg,
  emoji: p.emoji,
}));

