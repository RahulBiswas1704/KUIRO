export type TriggerType = 'FESTIVAL' | 'EVERGREEN' | 'TREND' | 'MANUAL';

export type CampaignStatus = 
  | 'GENERATING'
  | 'AUTO_QUEUED'
  | 'REVISING'
  | 'APPROVED'
  | 'SKIPPED'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED';

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
