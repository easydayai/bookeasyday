import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Calendar, CreditCard, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/hooks/useBusiness';
import { ServicesManager } from '@/components/business/ServicesManager';
import { BookingsList } from '@/components/business/BookingsList';
import { PaymentsList } from '@/components/business/PaymentsList';
import { StripeOnboarding } from '@/components/business/StripeOnboarding';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: bizLoading, checkStripeStatus } = useBusiness();
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // Handle Stripe return redirects
  useEffect(() => {
    if (searchParams.get('stripe_onboarded') === 'true') {
      toast.success('Stripe onboarding completed!');
      checkStripeStatus();
      // Clean up URL
      window.history.replaceState({}, '', '/business');
    } else if (searchParams.get('stripe_refresh') === 'true') {
      toast.info('Please complete Stripe onboarding');
      window.history.replaceState({}, '', '/business');
    }
  }, [searchParams, checkStripeStatus]);

  if (authLoading || bizLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Business Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <StripeOnboarding />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            <ServicesManager />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <BookingsList />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <PaymentsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
