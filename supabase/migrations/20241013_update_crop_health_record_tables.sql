-- Migration: Update for full Digital Crop Health Record features

-- Add soil_report_url to crop_health_records
ALTER TABLE crop_health_records ADD COLUMN IF NOT EXISTS soil_report_url text;

-- Treatments table already exists
-- Symptoms table already exists
-- Timelines table already exists

-- Add indexes for performance (optional)
CREATE INDEX IF NOT EXISTS idx_record_id_treatments ON crop_treatments(record_id);
CREATE INDEX IF NOT EXISTS idx_record_id_symptoms ON crop_symptoms(record_id);
CREATE INDEX IF NOT EXISTS idx_record_id_timelines ON crop_timelines(record_id);
