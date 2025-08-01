CREATE TYPE "public"."support_case_status" AS ENUM('open', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TABLE "support_case" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"subject" text NOT NULL,
	"status" "support_case_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_case_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"support_case_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "support_case" ADD CONSTRAINT "support_case_user_id_users_sync_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."users_sync"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_case_message" ADD CONSTRAINT "support_case_message_support_case_id_support_case_id_fk" FOREIGN KEY ("support_case_id") REFERENCES "public"."support_case"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_case_message" ADD CONSTRAINT "support_case_message_user_id_users_sync_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."users_sync"("id") ON DELETE cascade ON UPDATE no action;