-- 安全地添加 background_type 字段（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'neolog_user_settings'
    AND column_name = 'background_type'
  ) THEN
    ALTER TABLE "neolog_user_settings" ADD COLUMN "background_type" text DEFAULT 'tron-grid';
  END IF;
END $$;

--> statement-breakpoint

-- 安全地添加 renderer_type 字段（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'neolog_user_settings'
    AND column_name = 'renderer_type'
  ) THEN
    ALTER TABLE "neolog_user_settings" ADD COLUMN "renderer_type" text DEFAULT 'auto';
  END IF;
END $$;