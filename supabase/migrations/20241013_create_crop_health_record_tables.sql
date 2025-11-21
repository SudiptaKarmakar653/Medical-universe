-- Migration: Digital Crop Health Record tables

-- Main profile for each plot/field
CREATE TABLE IF NOT EXISTS crop_health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  plot_name text NOT NULL,
  crop_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Treatment history (fertilizer, pesticide, etc.)
CREATE TABLE IF NOT EXISTS crop_treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid REFERENCES crop_health_records(id) ON DELETE CASCADE,
  treatment_type text NOT NULL, -- fertilizer, pesticide, etc.
  name text NOT NULL,           -- name of product
  dose text,                   -- amount/dose
  date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Symptom/case history
CREATE TABLE IF NOT EXISTS crop_symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid REFERENCES crop_health_records(id) ON DELETE CASCADE,
  symptom text NOT NULL,
  image_url text,              -- uploaded image
  date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Growth timeline (photos at different stages)
CREATE TABLE IF NOT EXISTS crop_timelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid REFERENCES crop_health_records(id) ON DELETE CASCADE,
  stage text NOT NULL,         -- e.g. "seedling", "flowering"
  image_url text,
  date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);
