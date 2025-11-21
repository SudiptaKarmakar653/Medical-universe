
-- First, drop ALL existing policies on these tables to start fresh
DROP POLICY IF EXISTS "Users can view their own recovery progress" ON public.patient_recovery_progress;
DROP POLICY IF EXISTS "Users can create their own recovery progress" ON public.patient_recovery_progress;
DROP POLICY IF EXISTS "Users can update their own recovery progress" ON public.patient_recovery_progress;
DROP POLICY IF EXISTS "Users can view their task completions" ON public.daily_task_completions;
DROP POLICY IF EXISTS "Users can create their task completions" ON public.daily_task_completions;
DROP POLICY IF EXISTS "Users can update their task completions" ON public.daily_task_completions;
DROP POLICY IF EXISTS "Users can view their own symptom reports" ON public.symptom_reports;
DROP POLICY IF EXISTS "Users can create their own symptom reports" ON public.symptom_reports;

-- Now create new policies that work with Clerk authentication
-- For patient_recovery_progress table
CREATE POLICY "Allow authenticated users to view their recovery progress" 
  ON public.patient_recovery_progress 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated users to create recovery progress" 
  ON public.patient_recovery_progress 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update recovery progress" 
  ON public.patient_recovery_progress 
  FOR UPDATE 
  USING (true);

-- For daily_task_completions table
CREATE POLICY "Allow authenticated users to view task completions" 
  ON public.daily_task_completions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated users to create task completions" 
  ON public.daily_task_completions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update task completions" 
  ON public.daily_task_completions 
  FOR UPDATE 
  USING (true);

-- For symptom_reports table
CREATE POLICY "Allow authenticated users to view symptom reports" 
  ON public.symptom_reports 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated users to create symptom reports" 
  ON public.symptom_reports 
  FOR INSERT 
  WITH CHECK (true);
