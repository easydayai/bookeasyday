-- Company knowledge base for Daisy
CREATE TABLE IF NOT EXISTS public.company_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_knowledge ENABLE ROW LEVEL SECURITY;

-- Allow public read access for Daisy to retrieve knowledge
CREATE POLICY "Anyone can view active company knowledge"
  ON public.company_knowledge FOR SELECT
  USING (is_active = true);

-- Only admins can manage knowledge
CREATE POLICY "Admins can manage company knowledge"
  ON public.company_knowledge FOR ALL
  USING (is_admin(auth.uid()));

-- Reminder rules per user
CREATE TABLE IF NOT EXISTS public.reminder_rules (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  email_hours_before integer DEFAULT 24,
  sms_enabled boolean DEFAULT false,
  sms_hours_before integer DEFAULT 24,
  second_reminder_enabled boolean DEFAULT false,
  second_reminder_hours_before integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminder_rules ENABLE ROW LEVEL SECURITY;

-- Users can view their own reminder rules
CREATE POLICY "Users can view their own reminder rules"
  ON public.reminder_rules FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own reminder rules
CREATE POLICY "Users can insert their own reminder rules"
  ON public.reminder_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reminder rules
CREATE POLICY "Users can update their own reminder rules"
  ON public.reminder_rules FOR UPDATE
  USING (auth.uid() = user_id);

-- Notification queue for scheduled reminders
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('email', 'sms')),
  recipient_email text,
  recipient_phone text,
  subject text,
  message text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notification_queue FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all notifications
CREATE POLICY "Service role can manage notifications"
  ON public.notification_queue FOR ALL
  USING (true);

-- Insert some default company knowledge
INSERT INTO public.company_knowledge (topic, content, category) VALUES
('about', 'Easy Day AI helps service-based businesses automate their scheduling, customer communications, and lead management with AI-powered tools. We specialize in HVAC, medical practices, auto services, legal firms, and other service businesses.', 'general'),
('services', 'Our core services include: AI-powered scheduling and booking, automated customer follow-ups, smart lead capture and qualification, 24/7 customer support automation, and seamless integration with existing business tools.', 'services'),
('pricing', 'Easy Day AI offers flexible pricing plans. Please visit our pricing page at /pricing for current plans and features. We offer a free trial to get started.', 'pricing'),
('booking', 'To book a consultation with Easy Day AI, visit our demo page at /demo or use the "Book a Call" button. Our team will help you discover how AI can transform your business.', 'booking'),
('support', 'For support inquiries, please contact us through the contact page at /contact. Our team typically responds within 24 hours.', 'support'),
('refunds', 'We offer a satisfaction guarantee. If you''re not happy with our service within the first 30 days, contact support for a full refund.', 'policies');