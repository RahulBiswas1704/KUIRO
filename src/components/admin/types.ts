export type AdminTabId =
  | 'overview'
  | 'workspaces'
  | 'users'
  | 'campaigns'
  | 'calendar'
  | 'optimizer'
  | 'audit';

export interface MetricOverview {
  users: number;
  workspaces: number;
  brandProfiles: number;
  campaigns: number;
  platformPosts: number;
  conversations: number;
  messages: number;
  calendarEvents: number;
  activeSessions: number;
}

export interface SystemHealth {
  database: { status: string; branch?: string; engine?: string; latencyMs: number };
  geminiAi: { status: string; model?: string };
  whatsappCloud: { status: string; graphApiVersion?: string; phoneId?: string };
  inngestEngine: { status: string; scheduler?: string };
  storage?: {
    name: string;
    status: string;
    bucket: string;
    provider: string;
    latencyMs?: number;
  };
  cloudflareR2?: { status: string; bucket: string; latencyMs?: number };
  resendEmail?: { status: string; from: string };
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
  badgeColor?: string;
}

export interface AdminWorkspace {
  id: string;
  name: string;
  subscriptionTier: 'STARTER' | 'GROWTH' | 'AGENCY' | string;
  whatsappAdminPhone: string | null;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
  brandProfile: {
    industry: string;
    websiteUrl: string;
    primaryHex: string;
    fontFamily: string;
    style: string;
    pillarsCount: number;
  } | null;
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  workspacesCount: number;
  workspaces: Array<{ id: string; name: string; tier: string }>;
  activeSessionsCount: number;
  lastSessionAgent: string;
}

export interface AdminCampaignPost {
  id: string;
  platform: string;
  caption: string;
  firstComment?: string | null;
  emailSubject?: string | null;
  aiCriticScore: number;
  mediaUrls: string[];
  aspectRatio: string;
}

export interface AdminCampaign {
  id: string;
  workspaceId: string;
  workspaceName: string;
  triggerType: string;
  topicSummary: string;
  status: string;
  revisionCount: number;
  publishAt: string;
  postsCount: number;
  avgCriticScore: number;
  countdownFormatted: string;
  isExpired: boolean;
  posts: AdminCampaignPost[];
}

export interface AdminCalendarEvent {
  id: string;
  eventName: string;
  eventDate: string;
  regions: string[];
  targetIndustries: string[];
  promptContext: string;
  daysRemaining?: number;
  isTriggerWindow?: boolean;
}

export interface AdminOptimizerConfig {
  aiCritic: {
    minimumPassScore: number;
    hookWeight: number;
    brandAlignmentWeight: number;
    ctaWeight: number;
    complianceWeight: number;
    strictNegativeConstraints: boolean;
  };
  modelRouting: {
    primaryModel: string;
    fallbackModel: string;
    temperature: number;
    maxOutputTokens: number;
    frequencyPenalty: number;
  };
  unitEconomics: {
    enforceXLinkInReply: boolean;
    estimatedMonthlySavingsUsd: number;
    aspectRatioRule: string;
  };
  autonomousEngine: {
    autoCommitWindowHours: number;
    maxFreeRevisions: number;
    radarSweepFrequencyCron: string;
    voiceTranscriptionEngine: string;
  };
}

export interface OptimizerEnvironmentKeys {
  hasGeminiKey: boolean;
  hasInngestKey: boolean;
  hasWhatsAppToken: boolean;
  hasObjectStorage: boolean;
  hasR2Bucket: boolean;
  hasResendKey: boolean;
  hasDatabaseUrl: boolean;
}

export interface AdminAuditLog {
  id: string;
  operatorEmail: string;
  action: string;
  resource?: string | null;
  status: string;
  ipAddress?: string | null;
  createdAt: string;
  details?: Record<string, unknown> | null;
}

export interface AdminAlert {
  id: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' | string;
  category: string;
  title: string;
  message: string;
  workspaceId?: string | null;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | string;
  createdAt: string;
  resolvedAt?: string | null;
}

export function formatShortDate(value?: string | null, withTime = false): string {
  if (!value) return '—';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  if (withTime) {
    return dt.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return dt.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isHealthyStatus(status?: string): boolean {
  if (!status) return false;
  return ['HEALTHY', 'OPERATIONAL'].includes(status.toUpperCase());
}
