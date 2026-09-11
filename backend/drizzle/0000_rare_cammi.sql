CREATE TABLE "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"formula" jsonb NOT NULL,
	"result" jsonb,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
