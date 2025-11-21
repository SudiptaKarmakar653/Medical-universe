
-- Create recovery programs table
CREATE TABLE public.recovery_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surgery_type TEXT NOT NULL,
  program_name TEXT NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recovery tasks table
CREATE TABLE public.recovery_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.recovery_programs(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  task_title TEXT NOT NULL,
  task_description TEXT NOT NULL,
  task_type TEXT NOT NULL DEFAULT 'general', -- exercise, medication, diet, breathing, etc.
  difficulty_level INTEGER NOT NULL DEFAULT 1, -- 1-5 scale
  estimated_duration_minutes INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient recovery progress table
CREATE TABLE public.patient_recovery_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL, -- clerk user id
  program_id UUID REFERENCES public.recovery_programs(id) ON DELETE CASCADE,
  surgery_date DATE NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 1,
  total_completion_percentage NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, program_id)
);

-- Create daily task completion tracking
CREATE TABLE public.daily_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_progress_id UUID REFERENCES public.patient_recovery_progress(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.recovery_tasks(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completion_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_progress_id, task_id, day_number)
);

-- Create symptom reports table
CREATE TABLE public.symptom_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL,
  symptoms JSONB NOT NULL, -- store symptom checklist responses
  severity_level INTEGER NOT NULL, -- 1-5 scale
  requires_emergency BOOLEAN NOT NULL DEFAULT false,
  doctor_notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.recovery_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_recovery_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recovery_programs (public read)
CREATE POLICY "Anyone can view recovery programs" ON public.recovery_programs FOR SELECT USING (true);

-- RLS Policies for recovery_tasks (public read)
CREATE POLICY "Anyone can view recovery tasks" ON public.recovery_tasks FOR SELECT USING (true);

-- RLS Policies for patient_recovery_progress
CREATE POLICY "Patients can view their own recovery progress" ON public.patient_recovery_progress 
  FOR SELECT USING (patient_id = auth.jwt() ->> 'sub');
CREATE POLICY "Patients can insert their own recovery progress" ON public.patient_recovery_progress 
  FOR INSERT WITH CHECK (patient_id = auth.jwt() ->> 'sub');
CREATE POLICY "Patients can update their own recovery progress" ON public.patient_recovery_progress 
  FOR UPDATE USING (patient_id = auth.jwt() ->> 'sub');

-- RLS Policies for daily_task_completions
CREATE POLICY "Patients can manage their task completions" ON public.daily_task_completions 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.patient_recovery_progress prp 
      WHERE prp.id = patient_progress_id AND prp.patient_id = auth.jwt() ->> 'sub'
    )
  );

-- RLS Policies for symptom_reports
CREATE POLICY "Patients can view their own symptom reports" ON public.symptom_reports 
  FOR SELECT USING (patient_id = auth.jwt() ->> 'sub');
CREATE POLICY "Patients can insert their own symptom reports" ON public.symptom_reports 
  FOR INSERT WITH CHECK (patient_id = auth.jwt() ->> 'sub');

-- Insert sample recovery programs
INSERT INTO public.recovery_programs (surgery_type, program_name, total_days) VALUES
('heart', 'Heart Surgery Recovery Program', 30),
('knee', 'Knee Surgery Recovery Program', 30),
('cesarean', 'Cesarean Section Recovery Program', 30),
('others', 'General Surgery Recovery Program', 30);

-- Insert sample tasks for Heart Surgery (first 7 days)
INSERT INTO public.recovery_tasks (program_id, day_number, task_title, task_description, task_type, difficulty_level, estimated_duration_minutes)
SELECT 
  (SELECT id FROM public.recovery_programs WHERE surgery_type = 'heart'),
  day_num,
  task_data.title,
  task_data.description,
  task_data.type,
  task_data.difficulty,
  task_data.duration
