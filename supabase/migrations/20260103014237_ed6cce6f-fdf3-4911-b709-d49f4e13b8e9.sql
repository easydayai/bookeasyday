-- Create booking_page_config table for the booking page builder
CREATE TABLE public.booking_page_config (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_page_config ENABLE ROW LEVEL SECURITY;

-- Users can view their own config
CREATE POLICY "Users can view their own booking page config"
ON public.booking_page_config
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own config
CREATE POLICY "Users can insert their own booking page config"
ON public.booking_page_config
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own config
CREATE POLICY "Users can update their own booking page config"
ON public.booking_page_config
FOR UPDATE
USING (auth.uid() = user_id);

-- Public can view published config for booking pages
CREATE POLICY "Public can view published booking page config"
ON public.booking_page_config
FOR SELECT
USING (published_config IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_booking_page_config_updated_at
BEFORE UPDATE ON public.booking_page_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();