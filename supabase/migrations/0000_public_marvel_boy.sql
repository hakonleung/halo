CREATE TABLE "neolog_behavior_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"icon" text,
	"metadata_schema" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "neolog_behavior_definitions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "neolog_behavior_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"definition_id" uuid NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "neolog_behavior_records" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "neolog_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "neolog_conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "neolog_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "neolog_goals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "neolog_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "neolog_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "neolog_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"tags" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "neolog_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "neolog_user_settings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"username" text,
	"full_name" text,
	"avatar_url" text,
	"website" text,
	"theme" text DEFAULT 'dark',
	"accent_color" text DEFAULT '#00FF41',
	"animation_level" text DEFAULT 'full',
	"font_size" text DEFAULT 'medium',
	"code_font" text DEFAULT 'JetBrains Mono',
	"notifications_in_app" boolean DEFAULT true,
	"notifications_push" boolean DEFAULT false,
	"notifications_email" boolean DEFAULT false,
	"goal_reminder_enabled" boolean DEFAULT true,
	"record_reminder_enabled" boolean DEFAULT false,
	"insights_enabled" boolean DEFAULT true,
	"do_not_disturb_start" time,
	"do_not_disturb_end" time,
	"do_not_disturb_weekends" boolean DEFAULT false,
	"language" text DEFAULT 'en',
	"timezone" text DEFAULT 'UTC',
	"date_format" text DEFAULT 'YYYY-MM-DD',
	"currency" text DEFAULT 'CNY',
	"shortcuts" jsonb DEFAULT '{}'::jsonb,
	"ai_settings" jsonb DEFAULT '{"useDefaultKey":true,"selectedProvider":"openai","selectedModel":"gpt-4o","temperature":0.7,"streamEnabled":true,"customKeys":[]}'::jsonb,
	CONSTRAINT "neolog_user_settings_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "neolog_user_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "neolog_behavior_records" ADD CONSTRAINT "neolog_behavior_records_definition_id_neolog_behavior_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."neolog_behavior_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neolog_messages" ADD CONSTRAINT "neolog_messages_conversation_id_neolog_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."neolog_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "System definitions are viewable by everyone." ON "neolog_behavior_definitions" AS PERMISSIVE FOR SELECT TO public USING (user_id is null);--> statement-breakpoint
CREATE POLICY "Users can view their own definitions." ON "neolog_behavior_definitions" AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can insert their own definitions." ON "neolog_behavior_definitions" AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can update their own definitions." ON "neolog_behavior_definitions" AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can delete their own definitions." ON "neolog_behavior_definitions" AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can view their own records." ON "neolog_behavior_records" AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can insert their own records." ON "neolog_behavior_records" AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can update their own records." ON "neolog_behavior_records" AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can delete their own records." ON "neolog_behavior_records" AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can view their own conversations." ON "neolog_conversations" AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can insert their own conversations." ON "neolog_conversations" AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can update their own conversations." ON "neolog_conversations" AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can delete their own conversations." ON "neolog_conversations" AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can view their own goals." ON "neolog_goals" AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can insert their own goals." ON "neolog_goals" AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can update their own goals." ON "neolog_goals" AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can delete their own goals." ON "neolog_goals" AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can view their own messages." ON "neolog_messages" AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can insert their own messages." ON "neolog_messages" AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can view their own notes." ON "neolog_notes" AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can insert their own notes." ON "neolog_notes" AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can update their own notes." ON "neolog_notes" AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can delete their own notes." ON "neolog_notes" AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Public user settings are viewable by everyone." ON "neolog_user_settings" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Users can insert their own settings." ON "neolog_user_settings" AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = id);--> statement-breakpoint
CREATE POLICY "Users can update their own settings." ON "neolog_user_settings" AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = id);