CREATE TABLE "sync_event" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"event_type" text NOT NULL,
	"status" text NOT NULL,
	"payload" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sync_event" ADD CONSTRAINT "sync_event_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE cascade ON UPDATE no action;