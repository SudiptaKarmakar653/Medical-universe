-- Create secure function to submit/update doctor reviews only if user has an eligible appointment
CREATE OR REPLACE FUNCTION public.submit_doctor_review(
  _doctor_id uuid,
  _rating integer,
  _comment text DEFAULT NULL
)
RETURNS TABLE(id uuid, action text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  existing uuid;
  user_email text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Basic input validation
  IF _rating < 1 OR _rating > 5 THEN
    RAISE EXCEPTION 'Invalid rating value';
  END IF;

  SELECT email INTO user_email FROM public.profiles WHERE id = uid;

  -- Verify an appointment exists linking this user to the doctor (completed or accepted)
  IF NOT EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.doctor_id = _doctor_id
      AND a.status IN ('completed','accepted')
      AND (
        a.patient_id = uid
        OR (user_email IS NOT NULL AND a.patient_email = user_email)
      )
  ) THEN
    RAISE EXCEPTION 'No eligible appointment found to rate this doctor';
  END IF;

  -- Upsert the review for this user and doctor
  SELECT r.id INTO existing FROM public.reviews r
  WHERE r.doctor_id = _doctor_id AND r.patient_id = uid
  LIMIT 1;

  IF existing IS NULL THEN
    INSERT INTO public.reviews (doctor_id, patient_id, rating, comment)
    VALUES (_doctor_id, uid, _rating, NULLIF(_comment, ''))
    RETURNING id INTO existing;
    RETURN QUERY SELECT existing, 'inserted'::text;
  ELSE
    UPDATE public.reviews
    SET rating = _rating,
        comment = NULLIF(_comment, ''),
        updated_at = now()
    WHERE id = existing;
    RETURN QUERY SELECT existing, 'updated'::text;
  END IF;
END;
$$;