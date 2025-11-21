
-- Create hospital_beds table for managing bed availability
CREATE TABLE IF NOT EXISTS public.hospital_beds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bed_type TEXT NOT NULL,
  total_beds INTEGER NOT NULL DEFAULT 0,
  available_beds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create operation_theater table for OT status
CREATE TABLE IF NOT EXISTS public.operation_theater (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bed_bookings table for patient booking requests
CREATE TABLE IF NOT EXISTS public.bed_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  patient_age INTEGER NOT NULL,
  patient_gender TEXT NOT NULL,
  disease TEXT NOT NULL,
  preferred_bed_type TEXT NOT NULL,
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  medical_report_url TEXT,
  patient_user_id TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  admission_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Function to generate booking ID
CREATE OR REPLACE FUNCTION public.generate_booking_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;

-- Trigger to auto-generate booking ID
CREATE OR REPLACE FUNCTION public.set_booking_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.booking_id IS NULL OR NEW.booking_id = '' THEN
    NEW.booking_id = generate_booking_id();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_booking_id_trigger ON public.bed_bookings;
CREATE TRIGGER set_booking_id_trigger
  BEFORE INSERT ON public.bed_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_booking_id();

-- Enable RLS
ALTER TABLE public.hospital_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_theater ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bed_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospital_beds
CREATE POLICY "Everyone can view bed availability" ON public.hospital_beds
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage beds" ON public.hospital_beds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for operation_theater
CREATE POLICY "Everyone can view OT status" ON public.operation_theater
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage OT" ON public.operation_theater
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for bed_bookings
CREATE POLICY "Users can create their own bookings" ON public.bed_bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own bookings" ON public.bed_bookings
  FOR SELECT USING (
    patient_user_id = (auth.jwt() ->> 'sub') OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all bookings" ON public.bed_bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert initial data
INSERT INTO public.hospital_beds (bed_type, total_beds, available_beds) 
VALUES 
  ('ICU', 20, 5),
  ('General', 50, 15)
ON CONFLICT DO NOTHING;

INSERT INTO public.operation_theater (name, is_available)
VALUES ('Operation Theater 1', true)
ON CONFLICT DO NOTHING;
