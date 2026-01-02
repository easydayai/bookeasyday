-- Create table for calendar design customization
CREATE TABLE public.calendar_design_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_color TEXT DEFAULT '#8B5CF6',
  accent_color TEXT DEFAULT '#0EA5E9',
  background_color TEXT DEFAULT '#FFFFFF',
  button_radius INTEGER DEFAULT 8 CHECK (button_radius >= 0 AND button_radius <= 24),
  font_family TEXT DEFAULT 'Inter' CHECK (font_family IN ('Inter', 'System', 'Poppins')),
  cover_style TEXT DEFAULT 'none' CHECK (cover_style IN ('none', 'gradient', 'image')),
  cover_image_url TEXT,
  show_logo BOOLEAN DEFAULT true,
  logo_url TEXT,
  show_business_name BOOLEAN DEFAULT true,
  show_contact BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.calendar_design_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own calendar design settings"
ON public.calendar_design_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar design settings"
ON public.calendar_design_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar design settings"
ON public.calendar_design_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Public can view calendar design settings for booking pages (need to access by user_id from profiles)
CREATE POLICY "Public can view calendar design settings for booking"
ON public.calendar_design_settings
FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_calendar_design_settings_updated_at
BEFORE UPDATE ON public.calendar_design_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();