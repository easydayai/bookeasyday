-- Grant ALL necessary permissions to anon role for applications table
GRANT SELECT, INSERT ON public.applications TO anon;

-- Also grant to authenticated role in case they're logged in
GRANT SELECT, INSERT ON public.applications TO authenticated;

-- Make sure sequence access is granted too
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;