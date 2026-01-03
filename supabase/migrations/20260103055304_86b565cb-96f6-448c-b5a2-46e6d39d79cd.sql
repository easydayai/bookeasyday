-- Create businesses table
CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  business_name text NOT NULL,
  stripe_account_id text,
  stripe_onboarded boolean DEFAULT false,
  payouts_enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- RLS policies for businesses
CREATE POLICY "Users can view their own businesses"
ON public.businesses FOR SELECT
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own businesses"
ON public.businesses FOR INSERT
WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own businesses"
ON public.businesses FOR UPDATE
USING (auth.uid() = owner_user_id);

-- Create services table
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  duration_min integer NOT NULL DEFAULT 30,
  price_cents integer NOT NULL DEFAULT 0,
  payment_mode text NOT NULL DEFAULT 'none' CHECK (payment_mode IN ('none', 'deposit_required', 'pay_later', 'after_service')),
  deposit_type text NOT NULL DEFAULT 'none' CHECK (deposit_type IN ('none', 'fixed', 'percent')),
  deposit_value integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS policies for services
CREATE POLICY "Business owners can view their services"
ON public.services FOR SELECT
USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = services.business_id AND businesses.owner_user_id = auth.uid()));

CREATE POLICY "Business owners can create services"
ON public.services FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = services.business_id AND businesses.owner_user_id = auth.uid()));

CREATE POLICY "Business owners can update services"
ON public.services FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = services.business_id AND businesses.owner_user_id = auth.uid()));

CREATE POLICY "Business owners can delete services"
ON public.services FOR DELETE
USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = services.business_id AND businesses.owner_user_id = auth.uid()));

CREATE POLICY "Public can view active services"
ON public.services FOR SELECT
USING (active = true);

-- Create booking_pages table (for the builder)
CREATE TABLE public.booking_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  slug text UNIQUE NOT NULL,
  page_model jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_pages ENABLE ROW LEVEL SECURITY;

-- RLS policies for booking_pages
CREATE POLICY "Business owners can manage their booking pages"
ON public.booking_pages FOR ALL
USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = booking_pages.business_id AND businesses.owner_user_id = auth.uid()));

CREATE POLICY "Public can view booking pages by slug"
ON public.booking_pages FOR SELECT
USING (true);

-- Create business_bookings table (renamed to avoid conflict with existing bookings)
CREATE TABLE public.business_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'canceled')),
  amount_due_cents integer NOT NULL DEFAULT 0,
  amount_paid_cents integer NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'deposit_paid', 'paid_in_full')),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_bookings
CREATE POLICY "Business owners can view their bookings"
ON public.business_bookings FOR SELECT
USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = business_bookings.business_id AND businesses.owner_user_id = auth.uid()));

CREATE POLICY "Business owners can update their bookings"
ON public.business_bookings FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = business_bookings.business_id AND businesses.owner_user_id = auth.uid()));

CREATE POLICY "Public can create bookings"
ON public.business_bookings FOR INSERT
WITH CHECK (true);

-- Create business_payments table
CREATE TABLE public.business_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.business_bookings(id) ON DELETE CASCADE NOT NULL,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  stripe_charge_id text,
  amount_gross_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'refunded', 'disputed')),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_payments
CREATE POLICY "Business owners can view their payments"
ON public.business_payments FOR SELECT
USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = business_payments.business_id AND businesses.owner_user_id = auth.uid()));

-- Create payment_requests table (for pay-later invoices)
CREATE TABLE public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.business_bookings(id) ON DELETE CASCADE NOT NULL,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('invoice', 'payment_link')),
  stripe_invoice_id text,
  stripe_payment_link_id text,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'paid', 'void')),
  sent_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_requests
CREATE POLICY "Business owners can view their payment requests"
ON public.payment_requests FOR SELECT
USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = payment_requests.business_id AND businesses.owner_user_id = auth.uid()));

CREATE POLICY "Business owners can create payment requests"
ON public.payment_requests FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = payment_requests.business_id AND businesses.owner_user_id = auth.uid()));

CREATE POLICY "Business owners can update payment requests"
ON public.payment_requests FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = payment_requests.business_id AND businesses.owner_user_id = auth.uid()));

-- Enable realtime for booking_pages
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_pages;