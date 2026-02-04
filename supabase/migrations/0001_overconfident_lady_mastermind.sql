CREATE TABLE "neolog_user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"portrait" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recent_emotions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recent_behaviors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "neolog_user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "neolog_user_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "neolog_user_settings" ALTER COLUMN "ai_settings" SET DEFAULT '{"useDefaultKey":true,"selectedProvider":"openai","selectedModel":"gpt-4o","temperature":0.7,"streamEnabled":true,"apiKey":null,"baseUrl":null}'::jsonb;--> statement-breakpoint
ALTER TABLE "neolog_user_settings" DROP COLUMN "shortcuts";--> statement-breakpoint
CREATE POLICY "Users can view their own profile." ON "neolog_user_profiles" AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can insert their own profile." ON "neolog_user_profiles" AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Users can update their own profile." ON "neolog_user_profiles" AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = user_id);