CREATE TABLE IF NOT EXISTS "durable_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idempotency_key" text NOT NULL,
	"event_type" text NOT NULL,
	"workspace_id" uuid,
	"related_entity_id" text,
	"payload_version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"last_error" text,
	"error_type" text,
	"payload" jsonb,
	"result_payload" jsonb,
	"locked_until" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "durable_events_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'durable_events_workspace_id_workspaces_id_fk') THEN ALTER TABLE "durable_events" ADD CONSTRAINT "durable_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_durable_events_idempotency_key" ON "durable_events" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_durable_events_ws_type_status" ON "durable_events" USING btree ("workspace_id","event_type","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_durable_events_status_locked" ON "durable_events" USING btree ("status","locked_until");
