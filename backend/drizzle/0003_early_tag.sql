CREATE TABLE "chunks" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"start" integer NOT NULL,
	"end" integer NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"result" jsonb,
	"worker_id" text,
	"started_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "total_assignments" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "chunk_size" integer;--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chunks_job_id_idx" ON "chunks" USING btree ("job_id");