import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBusiness } from '@/hooks/useBusiness';

export function PaymentsList() {
  const { payments, bookings } = useBusiness();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      succeeded: 'default',
      refunded: 'secondary',
      disputed: 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getBookingInfo = (bookingId: string) => {
    return bookings.find(b => b.id === bookingId);
  };

  const totalRevenue = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + (p.amount_gross_cents - p.platform_fee_cents), 0);

  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const successfulPayments = payments.filter(p => p.status === 'succeeded').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">{formatPrice(totalRevenue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">After platform fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Successful Payments</CardDescription>
            <CardTitle className="text-2xl">{successfulPayments}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl">{pendingPayments}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Track all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payments yet.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => {
                const booking = getBookingInfo(payment.booking_id);
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatPrice(payment.amount_gross_cents)}
                        </span>
                        {getStatusBadge(payment.status)}
                      </div>
                      {booking && (
                        <div className="text-sm text-muted-foreground">
                          {booking.customer_name} • {booking.services?.name || 'Service'}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(payment.created_at), 'PPp')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {formatPrice(payment.amount_gross_cents - payment.platform_fee_cents)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        -{formatPrice(payment.platform_fee_cents)} fee
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
