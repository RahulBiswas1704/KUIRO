import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

function initDb() {
  if (connectionString && !connectionString.includes('ep-cool-sample')) {
    try {
      const sql = neon(connectionString);
      return drizzle(sql, { schema });
    } catch (err) {
      console.warn('[Neon DB] Connection failed, falling back to mock memory store:', err);
      return null;
    }
  }
  return null;
}

export const db = initDb();
export const isDbConnected = !!db;

export * from './schema';

// In-Memory Mock Store for out-of-the-box local developer experience
export const mockDb = {
  workspaces: [
    {
      id: 'ws-apex-101',
      name: 'Apex Diagnostic & Wellness Clinic',
      subscriptionTier: 'GROWTH',
      whatsappAdminPhone: '+919876543210',
      createdAt: new Date().toISOString(),
    },
  ],
  brandProfiles: [
    {
      id: 'bp-apex-101',
      workspaceId: 'ws-apex-101',
      industry: 'Healthcare & Preventive Diagnostics',
      websiteUrl: 'https://apexdiagnostics.in',
      toneOfVoice: {
        style: 'clinical_empathetic',
        formality: 'semi-formal',
        archetype: 'compassionate_caregiver',
        samplePhrases: [
          'Early diagnosis turns anxieties into peace of mind.',
          'Your health journey matters to our doctors.',
        ],
      },
      visualIdentity: {
        primaryHex: '#FF7A00',
        secondaryHex: '#0B0F14',
        accentHex: '#10B981',
        logoUrl: '/brand/kuiro-symbol.png',
        fontFamily: 'Sora',
        watermarkOpacity: 0.95,
      },
      contentPillars: [
        { name: 'Preventive Screenings & Health Packages', weight: 40 },
        { name: 'Regional & Cultural Festival Wellness', weight: 30 },
        { name: 'Doctor Insights & Clinical FAQ', weight: 30 },
      ],
      negativeConstraints: [
        'Never mention competitor clinics (e.g. Apollo, Lal Pathlabs)',
        'Never promise 100% cure guarantees',
        'Maintain medical ethics and patient privacy guidelines',
      ],
    },
  ],
  campaigns: [
    {
      id: 'camp-dh-2026',
      workspaceId: 'ws-apex-101',
      triggerType: 'FESTIVAL',
      topicSummary: 'Dhanteras & Diwali Preventive Health Awareness Campaign',
      status: 'AUTO_QUEUED',
      revisionCount: 0,
      generateAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      publishAt: new Date(Date.now() + 38 * 3600 * 1000).toISOString(), // 38h remaining in 48h loop
      inngestRunId: 'run_inngest_48h_dhanteras_001',
    },
  ],
};
