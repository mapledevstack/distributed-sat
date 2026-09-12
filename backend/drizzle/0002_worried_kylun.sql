ALTER TABLE "jobs" ADD COLUMN "total_chunks" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "completed_chunks" integer DEFAULT 0 NOT NULL;