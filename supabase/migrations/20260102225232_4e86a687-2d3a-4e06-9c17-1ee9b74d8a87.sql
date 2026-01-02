-- Create function to consume credits on booking
CREATE OR REPLACE FUNCTION public.handle_booking_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance numeric;
  credits_to_consume numeric := 2; -- 2 credits per booking
BEGIN
  -- Get current balance for the user receiving the booking
  SELECT balance_credits INTO current_balance
  FROM public.credits_balance
  WHERE user_id = NEW.user_id;
  
  -- If user has insufficient credits, still allow booking but log it
  IF current_balance IS NULL OR current_balance < credits_to_consume THEN
    -- Log the failed consumption
    INSERT INTO public.credits_ledger (user_id, event_type, credits_delta, source, reference_id)
    VALUES (NEW.user_id, 'consumption_failed', 0, 'booking', NEW.id::text);
    
    RETURN NEW;
  END IF;
  
  -- Deduct credits
  UPDATE public.credits_balance
  SET balance_credits = balance_credits - credits_to_consume,
      updated_at = now()
  WHERE user_id = NEW.user_id;
  
  -- Log the consumption
  INSERT INTO public.credits_ledger (user_id, event_type, credits_delta, source, reference_id)
  VALUES (NEW.user_id, 'consumption', -credits_to_consume, 'booking', NEW.id::text);
  
  RETURN NEW;
END;
$$;

-- Create trigger to consume credits on new booking
DROP TRIGGER IF EXISTS consume_credits_on_booking ON public.bookings;
CREATE TRIGGER consume_credits_on_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_booking_credits();