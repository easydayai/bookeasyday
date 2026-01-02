import BookingCalendar from "@/components/BookingCalendar";

export default function EasyDayContact() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Book Your{" "}
              <span className="text-gradient">Automation Call</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Select a time that works for you and let's discuss how Easy Day AI can automate your business.
            </p>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <BookingCalendar />
          </div>
        </div>
      </section>
    </div>
  );
}