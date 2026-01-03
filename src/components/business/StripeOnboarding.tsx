import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { toast } from 'sonner';

export function StripeOnboarding() {
  const { business, createBusiness, connectStripe, getOnboardLink, checkStripeStatus } = useBusiness();
  const [businessName, setBusinessName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    setIsCreating(true);
    try {
      await createBusiness(businessName);
      toast.success('Business created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create business');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectStripe = async () => {
    setIsConnecting(true);
    try {
      await connectStripe();
      const url = await getOnboardLink();
      window.open(url, '_blank');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect Stripe');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleContinueOnboarding = async () => {
    setIsConnecting(true);
    try {
      const url = await getOnboardLink();
      window.open(url, '_blank');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to get onboarding link');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await checkStripeStatus();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to check status');
    } finally {
      setIsChecking(false);
    }
  };

  if (!business) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Your Business</CardTitle>
          <CardDescription>Set up your business to start accepting bookings and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateBusiness} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business Name"
                required
              />
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Business'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {business.business_name}
          {business.stripe_onboarded && (
            <Badge variant="default" className="ml-2">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Stripe Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {business.stripe_onboarded
            ? 'Your Stripe account is connected and ready to accept payments'
            : 'Connect your Stripe account to start accepting payments'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!business.stripe_account_id ? (
          <Button onClick={handleConnectStripe} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect with Stripe
                <ExternalLink className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        ) : !business.stripe_onboarded ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              <span>Stripe onboarding incomplete</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleContinueOnboarding} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Continue Onboarding
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCheckStatus} disabled={isChecking}>
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh Status'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Payouts</div>
                <div className="font-medium flex items-center gap-2">
                  {business.payouts_enabled ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Pending
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Platform Fee</div>
                <div className="font-medium">$1.00 per transaction</div>
              </div>
            </div>
            <Button variant="outline" onClick={handleCheckStatus} disabled={isChecking}>
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Refresh Status'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
