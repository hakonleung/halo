CREATE TABLE "neolog_equity_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"trade_date" text NOT NULL,
	"open" double precision NOT NULL,
	"high" double precision NOT NULL,
	"low" double precision NOT NULL,
	"close" double precision NOT NULL,
	"volume" bigint NOT NULL,
	"amount" double precision,
	"amplitude" double precision,
	"change_pct" double precision,
	"change_amount" double precision,
	"turnover_rate" double precision,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "equity_daily_code_date_unique" UNIQUE("code","trade_date")
);
--> statement-breakpoint
ALTER TABLE "neolog_equity_daily" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "neolog_equity_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"market" text NOT NULL,
	"secid" text NOT NULL,
	"industry" text,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "neolog_equity_list_code_unique" UNIQUE("code"),
	CONSTRAINT "neolog_equity_list_secid_unique" UNIQUE("secid")
);
--> statement-breakpoint
ALTER TABLE "neolog_equity_list" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Anyone can view equity daily data." ON "neolog_equity_daily" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated users can insert equity daily." ON "neolog_equity_daily" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((select auth.role()) = 'authenticated');--> statement-breakpoint
CREATE POLICY "Authenticated users can update equity daily." ON "neolog_equity_daily" AS PERMISSIVE FOR UPDATE TO public USING ((select auth.role()) = 'authenticated');--> statement-breakpoint
CREATE POLICY "Authenticated users can delete equity daily." ON "neolog_equity_daily" AS PERMISSIVE FOR DELETE TO public USING ((select auth.role()) = 'authenticated');--> statement-breakpoint
CREATE POLICY "Anyone can view equity list." ON "neolog_equity_list" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated users can insert equity." ON "neolog_equity_list" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((select auth.role()) = 'authenticated');--> statement-breakpoint
CREATE POLICY "Authenticated users can update equity." ON "neolog_equity_list" AS PERMISSIVE FOR UPDATE TO public USING ((select auth.role()) = 'authenticated');--> statement-breakpoint
CREATE POLICY "Authenticated users can delete equity." ON "neolog_equity_list" AS PERMISSIVE FOR DELETE TO public USING ((select auth.role()) = 'authenticated');