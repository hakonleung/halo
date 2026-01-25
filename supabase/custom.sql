-- Handle new user creation - create user settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.neolog_user_settings (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists before creating it (Supabase doesn't support CREATE OR REPLACE TRIGGER)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- Seed behavior definitions
INSERT INTO public.neolog_behavior_definitions (name, category, icon, metadata_schema)
VALUES 
('Running', 'health', '🏃', '[{"name": "Duration", "key": "duration", "type": "number", "required": true, "config": {"units": ["min"], "defaultUnit": "min"}}, {"name": "Distance", "key": "distance", "type": "number", "required": false, "config": {"units": ["km"], "defaultUnit": "km"}}]'::jsonb),
('Coffee', 'habit', '☕', '[{"name": "Cups", "key": "cups", "type": "number", "required": true, "config": {"defaultValue": 1}}]'::jsonb),
('Daily Expense', 'expense', '💰', '[{"name": "Amount", "key": "amount", "type": "currency", "required": true, "config": {"currency": "CNY"}}, {"name": "Category", "key": "category", "type": "select", "required": false, "config": {"options": [{"label": "Food", "value": "food"}, {"label": "Transport", "value": "transport"}, {"label": "Entertainment", "value": "entertainment"}]}}]'::jsonb)
ON CONFLICT DO NOTHING;

-- Increment behavior usage count
CREATE OR REPLACE FUNCTION public.increment_behavior_usage(def_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.neolog_behavior_definitions
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = def_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

