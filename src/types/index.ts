export type SubscriptionTier = 'starter' | 'growth' | 'agency';

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

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  subscription_tier: SubscriptionTier;
  whatsapp_admin_phone: string;
  whatsapp_country_code: string;
  timezone: string;
  auto_commit_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandVisualIdentity {
  primary_hex: string;
  secondary_hex: string;
  accent_hex: string;
  font_family: string;
  logo_url: string | null;
  watermark_opacity: number;
}

export interface BrandToneOfVoice {
  style: 'professional_warm' | 'clinical_empathetic' | 'witty_energetic' | 'authoritative_thought_leader';
  formality: 'casual' | 'semi-formal' | 'formal';
  archetype: string;
  sample_phrases?: string[];
}

export interface ContentPillar {
  name: string;
  weight: number; // percentage (e.g. 35)
}

export interface BrandProfile {
  id: string;
  workspace_id: string;
  industry: string;
  website_url?: string;
  google_business_url?: string;
  tagline?: string;
  core_offerings: string[];
  tone_of_voice: BrandToneOfVoice;
  visual_identity: BrandVisualIdentity;
  content_pillars: ContentPillar[];
  negative_constraints: string[];
  target_audience_description?: string;
  created_at: string;
  updated_at: string;
}

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

// ============================================================================
// Unified Multi-Channel Inbox, Automations & Collaboration Types
// ============================================================================

export type ConversationChannel = 'whatsapp' | 'instagram' | 'messenger' | 'email';

export type ConversationStatus = 'open' | 'waiting' | 'resolved' | 'snoozed';

export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'specialist' | 'receptionist' | 'sales' | 'ai_bot';
  avatar?: string;
  isOnline: boolean;
  activeChatsCount: number;
}

export interface InboxMessage {
  id: string;
  conversationId: string;
  channel: ConversationChannel;
  sender: 'customer' | 'agent' | 'ai_bot';
  senderName?: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isInternalNote?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  attachments?: {
    type: 'image' | 'document' | 'audio';
    url: string;
    title?: string;
  }[];
  aiGenerated?: boolean;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  customerName: string;
  customerHandle: string; // Phone number, @handle, or email
  customerAvatar?: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  priority: ConversationPriority;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  assignedTo?: string; // TeamMember id
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'urgent';
  campaignAttribution?: {
    campaignId?: string;
    campaignName: string;
    triggerDate: string;
    channel: SocialPlatform;
  };
  crmData: {
    phone?: string;
    email?: string;
    city?: string;
    totalSpend?: string;
    patientOrClientType?: string;
    lastVisitDate?: string;
    notes?: string;
  };
  messages: InboxMessage[];
}

export interface AutomationFlowRule {
  id: string;
  name: string;
  description: string;
  triggerType: 'KEYWORD' | 'OFF_HOURS' | 'NEW_CONVERSATION' | 'CAMPAIGN_REPLY';
  channel: ConversationChannel | 'all';
  keywords?: string[];
  conditions: string;
  actions: {
    type: 'AUTO_REPLY' | 'ASSIGN_AGENT' | 'APPLY_TAG' | 'ROUTE_SPECIALIST';
    payload: string;
  }[];
  enabled: boolean;
  triggerCount: number;
}

export interface InboxAnalyticsSummary {
  totalConversations: number;
  averageFirstResponseMinutes: number;
  resolutionRatePercent: number;
  aiHandledPercent: number;
  csatScore: number;
  channelDistribution: {
    whatsapp: number;
    instagram: number;
    messenger: number;
    email: number;
  };
}
