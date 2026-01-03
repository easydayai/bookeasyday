import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Send, FileText, Link2 } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { toast } from 'sonner';
import { useState } from 'react';

export function BookingsList() {
  const { bookings, sendPaymentRequest, refetchBookings } = useBusiness();
  const [sendingId, setSendingId] = useState<string | null>(null);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      scheduled: 'default',
      completed: 'secondary',
      canceled: 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string, amountDue: number) => {
    if (amountDue === 0) return null;
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      unpaid: 'destructive',
      deposit_paid: 'outline',
      paid_in_full: 'default',
    };
    const labels: Record<string, string> = {
      unpaid: 'Unpaid',
      deposit_paid: 'Deposit Paid',
      paid_in_full: 'Paid',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const handleSendPaymentRequest = async (bookingId: string, type: 'invoice' | 'payment_link') => {
    setSendingId(bookingId);
    try {
      const result = await sendPaymentRequest(bookingId, type);
      if (type === 'payment_link') {
        toast.success('Payment link created', {
          action: {
            label: 'Copy Link',
            onClick: () => {
              navigator.clipboard.writeText(result.url);
              toast.success('Link copied!');
            },
          },
        });
      } else {
        toast.success('Invoice sent to customer');
      }
      refetchBookings?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send payment request');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>View and manage customer bookings</CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No bookings yet.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{booking.customer_name}</span>
                    {getStatusBadge(booking.status)}
                    {getPaymentStatusBadge(booking.payment_status, booking.amount_due_cents)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {booking.services?.name || 'Service'} • {format(new Date(booking.start_time), 'PPp')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {booking.customer_email}
                    {booking.customer_phone && ` • ${booking.customer_phone}`}
                  </div>
                  {booking.amount_due_cents > 0 && (
                    <div className="text-sm">
                      {formatPrice(booking.amount_paid_cents)} / {formatPrice(booking.amount_due_cents)} paid
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {booking.payment_status !== 'paid_in_full' && booking.amount_due_cents > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={sendingId === booking.id}>
                          <Send className="h-4 w-4 mr-2" />
                          {sendingId === booking.id ? 'Sending...' : 'Request Payment'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSendPaymentRequest(booking.id, 'payment_link')}>
                          <Link2 className="h-4 w-4 mr-2" />
                          Send Payment Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendPaymentRequest(booking.id, 'invoice')}>
                          <FileText className="h-4 w-4 mr-2" />
                          Send Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Cancel Booking</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
