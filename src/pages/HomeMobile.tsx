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
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/95"></div>
      <div className="relative z-10 space-y-6 animate-fade-in">
        <h1 className="text-4xl font-bold leading-tight">
          Get approved fast — for just $20.
        </h1>
        <p className="text-lg text-muted-foreground">
          Apply once with Rent EZ. Get moved in within 30 days or your money back.
        </p>
        <p className="text-sm text-muted-foreground/70">
          No more paying $100+ per application.
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
            onClick={() => setConsentModalOpen(true)}
          >
            Apply Now – $20
          </Button>
        </div>
      </div>
    </div>,

    // How It Works
    <div key="how-it-works" className="h-full flex flex-col justify-center px-6 py-8 overflow-y-auto">
      <h2 className="text-3xl font-bold text-center mb-8 animate-fade-in">How It Works</h2>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
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
          <Card 
            key={idx} 
            className="text-center hover-scale animate-fade-in border-border/50 bg-card/50 backdrop-blur-sm"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <CardContent className="pt-6 pb-6 space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 shadow-lg shadow-primary/20">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-base">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>,

    // Benefits
    <div key="benefits" className="h-full flex flex-col justify-center px-6 py-8 overflow-y-auto">
      <h2 className="text-3xl font-bold text-center mb-8 animate-fade-in">Why Rent EZ</h2>
      <div className="space-y-4 max-w-md mx-auto">
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
          <Card 
            key={idx} 
            className="hover-scale animate-fade-in border-border/50 bg-card/50 backdrop-blur-sm"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <CardContent className="pt-5 pb-5 flex gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 flex-shrink-0 shadow-lg shadow-primary/20">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>,

    // Testimonials
    <div key="testimonials" className="h-full flex flex-col justify-center px-6 py-8 overflow-y-auto">
      <h2 className="text-3xl font-bold text-center mb-8 animate-fade-in">Success Stories</h2>
      <div className="space-y-4 max-w-md mx-auto">
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
          <Card 
            key={idx} 
            className="hover-scale animate-fade-in border-border/50 bg-card/50 backdrop-blur-sm"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <CardContent className="pt-5 pb-5 space-y-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary text-lg drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-base italic leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
              <p className="text-xs font-semibold text-muted-foreground">
                {testimonial.name} · {testimonial.city}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 max-w-md mx-auto w-full animate-fade-in" style={{ animationDelay: "400ms" }}>
        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
          onClick={() => setConsentModalOpen(true)}
        >
          Start Application – $20
        </Button>
      </div>
    </div>,
  ];

  return (
    <div className="h-full flex flex-col">
      <Carousel 
        setApi={setApi} 
        className="flex-1" 
        opts={{ 
          loop: false,
          duration: 25,
          dragFree: false,
        }}
      >
        <CarouselContent className="h-full">
          {sections.map((section, index) => (
            <CarouselItem key={index} className="h-full">
              <div className={`h-full transition-opacity duration-500 ${
                index === current ? "opacity-100" : "opacity-0"
              }`}>
                {section}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Enhanced dot indicators with labels */}
      <div className="flex justify-center items-center gap-3 py-5 bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-lg">
        {["Home", "How", "Why", "Stories"].map((label, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className="flex flex-col items-center gap-1 group"
            aria-label={`Go to ${label}`}
          >
            <div className={`h-1.5 rounded-full transition-all duration-300 ${
              index === current 
                ? "w-8 bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]" 
                : "w-1.5 bg-muted-foreground/30 group-hover:bg-muted-foreground/60 group-hover:w-4"
            }`} />
            <span className={`text-[9px] font-medium transition-all duration-300 ${
              index === current 
                ? "text-primary opacity-100" 
                : "text-muted-foreground opacity-60 group-hover:opacity-100"
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <ConsentModal open={consentModalOpen} onOpenChange={setConsentModalOpen} />
    </div>
  );
}
