-- Drop existing policy if exists and recreate
DROP POLICY IF EXISTS "Patients can insert their own reviews" ON public.reviews;

-- Create trigger that fires after insert or update on reviews to automatically update doctor ratings
DROP TRIGGER IF EXISTS update_doctor_rating_trigger ON public.reviews;
CREATE TRIGGER update_doctor_rating_trigger
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_doctor_rating();

-- Create policy for patients to insert reviews
CREATE POLICY "Patients can insert their own reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);