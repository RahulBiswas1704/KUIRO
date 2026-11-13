import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  integer, 
  jsonb, 
  date, 
  boolean 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Better Auth / User Authentication Tables
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: text('role').default('Founder'),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Workspaces (Multi-Tenant Isolation)
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  subscriptionTier: text('subscription_tier', { 
    enum: ['STARTER', 'GROWTH', 'AGENCY'] 
  }).default('GROWTH').notNull(),
  whatsappAdminPhone: text('whatsapp_admin_phone'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. The Brand Brain (Persistent Knowledge & Guardrails)
export const brandProfiles = pgTable('brand_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull().unique(),
  industry: text('industry').notNull(),
  websiteUrl: text('website_url'),
  toneOfVoice: jsonb('tone_of_voice').$type<{
    style: 'professional_warm' | 'clinical_empathetic' | 'witty_energetic' | 'authoritative_thought_leader';
    formality: 'casual' | 'semi-formal' | 'formal';
    archetype: string;
    samplePhrases?: string[];
  }>().notNull(),
  visualIdentity: jsonb('visual_identity').$type<{
    primaryHex: string;
    secondaryHex: string;
    accentHex?: string;
    logoUrl?: string;
    fontFamily: string;
    watermarkOpacity?: number;
  }>().notNull(),
  contentPillars: jsonb('content_pillars').$type<Array<{
    name: string;
    weight: number;
    description?: string;
  }>>().notNull(),
  negativeConstraints: text('negative_constraints').array().default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Encrypted Token Vault (OAuth Connections)
export const socialConnections = pgTable('social_connections', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  platform: text('platform', { 
    enum: ['facebook', 'instagram', 'whatsapp', 'linkedin', 'x', 'youtube', 'email'] 
  }).notNull(),
  platformAccountId: text('platform_account_id').notNull(),
  accessTokenEncrypted: text('access_token_encrypted').notNull(),
  refreshTokenEncrypted: text('refresh_token_encrypted'),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
  status: text('status', { 
    enum: ['CONNECTED', 'EXPIRED', 'REVOKED'] 
  }).default('CONNECTED').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. 365-Day Cultural & Regional Calendar Triggers
export const culturalEventsCalendar = pgTable('cultural_events_calendar', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventName: text('event_name').notNull(),
  eventDate: date('event_date').notNull(),
  regions: text('regions').array().notNull(), // e.g. ['East India', 'West Bengal', 'Pan-India']
  targetIndustries: text('target_industries').array().notNull(), // e.g. ['Retail', 'Healthcare', 'All']
  promptContext: text('prompt_context').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 6. Scheduled Campaigns (The 48-Hour State Machine)
export const scheduledCampaigns = pgTable('scheduled_campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  triggerType: text('trigger_type', { 
    enum: ['FESTIVAL', 'EVERGREEN', 'TREND', 'MANUAL'] 
  }).notNull(),
  topicSummary: text('topic_summary').notNull(),
  status: text('status', { 
    enum: ['GENERATING', 'AUTO_QUEUED', 'APPROVED', 'PAUSED', 'PUBLISHED', 'FAILED'] 
  }).default('GENERATING').notNull(),
  revisionCount: integer('revision_count').default(0).notNull(), // Max 2 free voice/text revisions
  generateAt: timestamp('generate_at', { withTimezone: true }).notNull(),
  publishAt: timestamp('publish_at', { withTimezone: true }).notNull(), // Exactly 48h after generation
  inngestRunId: text('inngest_run_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 7. Platform-Native Posts (Channel Payloads & Critic Scores)
export const platformPosts = pgTable('platform_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => scheduledCampaigns.id, { onDelete: 'cascade' }).notNull(),
  platform: text('platform', { 
    enum: ['facebook', 'instagram', 'whatsapp', 'linkedin', 'x', 'youtube', 'email'] 
  }).notNull(),
  captionText: text('caption_text').notNull(),
  firstCommentText: text('first_comment_text'), // Holds external link for X to avoid link surcharge
  emailSubject: text('email_subject'),
  emailHtml: text('email_html'),
  mediaUrls: text('media_urls').array().default([]).notNull(), // Cloudflare R2 public URLs
  aspectRatio: text('aspect_ratio').default('4:5').notNull(), // 4:5, 1:1, 16:9, 9:16
  aiCriticScore: integer('ai_critic_score').default(90).notNull(), // 0-100 rubric score
  platformPostId: text('platform_post_id'),
  metrics: jsonb('metrics').$type<{
    impressions?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    leadsGenerated?: number;
  }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 8. Unified Multi-Channel Customer Inbox & Conversations Hub
export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  channel: text('channel', { 
    enum: ['whatsapp', 'instagram', 'messenger', 'email'] 
  }).notNull(),
  customerName: text('customer_name').notNull(),
  customerHandle: text('customer_handle').notNull(),
  customerAvatar: text('customer_avatar'),
  status: text('status', {
    enum: ['OPEN', 'WAITING', 'RESOLVED', 'SNOOZED']
  }).default('OPEN').notNull(),
  priority: text('priority', {
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT']
  }).default('NORMAL').notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  tags: text('tags').array().default([]).notNull(),
  sentiment: text('sentiment', {
    enum: ['POSITIVE', 'NEUTRAL', 'URGENT']
  }).default('NEUTRAL').notNull(),
  campaignSource: text('campaign_source'),
  crmData: jsonb('crm_data').$type<{
    phone?: string;
    email?: string;
    city?: string;
    totalSpend?: string;
    patientOrClientType?: string;
    lastVisitDate?: string;
    notes?: string;
  }>(),
  lastMessageText: text('last_message_text').notNull(),
  unreadCount: integer('unread_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const inboxMessages = pgTable('inbox_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  channel: text('channel', {
    enum: ['whatsapp', 'instagram', 'messenger', 'email']
  }).notNull(),
  senderType: text('sender_type', {
    enum: ['CUSTOMER', 'AGENT', 'AI_BOT']
  }).notNull(),
  senderName: text('sender_name'),
  content: text('content').notNull(),
  isInternalNote: boolean('is_internal_note').default(false).notNull(),
  aiGenerated: boolean('ai_generated').default(false).notNull(),
  attachments: jsonb('attachments').$type<Array<{
    type: 'image' | 'document' | 'audio';
    url: string;
    title?: string;
  }>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const inboxAutomations = pgTable('inbox_automations', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  triggerType: text('trigger_type', {
    enum: ['KEYWORD', 'OFF_HOURS', 'NEW_CONVERSATION', 'CAMPAIGN_REPLY']
  }).notNull(),
  channel: text('channel', {
    enum: ['whatsapp', 'instagram', 'messenger', 'email', 'all']
  }).default('all').notNull(),
  keywords: text('keywords').array().default([]).notNull(),
  conditions: text('conditions').notNull(),
  actions: jsonb('actions').$type<Array<{
    type: 'AUTO_REPLY' | 'ASSIGN_AGENT' | 'APPLY_TAG' | 'ROUTE_SPECIALIST';
    payload: string;
  }>>().notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  triggerCount: integer('trigger_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const workspaceRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerId], references: [users.id] }),
  brandProfile: one(brandProfiles, { fields: [workspaces.id], references: [brandProfiles.workspaceId] }),
  socialConnections: many(socialConnections),
  campaigns: many(scheduledCampaigns),
  conversations: many(conversations),
  inboxAutomations: many(inboxAutomations),
}));

export const conversationRelations = relations(conversations, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [conversations.workspaceId], references: [workspaces.id] }),
  assignedUser: one(users, { fields: [conversations.assignedTo], references: [users.id] }),
  messages: many(inboxMessages),
}));

export const inboxMessageRelations = relations(inboxMessages, ({ one }) => ({
  conversation: one(conversations, { fields: [inboxMessages.conversationId], references: [conversations.id] }),
}));

export const campaignRelations = relations(scheduledCampaigns, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [scheduledCampaigns.workspaceId], references: [workspaces.id] }),
  posts: many(platformPosts),
}));

export const postRelations = relations(platformPosts, ({ one }) => ({
  campaign: one(scheduledCampaigns, { fields: [platformPosts.campaignId], references: [scheduledCampaigns.id] }),
}));

