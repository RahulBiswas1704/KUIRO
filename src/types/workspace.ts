export type SubscriptionTier = 'starter' | 'growth' | 'agency';

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
