import { db } from './index';
import { culturalEventsCalendar } from './schema';

export const INDIAN_CULTURAL_RADAR_SEED = [
  {
    eventName: 'Durga Puja (Maha Saptami to Dashami)',
    eventDate: '2026-10-18',
    regions: ['East India', 'West Bengal', 'Tripura', 'Assam', 'Pan-India'],
    targetIndustries: ['Retail', 'Fashion', 'Hospitality', 'FMCG', 'Healthcare', 'All'],
    promptContext: 'Spiritual victory of good over evil, Divine feminine energy (Shakti), celebration, homecoming, Dhunuchi naach, festive blessings with gold and crimson hues.'
  },
  {
    eventName: 'Dhanteras (Dhantrayodashi)',
    eventDate: '2026-11-06',
    regions: ['North India', 'West India', 'Pan-India'],
    targetIndustries: ['Jewelry', 'Automotive', 'Real Estate', 'Healthcare & Wellness', 'Fintech'],
    promptContext: 'Auspicious acquisition of wealth, health blessings from Lord Dhanvantari (the physician of the gods), gold, prosperity, family security and new investments.'
  },
  {
    eventName: 'Diwali (Deepavali & Lakshmi Puja)',
    eventDate: '2026-11-08',
    regions: ['Pan-India', 'Global Diaspora'],
    targetIndustries: ['All'],
    promptContext: 'Festival of Lights, welcoming prosperity, illuminated earthen diyas, victory of illumination over darkness, warm customer gratitude, new beginnings.'
  },
  {
    eventName: 'Chhath Puja',
    eventDate: '2026-11-14',
    regions: ['Bihar', 'Jharkhand', 'Eastern Uttar Pradesh', 'Pan-India'],
    targetIndustries: ['Retail', 'Services', 'Community Brands', 'FMCG'],
    promptContext: 'Ancient Vedic reverence to Surya (Sun God) and Chhathi Maiya, purity, nature gratitude, riverside Arghya at sunset and sunrise, resilience and discipline.'
  },
  {
    eventName: 'Ganesh Chaturthi',
    eventDate: '2026-09-14',
    regions: ['Maharashtra', 'Karnataka', 'Telangana', 'Gujarat', 'Pan-India'],
    targetIndustries: ['Automotive', 'Electronics', 'Real Estate', 'Education', 'All'],
    promptContext: 'Welcoming Lord Ganesha, remover of obstacles (Vighnaharta), auspicious business commencements, Modak sweets, communal ecstasy and wisdom.'
  },
  {
    eventName: 'Pongal (Thai Pongal)',
    eventDate: '2026-01-14',
    regions: ['Tamil Nadu', 'South India'],
    targetIndustries: ['Agriculture', 'Food & Dining', 'Apparel', 'Automotive', 'Retail'],
    promptContext: 'Harvest gratitude to Sun God, sugarcane, kolam rangoli designs, boiling milk pot overflow (symbolizing abundance and endless growth).'
  },
  {
    eventName: 'Poila Boishakh (Noboborsho - Bengali New Year)',
    eventDate: '2026-04-15',
    regions: ['West Bengal', 'Tripura', 'Assam'],
    targetIndustries: ['Retail', 'Jewelry', 'Dining', 'Services', 'Commercial Accounting (Haal Khata)'],
    promptContext: 'Subho Noboborsho, traditional opening of fresh accounting ledgers (Haal Khata), sweets, cultural pride, new commercial partnerships and prosperity.'
  },
  {
    eventName: 'Rongali Bihu (Bohag Bihu)',
    eventDate: '2026-04-14',
    regions: ['Assam', 'North-East India'],
    targetIndustries: ['Agriculture', 'Apparel (Muga Silk)', 'Hospitality', 'Culture'],
    promptContext: 'Assamese spring harvest festival, Dhol and Pepa music, energetic Bihu dance, welcoming agricultural vitality and community solidarity.'
  },
  {
    eventName: 'Onam (Thiruvonam)',
    eventDate: '2026-08-25',
    regions: ['Kerala', 'South India'],
    targetIndustries: ['Retail', 'Hospitality', 'Textiles', 'Jewelry', 'Consumer Tech'],
    promptContext: 'Homecoming of legendary King Mahabali, intricate floral Pookkalam carpets, Onasadya grand feast, boat races (Vallam Kali), state-wide festive shopping.'
  },
  {
    eventName: 'Holi (Festival of Colors)',
    eventDate: '2026-03-03',
    regions: ['North India', 'Central India', 'Pan-India'],
    targetIndustries: ['Hospitality', 'Lifestyle', 'FMCG', 'All'],
    promptContext: 'Vibrant organic colors, welcoming spring harvest, warmth, forgiveness, playful camaraderie, sweets like Gujiya, vibrant joy.'
  },
  {
    eventName: 'Eid ul-Fitr',
    eventDate: '2026-03-20',
    regions: ['Pan-India', 'Global'],
    targetIndustries: ['Retail', 'Apparel', 'Dining', 'Gifting', 'Fintech'],
    promptContext: 'Culmination of Ramadan devotion, generosity (Zakat), family togetherness, warmth, Sheer Khurma sweetness, peace and blessings.'
  },
  {
    eventName: 'National Doctors Day',
    eventDate: '2026-07-01',
    regions: ['Pan-India'],
    targetIndustries: ['Healthcare', 'Clinics', 'Diagnostics', 'Pharmaceuticals', 'Wellness'],
    promptContext: 'Honoring Dr. Bidhan Chandra Roy, gratitude to medical professionals, clinical excellence, preventive vigilance, tireless dedication to saving lives.'
  },
  {
    eventName: 'National Technology Day',
    eventDate: '2026-05-11',
    regions: ['Pan-India'],
    targetIndustries: ['SaaS', 'IT Services', 'Engineering', 'Fintech', 'EdTech'],
    promptContext: 'Celebrating Indian scientific breakthroughs and Pokhran milestones, innovation, tech self-reliance (Atmanirbhar Bharat), software engineering pride.'
  },
  {
    eventName: 'MSME Day (World Micro, Small & Medium Enterprises Day)',
    eventDate: '2026-06-27',
    regions: ['Pan-India', 'Global'],
    targetIndustries: ['B2B Services', 'Agencies', 'Manufacturing', 'SaaS', 'Logistics'],
    promptContext: 'Celebrating SMB founders as the backbone of economic GDP, resilience, job creation, local enterprise growth and entrepreneurial pride.'
  },
  {
    eventName: 'Chartered Accountants (CA) Day',
    eventDate: '2026-07-01',
    regions: ['Pan-India'],
    targetIndustries: ['Financial Services', 'Fintech', 'Legal', 'Consulting'],
    promptContext: 'Foundation of ICAI, financial transparency, tax compliance, corporate governance, trusted advisors to Indian business growth.'
  },
  {
    eventName: 'World Heart Day',
    eventDate: '2026-09-29',
    regions: ['Pan-India', 'Global'],
    targetIndustries: ['Healthcare', 'Diagnostics', 'Fitness', 'Insurance', 'Wellness'],
    promptContext: 'Cardiovascular health awareness, routine lipid and ECG screenings, active living, stress management, preventative cardiology.'
  },
  {
    eventName: 'Independence Day',
    eventDate: '2026-08-15',
    regions: ['Pan-India'],
    targetIndustries: ['All'],
    promptContext: 'National sovereignty, tricolor pride (Tiranga), sacrifice of freedom fighters, collective economic progress and unity.'
  },
  {
    eventName: 'Republic Day',
    eventDate: '2026-01-26',
    regions: ['Pan-India'],
    targetIndustries: ['All'],
    promptContext: 'Adoption of the Constitution of India, democratic values, parade of regional diversity, civic duty and constitutional integrity.'
  }
];

export async function seedDatabase() {
  console.log('[KUIRO Seed] Populating 365-Day Regional & Industry Calendar...');
  if (!db) {
    console.log('[KUIRO Seed] Neon Database URL not set. Using in-memory calendar triggers.');
    return;
  }

  try {
    for (const event of INDIAN_CULTURAL_RADAR_SEED) {
      await db.insert(culturalEventsCalendar).values({
        eventName: event.eventName,
        eventDate: event.eventDate,
        regions: event.regions,
        targetIndustries: event.targetIndustries,
        promptContext: event.promptContext,
      }).onConflictDoNothing();
    }
    console.log(`[KUIRO Seed] Successfully seeded ${INDIAN_CULTURAL_RADAR_SEED.length} cultural & industry calendar milestones.`);
  } catch (error) {
    console.error('[KUIRO Seed] Failed to seed database:', error);
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

