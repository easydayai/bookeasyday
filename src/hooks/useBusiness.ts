import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Business {
  id: string;
  owner_user_id: string;
  business_name: string;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
  payouts_enabled: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  duration_min: number;
  price_cents: number;
  payment_mode: 'none' | 'deposit_required' | 'pay_later' | 'after_service';
  deposit_type: 'none' | 'fixed' | 'percent';
  deposit_value: number;
  active: boolean;
  created_at: string;
}

export interface BusinessBooking {
  id: string;
  business_id: string;
  service_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'canceled';
  amount_due_cents: number;
  amount_paid_cents: number;
  payment_status: 'unpaid' | 'deposit_paid' | 'paid_in_full';
  created_at: string;
  services?: { name: string } | null;
}

export interface BusinessPayment {
  id: string;
  booking_id: string;
  business_id: string;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  amount_gross_cents: number;
  platform_fee_cents: number;
  status: 'pending' | 'succeeded' | 'refunded' | 'disputed';
  created_at: string;
}

export function useBusiness() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<BusinessBooking[]>([]);
  const [payments, setPayments] = useState<BusinessPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusiness = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching business:', error);
      return null;
    }

    setBusiness(data as Business | null);
    return data as Business | null;
  }, [user]);

  const createBusiness = useCallback(async (businessName: string) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        owner_user_id: user.id,
        business_name: businessName,
      })
      .select()
      .single();

    if (error) throw error;
    setBusiness(data as Business);
    return data as Business;
  }, [user]);

  const fetchServices = useCallback(async (businessId: string) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching services:', error);
      return;
    }

    setServices(data as Service[]);
  }, []);

  const createService = useCallback(async (service: Omit<Service, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    setServices(prev => [data as Service, ...prev]);
    return data as Service;
  }, []);

  const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setServices(prev => prev.map(s => s.id === id ? data as Service : s));
    return data as Service;
  }, []);

  const deleteService = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setServices(prev => prev.filter(s => s.id !== id));
  }, []);

  const fetchBookings = useCallback(async (businessId: string) => {
    const { data, error } = await supabase
      .from('business_bookings')
      .select('*, services:service_id(name)')
      .eq('business_id', businessId)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return;
    }

    setBookings(data as BusinessBooking[]);
  }, []);

  const fetchPayments = useCallback(async (businessId: string) => {
    const { data, error } = await supabase
      .from('business_payments')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return;
    }

    setPayments(data as BusinessPayment[]);
  }, []);

  const connectStripe = useCallback(async () => {
    if (!business) throw new Error('No business');

    const { data, error } = await supabase.functions.invoke('stripe-connect-account', {
      body: { action: 'create_account', businessId: business.id },
    });

    if (error) throw error;
    return data;
  }, [business]);

  const getOnboardLink = useCallback(async () => {
    if (!business) throw new Error('No business');

    const { data, error } = await supabase.functions.invoke('stripe-connect-account', {
      body: { action: 'onboard_link', businessId: business.id },
    });

    if (error) throw error;
    return data.url;
  }, [business]);

  const checkStripeStatus = useCallback(async () => {
    if (!business) return;

    const { data, error } = await supabase.functions.invoke('stripe-connect-account', {
      body: { action: 'check_status', businessId: business.id },
    });

    if (error) {
      console.error('Error checking Stripe status:', error);
      return;
    }

    setBusiness(prev => prev ? {
      ...prev,
      stripe_onboarded: data.onboarded,
      payouts_enabled: data.payoutsEnabled,
    } : null);
  }, [business]);

  const sendPaymentRequest = useCallback(async (bookingId: string, type: 'invoice' | 'payment_link') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    const amount = booking.amount_due_cents - booking.amount_paid_cents;

    const { data, error } = await supabase.functions.invoke('stripe-connect-invoice', {
      body: {
        action: type === 'invoice' ? 'create_invoice' : 'create_payment_link',
        bookingId,
        amountCents: amount,
        customerEmail: booking.customer_email,
      },
    });

    if (error) throw error;
    return data;
  }, [bookings]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const biz = await fetchBusiness();
      if (biz) {
        await Promise.all([
          fetchServices(biz.id),
          fetchBookings(biz.id),
          fetchPayments(biz.id),
        ]);
      }
      setIsLoading(false);
    };

    if (user) {
      init();
    }
  }, [user, fetchBusiness, fetchServices, fetchBookings, fetchPayments]);

  return {
    business,
    services,
    bookings,
    payments,
    isLoading,
    createBusiness,
    createService,
    updateService,
    deleteService,
    connectStripe,
    getOnboardLink,
    checkStripeStatus,
    sendPaymentRequest,
    refetchBookings: () => business && fetchBookings(business.id),
    refetchPayments: () => business && fetchPayments(business.id),
  };
}
