const { neon } = require('@neondatabase/serverless');

const connStr = 'postgresql://neondb_owner:npg_lWjrvKf1M2QD@ep-flat-cloud-bdhilcgu-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require';
const sql = neon(connStr);

const EVENTS = [
  {
    eventName: 'Makar Sankranti & Lohri',
    eventDate: '2026-01-14',
    regions: ['North India', 'Punjab', 'Gujarat', 'Maharashtra', 'Pan-India'],
    targetIndustries: ['Retail', 'FMCG', 'Apparel', 'Food & Dining', 'All'],
    promptContext: 'Harvest festival, kite flying, sesame (til-gul) sweets, bonfire warmth, prosperity, sun transition into Capricorn.'
  },
  {
    eventName: 'Pongal (Thai Pongal)',
    eventDate: '2026-01-15',
    regions: ['Tamil Nadu', 'South India'],
    targetIndustries: ['Agriculture', 'Food & Dining', 'Apparel', 'Automotive', 'Retail'],
    promptContext: 'Harvest gratitude to Sun God, sugarcane, kolam rangoli designs, boiling milk pot overflow (symbolizing abundance and endless growth).'
  },
  {
    eventName: 'National Startup Day',
    eventDate: '2026-01-16',
    regions: ['Pan-India'],
    targetIndustries: ['SaaS', 'Fintech', 'Agencies', 'B2B Services', 'Tech'],
    promptContext: 'Celebrating Indian founders, innovation, venture growth, self-reliance, and entrepreneurship.'
  },
  {
    eventName: 'Republic Day',
    eventDate: '2026-01-26',
    regions: ['Pan-India'],
    targetIndustries: ['All'],
    promptContext: 'Adoption of the Constitution of India, democratic values, parade of regional diversity, civic duty and constitutional integrity.'
  },
  {
    eventName: 'Maha Shivratri',
    eventDate: '2026-02-15',
    regions: ['Pan-India'],
    targetIndustries: ['All', 'Healthcare', 'Wellness'],
    promptContext: 'Spiritual discipline, inner peace, fasting health tips, meditation, family togetherness.'
  },
  {
    eventName: 'National Science Day',
    eventDate: '2026-02-28',
    regions: ['Pan-India'],
    targetIndustries: ['Healthcare', 'Diagnostics', 'Education', 'Tech'],
    promptContext: 'Commemorating Raman Effect discovery, scientific temper, diagnostic precision, evidence-based healthcare.'
  },
  {
    eventName: 'Holi (Festival of Colors)',
    eventDate: '2026-03-03',
    regions: ['North India', 'Central India', 'West Bengal', 'Pan-India'],
    targetIndustries: ['Hospitality', 'Lifestyle', 'FMCG', 'Healthcare', 'All'],
    promptContext: 'Vibrant organic colors, welcoming spring harvest, warmth, forgiveness, playful camaraderie, sweets like Gujiya, dental safety from harsh dyes.'
  },
  {
    eventName: 'International Women\'s Day',
    eventDate: '2026-03-08',
    regions: ['Pan-India', 'Global'],
    targetIndustries: ['All', 'Healthcare', 'Retail', 'Corporate'],
    promptContext: 'Empowering women leaders, preventive healthcare for mothers & daughters, equality, celebrating strength and dignity.'
  },
  {
    eventName: 'Eid ul-Fitr',
    eventDate: '2026-03-20',
    regions: ['Pan-India', 'Global'],
    targetIndustries: ['Retail', 'Apparel', 'Dining', 'Gifting', 'Fintech'],
    promptContext: 'Culmination of Ramadan devotion, generosity (Zakat), family togetherness, warmth, Sheer Khurma sweetness, peace and blessings.'
  },
  {
    eventName: 'Gudi Padwa & Ugadi (Deccan New Year)',
    eventDate: '2026-03-22',
    regions: ['Maharashtra', 'Karnataka', 'Andhra Pradesh', 'Telangana'],
    targetIndustries: ['All', 'Retail', 'Real Estate', 'Jewelry'],
    promptContext: 'New beginnings, Toran, Shrikhand Puri, auspicious purchases, neem and jaggery symbolism.'
  },
  {
    eventName: 'World Health Day',
    eventDate: '2026-04-07',
    regions: ['Pan-India', 'Global'],
    targetIndustries: ['Healthcare', 'Clinics', 'Diagnostics', 'Fitness', 'Wellness'],
    promptContext: 'Universal healthcare awareness, priority diagnostic screenings, preventive wellness, investing in body resilience.'
  },
  {
    eventName: 'Rongali Bihu (Bohag Bihu)',
    eventDate: '2026-04-14',
    regions: ['Assam', 'North-East India'],
    targetIndustries: ['Agriculture', 'Apparel (Muga Silk)', 'Hospitality', 'Culture'],
    promptContext: 'Assamese spring harvest festival, Dhol and Pepa music, energetic Bihu dance, welcoming agricultural vitality and community solidarity.'
  },
  {
    eventName: 'Poila Boishakh (Noboborsho - Bengali New Year)',
    eventDate: '2026-04-15',
    regions: ['West Bengal', 'Tripura', 'Assam'],
    targetIndustries: ['Retail', 'Jewelry', 'Dining', 'Services', 'Commercial Accounting (Haal Khata)'],
    promptContext: 'Subho Noboborsho, traditional opening of fresh accounting ledgers (Haal Khata), sweets, cultural pride, new commercial partnerships and prosperity.'
  },
  {
    eventName: 'National Technology Day',
    eventDate: '2026-05-11',
    regions: ['Pan-India'],
    targetIndustries: ['SaaS', 'IT Services', 'Engineering', 'Fintech', 'EdTech'],
    promptContext: 'Celebrating Indian scientific breakthroughs and Pokhran milestones, innovation, tech self-reliance (Atmanirbhar Bharat), software engineering pride.'
  },
  {
    eventName: 'World Environment Day',
    eventDate: '2026-06-05',
    regions: ['Pan-India', 'Global'],
    targetIndustries: ['All', 'Manufacturing', 'Retail', 'Community'],
    promptContext: 'Eco-conscious living, sustainability, reducing carbon footprint, green initiatives, environmental stewardship.'
  },
  {
    eventName: 'International Yoga Day',
    eventDate: '2026-06-21',
    regions: ['Pan-India', 'Global'],
    targetIndustries: ['Healthcare', 'Fitness', 'Wellness', 'Corporate'],
    promptContext: 'Holistic mind-body harmony, pranayama, daily vitality, posture resilience, ancient Indian wellness heritage.'
  },
  {
    eventName: 'MSME Day (World Micro, Small & Medium Enterprises Day)',
    eventDate: '2026-06-27',
    regions: ['Pan-India', 'Global'],
    targetIndustries: ['B2B Services', 'Agencies', 'Manufacturing', 'SaaS', 'Logistics'],
    promptContext: 'Celebrating SMB founders as the backbone of economic GDP, resilience, job creation, local enterprise growth and entrepreneurial pride.'
  },
  {
    eventName: 'National Doctors Day',
    eventDate: '2026-07-01',
    regions: ['Pan-India'],
    targetIndustries: ['Healthcare', 'Clinics', 'Diagnostics', 'Pharmaceuticals', 'Wellness'],
    promptContext: 'Honoring Dr. Bidhan Chandra Roy, gratitude to medical professionals, clinical excellence, preventive vigilance, tireless dedication to saving lives.'
  },
  {
    eventName: 'Chartered Accountants (CA) Day',
    eventDate: '2026-07-01',
    regions: ['Pan-India'],
    targetIndustries: ['Financial Services', 'Fintech', 'Legal', 'Consulting'],
    promptContext: 'Foundation of ICAI, financial transparency, tax compliance, corporate governance, trusted advisors to Indian business growth.'
  },
  {
    eventName: 'National Handloom Day',
    eventDate: '2026-08-07',
    regions: ['Pan-India'],
    targetIndustries: ['Apparel', 'Fashion', 'Retail', 'Crafts'],
    promptContext: 'Celebrating Indian weavers, khadi, silk, artisanal heritage, sustainable handloom fashion, Make in India.'
  },
  {
    eventName: 'Independence Day',
    eventDate: '2026-08-15',
    regions: ['Pan-India'],
    targetIndustries: ['All'],
    promptContext: 'National sovereignty, tricolor pride (Tiranga), sacrifice of freedom fighters, collective economic progress and unity.'
  },
  {
    eventName: 'Onam (Thiruvonam)',
    eventDate: '2026-08-25',
    regions: ['Kerala', 'South India'],
    targetIndustries: ['Retail', 'Hospitality', 'Textiles', 'Jewelry', 'Consumer Tech'],
    promptContext: 'Homecoming of legendary King Mahabali, intricate floral Pookkalam carpets, Onasadya grand feast, boat races (Vallam Kali), state-wide festive shopping.'
  },
  {
    eventName: 'Raksha Bandhan',
    eventDate: '2026-08-28',
    regions: ['North India', 'Central India', 'Pan-India'],
    targetIndustries: ['Retail', 'Jewelry', 'Gifting', 'F&B', 'Fintech'],
    promptContext: 'Sacred sibling bond, promise of lifelong protection, gifting, traditional sweets, festive warmth.'
  },
  {
    eventName: 'Janmashtami',
    eventDate: '2026-09-04',
    regions: ['North India', 'Gujarat', 'Maharashtra', 'Pan-India'],
    targetIndustries: ['Retail', 'Food & Dining', 'Culture', 'All'],
    promptContext: 'Birth of Lord Krishna, Dahi Handi festivities, devotion, joy, flute music, festive sweets.'
  },
  {
    eventName: 'Ganesh Chaturthi',
    eventDate: '2026-09-14',
    regions: ['Maharashtra', 'Karnataka', 'Telangana', 'Gujarat', 'Pan-India'],
    targetIndustries: ['Automotive', 'Electronics', 'Real Estate', 'Education', 'All'],
    promptContext: 'Welcoming Lord Ganesha, remover of obstacles (Vighnaharta), auspicious business commencements, Modak sweets, communal ecstasy and wisdom.'
  },
  {
    eventName: 'World Heart Day',
    eventDate: '2026-09-29',
    regions: ['Pan-India', 'Global'],
    targetIndustries: ['Healthcare', 'Diagnostics', 'Fitness', 'Insurance', 'Wellness'],
    promptContext: 'Cardiovascular health awareness, routine lipid and ECG screenings, active living, stress management, preventative cardiology.'
  },
  {
    eventName: 'Navratri & Durga Puja (Maha Saptami to Dashami)',
    eventDate: '2026-10-18',
    regions: ['East India', 'West Bengal', 'Gujarat', 'Pan-India'],
    targetIndustries: ['Retail', 'Fashion', 'Hospitality', 'FMCG', 'Healthcare', 'Jewelry', 'All'],
    promptContext: 'Spiritual victory of good over evil, Divine feminine energy (Shakti), celebration, homecoming, Garba dance, Dhunuchi naach, festive blessings with gold and crimson hues.'
  },
  {
    eventName: 'Karwa Chauth',
    eventDate: '2026-10-29',
    regions: ['North India', 'West India', 'Pan-India'],
    targetIndustries: ['Jewelry', 'Apparel', 'Beauty & Salon', 'Hospitality'],
    promptContext: 'Marital devotion, moonlight fasting ritual, mehndi adornments, festive attire, gifts of affection and lifelong health blessings.'
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
    eventName: 'Bhai Dooj',
    eventDate: '2026-11-10',
    regions: ['Pan-India'],
    targetIndustries: ['Gifting', 'Retail', 'Jewelry', 'Dining'],
    promptContext: 'Celebration of brother-sister bond, teeka ceremony, sweet exchanges, prayers for longevity and happiness.'
  },
  {
    eventName: 'Chhath Puja',
    eventDate: '2026-11-14',
    regions: ['Bihar', 'Jharkhand', 'Eastern Uttar Pradesh', 'Pan-India'],
    targetIndustries: ['Retail', 'Services', 'Community Brands', 'FMCG'],
    promptContext: 'Ancient Vedic reverence to Surya (Sun God) and Chhathi Maiya, purity, nature gratitude, riverside Arghya at sunset and sunrise, resilience and discipline.'
  },
  {
    eventName: 'Guru Nanak Jayanti (Gurpurab)',
    eventDate: '2026-11-24',
    regions: ['Punjab', 'North India', 'Pan-India', 'Global'],
    targetIndustries: ['All', 'Hospitality', 'Community Services'],
    promptContext: 'Universal brotherhood, selfless service (Seva), Langar community kitchen, truth, humility and spiritual devotion.'
  },
  {
    eventName: 'Christmas & Winter Holiday Season',
    eventDate: '2026-12-25',
    regions: ['Pan-India', 'Global'],
    targetIndustries: ['Retail', 'Hospitality', 'Dining', 'Travel', 'All'],
    promptContext: 'Joy of giving, festive illumination, year-end gratitude, community warmth, holiday season promotions.'
  },
  {
    eventName: 'New Year\'s Eve & 2027 Kickoff',
    eventDate: '2026-12-31',
    regions: ['Pan-India', 'Global'],
    targetIndustries: ['All'],
    promptContext: 'Reflecting on past milestones, welcoming fresh ambitions, health resolutions, business optimism and customer appreciation.'
  }
];

async function seed() {
  console.log('Seeding', EVENTS.length, 'events into Neon PostgreSQL...');
  let inserted = 0;
  for (const e of EVENTS) {
    await sql.query(
      `INSERT INTO cultural_events_calendar (event_name, event_date, regions, target_industries, prompt_context) 
       VALUES ($1, $2, $3, $4, $5)`,
      [e.eventName, e.eventDate, e.regions, e.targetIndustries, e.promptContext]
    );
    inserted++;
  }
  console.log('Successfully seeded', inserted, 'events into cultural_events_calendar!');
}

seed().catch(console.error);

