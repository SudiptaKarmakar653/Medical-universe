
-- Create table for admin face descriptors
CREATE TABLE public.admin_face_descriptors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_username TEXT NOT NULL,
  face_descriptors JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for admin security settings
CREATE TABLE public.admin_security_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_username TEXT NOT NULL,
  face_detection_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_face_descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_security_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin face descriptors access" ON public.admin_face_descriptors
  FOR ALL USING (true);

CREATE POLICY "Admin security settings access" ON public.admin_security_settings
  FOR ALL USING (true);
