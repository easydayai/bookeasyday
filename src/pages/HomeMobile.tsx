import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText, Users, Home as HomeIcon, Shield, Clock } from "lucide-react";
import { ConsentModal } from "@/components/ConsentModal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import heroBg from "@/assets/hero-bg.jpg";
import { useEffect } from "react";

export default function HomeMobile() {
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const sections = [
    // Hero
    <div
      key="hero"
      className="h-full flex flex-col items-center justify-center text-center px-6 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
      <div className="relative z-10 space-y-4">
        <h1 className="text-3xl font-bold leading-tight">
          Get approved fast — for just $20.
        </h1>
        <p className="text-base text-muted-foreground">
          Apply once with Rent EZ. Get moved in within 30 days or your money back.
        </p>
        <p className="text-xs text-muted-foreground/70">
          No more paying $100+ per application.
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => setConsentModalOpen(true)}
          >
            Apply Now – $20
          </Button>
        </div>
      </div>
    </div>,

    // How It Works
    <div key="how-it-works" className="h-full flex flex-col px-6 py-8 overflow-y-auto">
      <h2 className="text-2xl font-bold text-center mb-6">How It Works</h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            icon: FileText,
            title: "Apply once",
            desc: "Only $20",
          },
          {
            icon: Users,
            title: "Upload info",
            desc: "One time",
          },
          {
            icon: HomeIcon,
            title: "Get matched",
            desc: "With specialists",
          },
          {
            icon: CheckCircle,
            title: "Move in",
            desc: "30 days max",
          },
        ].map((step, idx) => (
          <Card key={idx} className="text-center">
            <CardContent className="pt-4 space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>,

    // Benefits
    <div key="benefits" className="h-full flex flex-col px-6 py-8 overflow-y-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Why Rent EZ</h2>
      <div className="space-y-4">
        {[
          {
            icon: Shield,
            title: "Save $100+ per application",
            desc: "Apply once instead of multiple times",
          },
          {
            icon: FileText,
            title: "One app, many opportunities",
            desc: "Works for all partner landlords",
          },
          {
            icon: Clock,
            title: "30-Day Guarantee",
            desc: "Move in or get your money back",
          },
        ].map((benefit, idx) => (
          <Card key={idx}>
            <CardContent className="pt-4 pb-4 flex gap-3">
              <benefit.icon className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground">{benefit.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>,

    // Testimonials
    <div key="testimonials" className="h-full flex flex-col px-6 py-8 overflow-y-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Success Stories</h2>
      <div className="space-y-4">
        {[
          {
            name: "Jasmine",
            city: "Houston, TX",
            quote: "Approved in 12 days and saved over $300!",
          },
          {
            name: "Marcus",
            city: "Atlanta, GA",
            quote: "Found my dream apartment under budget.",
          },
          {
            name: "Sofia",
            city: "Phoenix, AZ",
            quote: "The specialist helped me every step.",
          },
        ].map((testimonial, idx) => (
          <Card key={idx}>
            <CardContent className="pt-4 pb-4 space-y-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary text-sm">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm italic">&ldquo;{testimonial.quote}&rdquo;</p>
              <p className="text-xs font-semibold">
                {testimonial.name} – {testimonial.city}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-4">
        <Button 
          size="lg" 
          className="w-full"
          onClick={() => setConsentModalOpen(true)}
        >
          Start Application – $20
        </Button>
      </div>
    </div>,
  ];

  return (
    <div className="h-full flex flex-col">
      <Carousel setApi={setApi} className="flex-1">
        <CarouselContent className="h-full">
          {sections.map((section, index) => (
            <CarouselItem key={index} className="h-full">
              {section}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 py-4 bg-background/80 backdrop-blur">
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === current 
                ? "w-8 bg-primary" 
                : "w-2 bg-muted-foreground/30"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <ConsentModal open={consentModalOpen} onOpenChange={setConsentModalOpen} />
    </div>
  );
}
