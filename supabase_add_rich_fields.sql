-- Execute no SQL Editor do Supabase
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address      text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS street       text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS description  text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS subtypes     text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS photos_count integer;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS price_range  text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS verified     boolean;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS working_hours text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS owner_title  text;
