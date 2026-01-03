import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  FileText,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  user_id: string;
  appointment_type_id: string | null;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface AppointmentType {
  id: string;
  name: string;
  duration_minutes: number;
}

interface BookingDetailsSheetProps {
  booking: Booking | null;
  appointmentType?: AppointmentType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  cancelling: boolean;
  formatTime: (isoString: string) => string;
  formatDate: (isoString: string) => string;
}

export function BookingDetailsSheet({
  booking,
  appointmentType,
  open,
  onOpenChange,
  onCancel,
  cancelling,
  formatTime,
  formatDate,
}: BookingDetailsSheetProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!booking) return null;

  const content = (
    <div className="space-y-4">
      {/* Customer Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-white/60 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-white/60">Customer</p>
            <p className="font-medium text-white truncate">{booking.customer_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-white/60 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-white/60">Email</p>
            <p className="font-medium text-white truncate">{booking.customer_email}</p>
          </div>
        </div>

        {booking.customer_phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-white/60 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-white/60">Phone</p>
              <p className="font-medium text-white">{booking.customer_phone}</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-4 space-y-3">
        {/* Appointment Type */}
        {appointmentType && (
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-white/60 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-white/60">Appointment Type</p>
              <p className="font-medium text-white">
                {appointmentType.name}
                <span className="ml-2 text-white/60">
                  ({appointmentType.duration_minutes} min)
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Time */}
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-white/60 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-white/60">Date & Time</p>
            <p className="font-medium text-white">
              {formatDate(booking.start_time)}
            </p>
            <p className="text-white/80">
              {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-3 w-3 rounded-full flex-shrink-0",
              booking.status === "canceled" ? "bg-red-500" : "bg-green-500"
            )}
          />
          <div className="min-w-0">
            <p className="text-sm text-white/60">Status</p>
            <p className="font-medium text-white capitalize">{booking.status}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 mt-0.5 text-white/60 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white/60">Notes</p>
              <p className="font-medium text-white whitespace-pre-wrap break-words">
                {booking.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        {booking.status !== "canceled" && (
          <Button
            variant="destructive"
            onClick={onCancel}
            disabled={cancelling}
            className="flex-1 min-h-[48px]"
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="flex-1 min-h-[48px] border-white/10 text-white hover:bg-white/10"
        >
          Close
        </Button>
      </div>
    </div>
  );

  // Mobile: Bottom sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "bg-[#0A0F1F] border-white/10 text-white",
            "h-[85vh] rounded-t-2xl",
            "pb-[env(safe-area-inset-bottom)]"
          )}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-2 pb-4">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>
          
          <SheetHeader className="text-left pb-4">
            <SheetTitle className="text-xl text-white">Booking Details</SheetTitle>
            <SheetDescription className="text-white/60">
              View and manage this appointment
            </SheetDescription>
          </SheetHeader>
          
          <div className="overflow-y-auto flex-1 pr-1">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0F1F] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Booking Details</DialogTitle>
          <DialogDescription className="text-white/60">
            View and manage this appointment
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
