
-- Add clerk_user_id column to blood_requests table
ALTER TABLE blood_requests 
ADD COLUMN clerk_user_id TEXT;
