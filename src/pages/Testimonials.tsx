import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Jasmine Rodriguez",
      city: "Houston, TX",
      rating: 5,
      quote:
        "I was so frustrated after being rejected from 5 apartments and losing over $500 in application fees. Rent EZ changed everything. Applied once, worked with an amazing specialist, and moved into my dream 2BR in 12 days!",
      tag: "Approved in 12 days",
    },
    {
      name: "Marcus Thompson",
      city: "Atlanta, GA",
      rating: 5,
      quote:
        "Best decision I made during my apartment search. My rental specialist found me a beautiful place $200 under my budget with all the amenities I wanted. Saved me time, money, and stress.",
      tag: "Found place under budget",
    },
    {
      name: "Sofia Chen",
      city: "Phoenix, AZ",
      rating: 5,
      quote:
        "The support was incredible. My specialist answered all my questions, helped me understand what landlords look for, and got me approved despite having a pet. Worth every penny!",
      tag: "Great support",
    },
    {
      name: "DeShawn Williams",
      city: "Chicago, IL",
      rating: 5,
      quote:
        "I was skeptical at first but Rent EZ delivered. After struggling for weeks on my own, their team helped me get approved and moved in within 3 weeks. Highly recommend!",
      tag: "Approved in 3 weeks",
    },
    {
      name: "Amanda Foster",
      city: "Dallas, TX",
      rating: 5,
      quote:
        "Moving to a new city was stressful, but Rent EZ made finding an apartment so easy. They connected me with landlords who actually wanted to work with me. No more wasted application fees!",
      tag: "Seamless move",
    },
    {
      name: "Carlos Mendoza",
      city: "Miami, FL",
      rating: 5,
      quote:
        "Applied through Rent EZ after being turned down by multiple landlords. My specialist helped me present my application better and I got approved in 10 days. Game changer!",
      tag: "Approved in 10 days",
    },
    {
      name: "Tiffany Brown",
      city: "Las Vegas, NV",
      rating: 5,
      quote:
        "Single mom here and finding housing was a nightmare. Rent EZ not only helped me find an affordable place but also connected me with a landlord who understood my situation. Forever grateful!",
      tag: "Found affordable housing",
    },
    {
      name: "Kevin Park",
      city: "San Antonio, TX",
      rating: 5,
      quote:
        "As a freelancer, my income situation is complicated. Rent EZ's specialist knew exactly how to present my application to landlords. Approved on the first property we applied to!",
      tag: "First property approved",
    },
    {
      name: "Nicole Adams",
      city: "Denver, CO",
      rating: 5,
      quote:
        "The money-back guarantee gave me confidence to try it, but I didn't need it! Found my place in 18 days. The whole process was transparent and professional.",
      tag: "Moved in 18 days",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">Real Renters. Real Approvals. Real Moves.</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Thousands of people have found their homes with Rent EZ. Here's what they have to say.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="h-full">
              <CardContent className="pt-6 space-y-4 flex flex-col h-full">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-primary text-xl">
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-sm italic flex-grow">&ldquo;{testimonial.quote}&rdquo;</p>

                <div className="space-y-1">
                  <p className="font-semibold">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{testimonial.city}</p>
                  <p className="text-xs text-primary font-medium">{testimonial.tag}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-6 py-12 bg-hero-gradient rounded-lg">
          <h2 className="text-3xl font-bold">Ready to be next?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied renters who stopped wasting money on application fees and
            found their perfect home with Rent EZ.
          </p>
          <Button asChild size="lg" className="h-12 px-8">
            <Link to="/apply">Apply Now – $20</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
