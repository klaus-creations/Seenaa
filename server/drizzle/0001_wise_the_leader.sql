ALTER TYPE "public"."member_status" ADD VALUE 'muted';--> statement-breakpoint
CREATE TABLE "community_report" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"community_id" varchar(255) NOT NULL,
	"reporter_id" varchar(255) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"resolved_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notification_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notification_actor_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "notification_preference" DROP CONSTRAINT "notification_preference_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "post" DROP CONSTRAINT "post_community_id_community_id_fk";
--> statement-breakpoint
ALTER TABLE "community_member" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "community_member" ALTER COLUMN "role" SET DEFAULT 'member'::text;--> statement-breakpoint
DROP TYPE "public"."community_role";--> statement-breakpoint
CREATE TYPE "public"."community_role" AS ENUM('creator', 'admin', 'member');--> statement-breakpoint
ALTER TABLE "community_member" ALTER COLUMN "role" SET DEFAULT 'member'::"public"."community_role";--> statement-breakpoint
ALTER TABLE "community_member" ALTER COLUMN "role" SET DATA TYPE "public"."community_role" USING "role"::"public"."community_role";--> statement-breakpoint
ALTER TABLE "notification_preference" ALTER COLUMN "push_on_follow" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "community" ADD COLUMN "require_post_approval" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "community_member" ADD COLUMN "permissions" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
CREATE INDEX "idx_comm_status" ON "community_member" USING btree ("community_id","status");--> statement-breakpoint
ALTER TABLE "community_member" DROP COLUMN "left_at";