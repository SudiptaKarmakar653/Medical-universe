
-- Update the RLS policy for prescriptions to work with Clerk authentication
-- Since we're not using Supabase auth, we need to allow authenticated operations differently

-- Drop the existing policy that relies on auth.uid()
DROP POLICY IF EXISTS "Doctors can insert prescriptions" ON prescriptions;

-- Create a new policy that allows inserts when the doctor_id exists in doctor_profiles
CREATE POLICY "Doctors can insert prescriptions" ON prescriptions
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM doctor_profiles 
    WHERE id = doctor_id
  )
);

-- Also update the SELECT policy to be more permissive
DROP POLICY IF EXISTS "Users can view their own prescriptions" ON prescriptions;

CREATE POLICY "Users can view prescriptions" ON prescriptions
FOR SELECT 
USING (
  -- Allow viewing if the doctor exists in doctor_profiles
  EXISTS (
    SELECT 1 FROM doctor_profiles 
    WHERE id = doctor_id
  )
);

-- Update the UPDATE policy as well
DROP POLICY IF EXISTS "Doctors can update prescriptions" ON prescriptions;

CREATE POLICY "Doctors can update prescriptions" ON prescriptions
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM doctor_profiles 
    WHERE id = doctor_id
  )
);
