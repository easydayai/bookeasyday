-- Add user_id to applications table to link with authenticated users
ALTER TABLE public.applications 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_applications_user_id ON public.applications(user_id);

-- Update RLS policies to allow applicants to view their own applications
CREATE POLICY "Applicants can view their own applications"
ON public.applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own applications
CREATE POLICY "Authenticated users can create applications"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);