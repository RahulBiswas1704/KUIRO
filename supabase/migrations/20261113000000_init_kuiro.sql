-- ==============================================================================
-- KUIRO: Database Initialization & Multi-Tenant Schema
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. WORKSPACES (Multi-Tenant Isolation)
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_tier TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'growth', 'agency')),
    whatsapp_admin_phone TEXT NOT NULL,
    whatsapp_country_code TEXT NOT NULL DEFAULT '91',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    auto_commit_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. BRAND PROFILES (The Persistent Brand Brain)
CREATE TABLE public.brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
    industry TEXT NOT NULL,
    website_url TEXT,
    google_business_url TEXT,
    tagline TEXT,
    core_offerings TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    tone_of_voice JSONB NOT NULL DEFAULT '{"style": "professional_warm", "formality": "semi-formal", "archetype": "trusted_expert"}'::jsonb,
    visual_identity JSONB NOT NULL DEFAULT '{
        "primary_hex": "#0284C7",
        "secondary_hex": "#F59E0B",
        "accent_hex": "#10B981",
        "font_family": "Inter",
        "logo_url": null,
        "watermark_opacity": 0.95
    }'::jsonb,
    content_pillars JSONB NOT NULL DEFAULT '[
        {"name": "Educational Tips & Insights", "weight": 35},
        {"name": "Product & Service Highlights", "weight": 25},
        {"name": "Customer Proof & Testimonials", "weight": 20},
        {"name": "Behind-the-Scenes & Founder Voice", "weight": 20}
    ]'::jsonb,
    negative_constraints TEXT[] NOT NULL DEFAULT ARRAY[
        'Never disparage or name direct competitors',
        'No unverified claims or false promises',
        'Maintain industry compliance'
    ],
    target_audience_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SOCIAL CONNECTIONS (Encrypted OAuth Tokens)
CREATE TABLE public.social_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'whatsapp', 'linkedin', 'x', 'youtube')),
    platform_account_id TEXT NOT NULL,
    platform_account_name TEXT,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, platform, platform_account_id)
);

-- 4. 365-DAY CULTURAL & CIVIC EVENTS CALENDAR
CREATE TABLE public.cultural_events_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('FESTIVAL', 'NATIONAL', 'HEALTH_AWARENESS', 'INDUSTRY', 'INTERNATIONAL')),
    regions TEXT[] NOT NULL DEFAULT ARRAY['ALL_INDIA'],
    target_industries TEXT[] NOT NULL DEFAULT ARRAY['ALL'],
    prompt_context TEXT NOT NULL,
    design_suggestions JSONB DEFAULT '{"theme": "celebratory", "suggested_palettes": ["#FF9933", "#138808", "#000080"]}'::jsonb,
    is_recurring_yearly BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cultural_events_date ON public.cultural_events_calendar(event_date);

-- 5. SCHEDULED CAMPAIGNS (The 48-Hour State Machine Coordinator)
CREATE TABLE public.scheduled_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('FESTIVAL', 'EVERGREEN', 'TREND', 'MANUAL')),
    cultural_event_id UUID REFERENCES public.cultural_events_calendar(id),
    topic_summary TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'GENERATING' 
        CHECK (status IN ('GENERATING', 'AUTO_QUEUED', 'REVISING', 'APPROVED', 'SKIPPED', 'PUBLISHING', 'PUBLISHED', 'FAILED')),
    generate_at TIMESTAMPTZ NOT NULL,
    publish_at TIMESTAMPTZ NOT NULL,
    inngest_run_id TEXT,
    revision_count INT NOT NULL DEFAULT 0,
    last_revision_instruction TEXT,
    ai_critic_overall_score NUMERIC(3, 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_scheduled_campaigns_lookup ON public.scheduled_campaigns(workspace_id, status, publish_at);

-- 6. PLATFORM POSTS (Per-channel payload & publication tracking)
CREATE TABLE public.platform_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.scheduled_campaigns(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'whatsapp', 'linkedin', 'x', 'youtube')),
    caption_text TEXT NOT NULL,
    first_comment_text TEXT,
    hashtags TEXT[],
    media_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    media_type TEXT NOT NULL DEFAULT 'IMAGE' CHECK (media_type IN ('IMAGE', 'CAROUSEL', 'VIDEO', 'TEXT_ONLY')),
    aspect_ratio TEXT NOT NULL DEFAULT '4:5' CHECK (aspect_ratio IN ('1:1', '4:5', '9:16', '16:9')),
    ai_critic_breakdown JSONB DEFAULT '{"hook": 9, "brand_alignment": 9, "cta": 8}'::jsonb,
    platform_post_id TEXT,
    published_at TIMESTAMPTZ,
    error_message TEXT,
    metrics JSONB DEFAULT '{"impressions": 0, "likes": 0, "shares": 0, "comments": 0}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_platform_posts_campaign ON public.platform_posts(campaign_id, platform);

-- 7. WHATSAPP LOGS & AUDIO REVISIONS
CREATE TABLE public.whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.scheduled_campaigns(id) ON DELETE SET NULL,
    direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    message_type TEXT NOT NULL CHECK (message_type IN ('TEXT', 'INTERACTIVE_BUTTON', 'AUDIO_VOICE', 'IMAGE', 'TEMPLATE')),
    payload JSONB NOT NULL,
    transcription_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. BRAND KNOWLEDGE EMBEDDINGS (pgvector for RAG inquiries)
CREATE TABLE public.brand_knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    content_chunk TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('WEBSITE', 'FAQ', 'CATALOG', 'BROCHURE')),
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_knowledge_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their owned workspaces"
    ON public.workspaces FOR ALL
    USING (owner_id = auth.uid());

CREATE POLICY "Workspaces isolate brand profiles"
    ON public.brand_profiles FOR ALL
    USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Workspaces isolate social connections"
    ON public.social_connections FOR ALL
    USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Workspaces isolate campaigns"
    ON public.scheduled_campaigns FOR ALL
    USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Campaigns isolate platform posts"
    ON public.platform_posts FOR ALL
    USING (campaign_id IN (
        SELECT id FROM public.scheduled_campaigns WHERE workspace_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        )
    ));
