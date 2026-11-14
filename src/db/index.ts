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
      id: 'ws-sharma-101',
      name: 'Sharma Heritage Retail & Studio',
      subscriptionTier: 'GROWTH',
      whatsappAdminPhone: '+919876543210',
      createdAt: new Date().toISOString(),
    },
  ],
  brandProfiles: [
    {
      id: 'bp-sharma-101',
      workspaceId: 'ws-sharma-101',
      industry: 'Retail, Commerce & Professional Services',
      websiteUrl: 'https://sharmaheritage.in',
      toneOfVoice: {
        style: 'professional_warm',
        formality: 'semi-formal',
        archetype: 'trusted_craftsman_and_advisor',
        samplePhrases: [
          'Artisanal handlooms woven with timeless Indian heritage.',
          'Bespoke craftsmanship tailored for your family celebrations.',
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
        { name: 'Pure Silk & Handcrafted Weaves', weight: 40 },
        { name: 'Regional & Cultural Festival Lookbooks', weight: 30 },
        { name: 'Behind the Loom & Artisan Stories', weight: 30 },
      ],
      negativeConstraints: [
        'Never denigrate competitors or publish unverified claims',
        'Ensure all pricing and offers carry explicit validity terms',
        'Maintain authentic artisan handloom quality guidelines',
      ],
    },
  ],
  campaigns: [
    {
      id: 'camp-dh-2026',
      workspaceId: 'ws-sharma-101',
      triggerType: 'FESTIVAL',
      topicSummary: 'Dhanteras & Diwali Festive Pure Silk & Heritage Weaves Showcase',
      status: 'AUTO_QUEUED',
      revisionCount: 0,
      generateAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      publishAt: new Date(Date.now() + 38 * 3600 * 1000).toISOString(), // 38h remaining in 48h loop
      inngestRunId: 'run_inngest_48h_dhanteras_001',
    },
  ],
};
