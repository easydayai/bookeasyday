import BookingCalendar from "@/components/BookingCalendar";

export default function EasyDayContact() {
  return (
    <div className="min-h-screen pt-24">

      {/* Calendar Section */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <BookingCalendar />
          </div>
        </div>
      </section>
    </div>
  );
}