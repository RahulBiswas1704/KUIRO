export type TriggerType = 'FESTIVAL' | 'EVERGREEN' | 'TREND' | 'MANUAL';

export type CampaignStatus = 
  | 'GENERATING'
  | 'REVIEW_PENDING'
  | 'AUTO_QUEUED' // Backwards-compatible alias for REVIEW_PENDING
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'PAUSED'
  | 'READY_TO_PUBLISH'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'CANCELLED'
  | 'SKIPPED'
  | 'REVISING';

export interface AutopilotPolicyConfig {
  timezone: string; // e.g. 'Asia/Kolkata'
  autoCommitEnabled: boolean;
  reviewWindowHours: number; // default 48
  publishHourOfDay: number; // default 10 (10:00 AM local time)
  lateRevisionGraceMinutes: number; // default 60
}

export type SocialPlatform = 
  | 'facebook' 
  | 'instagram' 
  | 'whatsapp' 
  | 'linkedin' 
  | 'x' 
  | 'youtube'
  | 'email';

export interface CulturalEvent {
  id: string;
  event_name: string;
  event_date: string;
  category: 'FESTIVAL' | 'NATIONAL' | 'HEALTH_AWARENESS' | 'INDUSTRY' | 'INTERNATIONAL';
  regions: string[];
  target_industries: string[];
  prompt_context: string;
  design_suggestions?: {
    theme: string;
    suggested_palettes: string[];
  };
  is_recurring_yearly: boolean;
}

export interface ScheduledCampaign {
  id: string;
  workspace_id: string;
  trigger_type: TriggerType;
  cultural_event_id?: string;
  topic_summary: string;
  status: CampaignStatus;
  generate_at: string;
  publish_at: string;
  inngest_run_id?: string;
  failure_reason?: string;
  diagnostic_metadata?: any;
  lock_acquired_at?: string;
  revision_count: number;
  last_revision_instruction?: string;
  ai_critic_overall_score?: number;
  created_at: string;
  updated_at: string;
}

export interface PlatformPost {
  id: string;
  campaign_id: string;
  platform: SocialPlatform;
  caption_text: string;
  first_comment_text?: string;
  email_subject?: string;
  email_html?: string;
  hashtags: string[];
  media_urls: string[];
  media_type: 'IMAGE' | 'CAROUSEL' | 'VIDEO' | 'TEXT_ONLY';
  aspect_ratio: '1:1' | '4:5' | '9:16' | '16:9';
  ai_critic_breakdown?: {
    hook: number;
    brand_alignment: number;
    cta: number;
  };
  platform_post_id?: string;
  published_at?: string;
  error_message?: string;
  metrics: {
    impressions: number;
    likes: number;
    shares: number;
    comments: number;
  };
  created_at: string;
}

export interface GeneratedAssetPayload {
  platform: SocialPlatform;
  caption: string;
  firstComment?: string;
  emailSubject?: string;
  emailHtml?: string;
  hashtags: string[];
  mediaUrls: string[];
  mediaType: 'IMAGE' | 'CAROUSEL' | 'VIDEO' | 'TEXT_ONLY';
  aspectRatio: '1:1' | '4:5' | '9:16' | '16:9';
  criticScore?: {
    hook: number;
    brand_alignment: number;
    cta: number;
  };
}

// 8. Six-Dimension Structured AI Critic Evaluation Types
export interface CriticDimensionScores {
  brandFidelity: number;      // 0-100: Does content follow Brand Brain?
  culturalRelevance: number;  // 0-100: Are cultural/regional references accurate and respectful?
  platformFit: number;        // 0-100: Does it suit platform formatting & unit economics?
  conversionPotential: number;// 0-100: Clear business objective & compelling CTA?
  languageQuality: number;    // 0-100: Clear, natural, grammatical, no corporate buzzwords?
  safetyCompliance: number;   // 0-100: Avoids prohibited or risky claims?
}

export type CriticIssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type CriticIssueCategory = 'brand' | 'cultural' | 'platform' | 'conversion' | 'language' | 'safety' | 'compliance';

export interface CriticIssue {
  severity: CriticIssueSeverity;
  category: CriticIssueCategory;
  message: string;
  platform?: string;
}

export interface StructuredEvaluationResult {
  overallScore: number;       // 0-100 composite score
  scores: CriticDimensionScores;
  issues: CriticIssue[];
  approved: boolean;          // true if overallScore >= 80, no critical/high issues, deterministic safety passes
  suggestedImprovements: string[];
  contentVersionHash?: string;
  evaluatedAt?: string;
  platformBreakdown?: Record<string, {
    score: number;
    passed: boolean;
    issues: CriticIssue[];
    suggestedRefinement?: string;
  }>;
}
