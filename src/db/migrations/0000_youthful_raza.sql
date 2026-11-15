CREATE TABLE IF NOT EXISTS "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_provider_account_unique" UNIQUE("provider_id","account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operator_email" text NOT NULL,
	"action" text NOT NULL,
	"resource" text,
	"status" text NOT NULL,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "brand_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"industry" text NOT NULL,
	"website_url" text,
	"tone_of_voice" jsonb NOT NULL,
	"visual_identity" jsonb NOT NULL,
	"content_pillars" jsonb NOT NULL,
	"negative_constraints" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brand_profiles_workspace_id_unique" UNIQUE("workspace_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaign_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"revision_number" integer NOT NULL,
	"instruction" text NOT NULL,
	"transcript" text,
	"language_detected" text,
	"audio_media_id" text,
	"requested_by" text NOT NULL,
	"requester_name" text,
	"snapshot_posts" jsonb NOT NULL,
	"revision_summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_handle" text NOT NULL,
	"customer_avatar" text,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"assigned_to" uuid,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"sentiment" text DEFAULT 'NEUTRAL' NOT NULL,
	"campaign_source" text,
	"crm_data" jsonb,
	"last_message_text" text NOT NULL,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"last_customer_message_at" timestamp with time zone,
	"window_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cultural_events_calendar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" text NOT NULL,
	"event_date" date NOT NULL,
	"regions" text[] NOT NULL,
	"target_industries" text[] NOT NULL,
	"prompt_context" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inbox_automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"trigger_type" text NOT NULL,
	"channel" text DEFAULT 'all' NOT NULL,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"conditions" text NOT NULL,
	"actions" jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"trigger_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inbox_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"sender_type" text NOT NULL,
	"sender_name" text,
	"content" text NOT NULL,
	"provider_message_id" text,
	"delivery_status" text DEFAULT 'delivered' NOT NULL,
	"message_type" text DEFAULT 'text' NOT NULL,
	"delivery_error" text,
	"read_state" boolean DEFAULT false NOT NULL,
	"is_internal_note" boolean DEFAULT false NOT NULL,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"attachments" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"order_id" text NOT NULL,
	"payment_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"status" text NOT NULL,
	"gateway" text DEFAULT 'razorpay' NOT NULL,
	"plan_tier" text NOT NULL,
	"invoice_number" text,
	"raw_event_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_payment_id_unique" UNIQUE("payment_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"caption_text" text NOT NULL,
	"first_comment_text" text,
	"email_subject" text,
	"email_html" text,
	"media_urls" text[] DEFAULT '{}' NOT NULL,
	"aspect_ratio" text DEFAULT '4:5' NOT NULL,
	"ai_critic_score" integer DEFAULT 90 NOT NULL,
	"platform_post_id" text,
	"metrics" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "processed_webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"gateway" text NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduled_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"trigger_type" text NOT NULL,
	"topic_summary" text NOT NULL,
	"status" text DEFAULT 'GENERATING' NOT NULL,
	"revision_count" integer DEFAULT 0 NOT NULL,
	"generate_at" timestamp with time zone NOT NULL,
	"publish_at" timestamp with time zone NOT NULL,
	"inngest_run_id" text,
	"failure_reason" text,
	"diagnostic_metadata" jsonb,
	"lock_acquired_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"platform_account_id" text NOT NULL,
	"access_token_encrypted" text NOT NULL,
	"refresh_token_encrypted" text,
	"token_expires_at" timestamp with time zone,
	"status" text DEFAULT 'CONNECTED' NOT NULL,
	"granted_scopes" text[] DEFAULT '{}' NOT NULL,
	"refresh_token_expires_at" timestamp with time zone,
	"last_refreshed_at" timestamp with time zone,
	"last_api_check_at" timestamp with time zone,
	"last_error" text,
	"key_version" text DEFAULT 'v1' NOT NULL,
	"token_version" integer DEFAULT 1 NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "social_connections_ws_platform_acc_unique" UNIQUE("workspace_id","platform","platform_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"plan_tier" text NOT NULL,
	"billing_cycle" text DEFAULT 'monthly' NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"current_period_start" timestamp with time zone DEFAULT now() NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"razorpay_subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"role" text DEFAULT 'Founder',
	"email_verified" boolean DEFAULT false,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"type" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "verification_tokens_ident_token_unique" UNIQUE("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'MARKETER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_members_ws_user_unique" UNIQUE("workspace_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"subscription_tier" text DEFAULT 'GROWTH' NOT NULL,
	"whatsapp_admin_phone" text,
	"timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
	"auto_commit_enabled" boolean DEFAULT true NOT NULL,
	"review_window_hours" integer DEFAULT 48 NOT NULL,
	"publish_hour_of_day" integer DEFAULT 10 NOT NULL,
	"late_revision_grace_minutes" integer DEFAULT 60 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_user_id_users_id_fk') THEN ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_profiles_workspace_id_workspaces_id_fk') THEN ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'campaign_revisions_campaign_id_scheduled_campaigns_id_fk') THEN ALTER TABLE "campaign_revisions" ADD CONSTRAINT "campaign_revisions_campaign_id_scheduled_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."scheduled_campaigns"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_workspace_id_workspaces_id_fk') THEN ALTER TABLE "conversations" ADD CONSTRAINT "conversations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_assigned_to_users_id_fk') THEN ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inbox_automations_workspace_id_workspaces_id_fk') THEN ALTER TABLE "inbox_automations" ADD CONSTRAINT "inbox_automations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inbox_messages_conversation_id_conversations_id_fk') THEN ALTER TABLE "inbox_messages" ADD CONSTRAINT "inbox_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_workspace_id_workspaces_id_fk') THEN ALTER TABLE "payments" ADD CONSTRAINT "payments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'platform_posts_campaign_id_scheduled_campaigns_id_fk') THEN ALTER TABLE "platform_posts" ADD CONSTRAINT "platform_posts_campaign_id_scheduled_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."scheduled_campaigns"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scheduled_campaigns_workspace_id_workspaces_id_fk') THEN ALTER TABLE "scheduled_campaigns" ADD CONSTRAINT "scheduled_campaigns_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_user_id_users_id_fk') THEN ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'social_connections_workspace_id_workspaces_id_fk') THEN ALTER TABLE "social_connections" ADD CONSTRAINT "social_connections_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_workspace_id_workspaces_id_fk') THEN ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspace_members_workspace_id_workspaces_id_fk') THEN ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspace_members_user_id_users_id_fk') THEN ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspaces_owner_id_users_id_fk') THEN ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_accounts_user_id" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_admin_audit_logs_operator" ON "admin_audit_logs" USING btree ("operator_email","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_admin_audit_logs_created_at" ON "admin_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_brand_profiles_ws_id" ON "brand_profiles" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_campaign_rev_campaign_num" ON "campaign_revisions" USING btree ("campaign_id","revision_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_conv_ws_updated" ON "conversations" USING btree ("workspace_id","updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_conv_ws_channel_status" ON "conversations" USING btree ("workspace_id","channel","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_conv_ws_handle" ON "conversations" USING btree ("workspace_id","customer_handle");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cultural_events_date" ON "cultural_events_calendar" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_automations_ws_enabled" ON "inbox_automations" USING btree ("workspace_id","enabled");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_msgs_conv_created" ON "inbox_messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_msgs_provider_msg_id" ON "inbox_messages" USING btree ("provider_message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_ws_created" ON "payments" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_order_id" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_platform_posts_campaign_platform" ON "platform_posts" USING btree ("campaign_id","platform");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_campaigns_ws_status_publish" ON "scheduled_campaigns" USING btree ("workspace_id","status","publish_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_campaigns_publish_at" ON "scheduled_campaigns" USING btree ("publish_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_token" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_connections_ws_platform" ON "social_connections" USING btree ("workspace_id","platform");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_connections_platform_acc" ON "social_connections" USING btree ("platform","platform_account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subscriptions_ws_status" ON "subscriptions" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_verification_tokens_token" ON "verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workspace_members_ws_user" ON "workspace_members" USING btree ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workspaces_owner_id" ON "workspaces" USING btree ("owner_id");