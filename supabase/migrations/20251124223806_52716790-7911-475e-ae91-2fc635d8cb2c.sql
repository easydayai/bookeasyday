-- Re-enable Row Level Security on applications table
-- This protects sensitive applicant PII (emails, phone numbers, addresses, income)
-- Existing policies remain intact and will now be enforced:
--   - Anonymous users can INSERT (submit applications)
--   - Applicants can SELECT their own applications (if logged in)
--   - Admins can SELECT, UPDATE, DELETE all applications

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;