CREATE TABLE "stock_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"trade_date" timestamp NOT NULL,
	"open" numeric(10, 3) NOT NULL,
	"high" numeric(10, 3) NOT NULL,
	"low" numeric(10, 3) NOT NULL,
	"close" numeric(10, 3) NOT NULL,
	"volume" numeric(20, 0),
	"amount" numeric(20, 3),
	"change_percent" numeric(8, 3),
	"turnover" numeric(8, 3),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"list_date" timestamp,
	"total_shares" numeric(20, 0),
	"circulating_shares" numeric(20, 0),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "stocks_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "sync_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"sync_type" text NOT NULL,
	"target_symbol" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"sync_start_date" timestamp,
	"sync_end_date" timestamp,
	"total_records" integer DEFAULT 0,
	"success_records" integer DEFAULT 0,
	"failed_records" integer DEFAULT 0,
	"error_message" text,
	"error_details" json,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "stock_prices_stock_date_idx" ON "stock_prices" USING btree ("symbol","trade_date");--> statement-breakpoint
CREATE INDEX "stock_prices_trade_date_idx" ON "stock_prices" USING btree ("trade_date");--> statement-breakpoint
CREATE INDEX "stock_prices_stock_id_idx" ON "stock_prices" USING btree ("symbol");--> statement-breakpoint
CREATE UNIQUE INDEX "stocks_symbol_idx" ON "stocks" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "stocks_name_idx" ON "stocks" USING btree ("name");--> statement-breakpoint
CREATE INDEX "sync_records_sync_type_idx" ON "sync_records" USING btree ("sync_type");--> statement-breakpoint
CREATE INDEX "sync_records_status_idx" ON "sync_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sync_records_created_at_idx" ON "sync_records" USING btree ("created_at");