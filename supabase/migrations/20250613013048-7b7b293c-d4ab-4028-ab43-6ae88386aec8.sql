
-- Enable RLS on patient_recovery_progress table if not already enabled
ALTER TABLE public.patient_recovery_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patient_recovery_progress table
CREATE POLICY "Users can view their own recovery progress" 
  ON public.patient_recovery_progress 
  FOR SELECT 
  USING (patient_id = auth.uid()::text);

CREATE POLICY "Users can create their own recovery progress" 
  ON public.patient_recovery_progress 
  FOR INSERT 
  WITH CHECK (patient_id = auth.uid()::text);

CREATE POLICY "Users can update their own recovery progress" 
  ON public.patient_recovery_progress 
  FOR UPDATE 
  USING (patient_id = auth.uid()::text);

-- Enable RLS on daily_task_completions table
ALTER TABLE public.daily_task_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_task_completions table
CREATE POLICY "Users can view their task completions" 
  ON public.daily_task_completions 
  FOR SELECT 
  USING (
    patient_progress_id IN (
      SELECT id FROM public.patient_recovery_progress 
      WHERE patient_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create their task completions" 
  ON public.daily_task_completions 
  FOR INSERT 
  WITH CHECK (
    patient_progress_id IN (
      SELECT id FROM public.patient_recovery_progress 
      WHERE patient_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their task completions" 
  ON public.daily_task_completions 
  FOR UPDATE 
  USING (
    patient_progress_id IN (
      SELECT id FROM public.patient_recovery_progress 
      WHERE patient_id = auth.uid()::text
    )
  );

-- Enable RLS on symptom_reports table
ALTER TABLE public.symptom_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for symptom_reports table
CREATE POLICY "Users can view their own symptom reports" 
  ON public.symptom_reports 
  FOR SELECT 
  USING (patient_id = auth.uid()::text);

CREATE POLICY "Users can create their own symptom reports" 
  ON public.symptom_reports 
  FOR INSERT 
  WITH CHECK (patient_id = auth.uid()::text);

-- Make recovery_programs and recovery_tasks publicly readable
ALTER TABLE public.recovery_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recovery programs are publicly readable" 
  ON public.recovery_programs 
  FOR SELECT 
  USING (true);

ALTER TABLE public.recovery_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recovery tasks are publicly readable" 
  ON public.recovery_tasks 
  FOR SELECT 
  USING (true);
