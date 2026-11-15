CREATE TABLE "realtime_pubsub_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel" text NOT NULL,
	"workspace_id" uuid,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "realtime_pubsub_events" ADD CONSTRAINT "realtime_pubsub_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pubsub_channel_created" ON "realtime_pubsub_events" USING btree ("channel","created_at");--> statement-breakpoint
CREATE INDEX "idx_pubsub_ws_created" ON "realtime_pubsub_events" USING btree ("workspace_id","created_at");