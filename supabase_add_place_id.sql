-- Execute no SQL Editor do Supabase para deduplicação por place_id
ALTER TABLE leads ADD COLUMN IF NOT EXISTS place_id text;
CREATE UNIQUE INDEX IF NOT EXISTS leads_place_id_idx ON leads (place_id) WHERE place_id IS NOT NULL;