FROM 
  (VALUES 
    (1, 'Deep Breathing Exercise', 'Take 10 slow, deep breaths. Inhale for 4 seconds, hold for 4, exhale for 6 seconds.', 'breathing', 1, 5),
    (1, 'Ankle Pumps', 'While lying down, move your ankles up and down 10 times to improve circulation.', 'exercise', 1, 3),
    (1, 'Light Walking', 'Walk around your room or hallway for 2-3 minutes with assistance.', 'exercise', 2, 5),
    (2, 'Deep Breathing Exercise', 'Repeat breathing exercises 3 times today, focusing on expanding your chest.', 'breathing', 1, 10),
    (2, 'Coughing Exercise', 'Cough gently while hugging a pillow to clear your lungs. Do this 5 times.', 'breathing', 2, 5),
    (2, 'Short Walk', 'Walk in the hallway for 5 minutes with supervision.', 'exercise', 2, 8),
    (3, 'Breathing & Coughing', 'Continue your breathing and coughing exercises, 4 sets today.', 'breathing', 1, 12),
    (3, 'Longer Walk', 'Walk for 8-10 minutes, can be broken into 2 sessions.', 'exercise', 3, 15),
    (3, 'Arm Exercises', 'Gentle arm raises and shoulder rolls, 10 repetitions each.', 'exercise', 2, 8)
  ) AS task_data(day_num, title, description, type, difficulty, duration);

-- Insert sample tasks for Knee Surgery
INSERT INTO public.recovery_tasks (program_id, day_number, task_title, task_description, task_type, difficulty_level, estimated_duration_minutes)
SELECT 
  (SELECT id FROM public.recovery_programs WHERE surgery_type = 'knee'),
  day_num,
  task_data.title,
  task_data.description,
  task_data.type,
  task_data.difficulty,
  task_data.duration
FROM 
  (VALUES 
    (1, 'Ice Application', 'Apply ice pack to knee for 15-20 minutes, 3 times today.', 'therapy', 1, 20),
    (1, 'Ankle Exercises', 'Point and flex your ankle 20 times to maintain circulation.', 'exercise', 1, 5),
    (1, 'Quad Sets', 'Tighten thigh muscle and hold for 5 seconds, repeat 10 times.', 'exercise', 2, 8),
    (2, 'Ice & Elevation', 'Continue icing and keep leg elevated when resting.', 'therapy', 1, 15),
    (2, 'Heel Slides', 'Slowly slide heel toward buttocks, hold and return. Repeat 10 times.', 'exercise', 2, 10),
    (3, 'Range of Motion', 'Gentle knee bending exercises, aim for 90 degrees if comfortable.', 'exercise', 3, 15)
  ) AS task_data(day_num, title, description, type, difficulty, duration);

-- Insert sample tasks for Cesarean Section
INSERT INTO public.recovery_tasks (program_id, day_number, task_title, task_description, task_type, difficulty_level, estimated_duration_minutes)
SELECT 
  (SELECT id FROM public.recovery_programs WHERE surgery_type = 'cesarean'),
  day_num,
  task_data.title,
  task_data.description,
  task_data.type,
  task_data.difficulty,
  task_data.duration
FROM 
  (VALUES 
    (1, 'Deep Breathing', 'Take deep breaths to prevent lung complications. 10 breaths every hour.', 'breathing', 1, 5),
    (1, 'Leg Exercises', 'Ankle circles and calf raises while in bed to prevent clots.', 'exercise', 1, 5),
    (1, 'Incision Care', 'Keep incision clean and dry. Check for signs of infection.', 'care', 1, 5),
    (2, 'Short Walk', 'Take a short walk around your room with assistance.', 'exercise', 2, 8),
    (2, 'Breastfeeding Position', 'Practice comfortable breastfeeding positions to avoid strain.', 'care', 1, 10),
    (3, 'Extended Walking', 'Walk in hallway for 10 minutes, can be in 2-3 sessions.', 'exercise', 2, 15)
  ) AS task_data(day_num, title, description, type, difficulty, duration);
