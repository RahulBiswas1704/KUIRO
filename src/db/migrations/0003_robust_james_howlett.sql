CREATE TABLE "system_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"severity" text DEFAULT 'WARNING' NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"workspace_id" uuid,
	"correlation_id" text,
	"details" jsonb,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"dispatched_channels" jsonb,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "system_alerts" ADD CONSTRAINT "system_alerts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_system_alerts_category_created" ON "system_alerts" USING btree ("category","created_at");--> statement-breakpoint
CREATE INDEX "idx_system_alerts_severity_created" ON "system_alerts" USING btree ("severity","created_at");--> statement-breakpoint
CREATE INDEX "idx_system_alerts_workspace_created" ON "system_alerts" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_system_alerts_status_created" ON "system_alerts" USING btree ("status","created_at");