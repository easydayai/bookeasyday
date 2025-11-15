import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText, Users, Home as HomeIcon, Shield, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/shopify";
import heroBg from "@/assets/hero-bg.jpg";

export default function Home() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(12),
  });

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative min-h-[600px] flex items-center justify-center text-center px-4 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Get approved fast — for just $20.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Apply once with Rent EZ for only $20. Get approved and moved into an apartment within 30
            days or your money back.
          </p>
          <p className="text-sm text-muted-foreground/70 max-w-2xl mx-auto">
            No more paying $100+ per application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-lg h-14 px-8">
              <Link to="/apply">Apply Now – $20</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg h-14 px-8">
              <Link to="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How Rent EZ Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: FileText,
                title: "Apply once online for $20",
                desc: "No more wasting $100+ on every listing",
              },
              {
                icon: Users,
                title: "Upload your info one time",
                desc: "Docs, income, and background—all in one place",
              },
              {
                icon: HomeIcon,
                title: "Get matched with specialists",
                desc: "We connect you with landlords that fit your profile",
              },
              {
                icon: CheckCircle,
                title: "Move in within 30 days",
                desc: "Or get your money back—guaranteed",
              },
            ].map((step, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6 space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Rent EZ</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "No more $100+ application fees",
                desc: "Save hundreds by applying once instead of multiple times",
              },
              {
                icon: FileText,
                title: "One application, multiple opportunities",
                desc: "Your info works for all our partner landlords and specialists",
              },
              {
                icon: Users,
                title: "Connected with real rental specialists",
                desc: "Get personalized help finding your perfect place",
              },
              {
                icon: Clock,
                title: "30-Day Move-In Money-Back Guarantee",
                desc: "If we don't help you move in within 30 days, get a full refund",
              },
            ].map((benefit, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6 space-y-3">
                  <benefit.icon className="h-10 w-10 text-primary" />
                  <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Renters Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Jasmine",
                city: "Houston, TX",
                quote: "Approved in 12 days and saved over $300 in application fees!",
                tag: "Approved in 12 days",
              },
              {
                name: "Marcus",
                city: "Atlanta, GA",
                quote: "Best decision ever. Found my dream apartment under budget.",
                tag: "Found place under budget",
              },
              {
                name: "Sofia",
                city: "Phoenix, AZ",
                quote: "The rental specialist helped me every step of the way. So easy!",
                tag: "Great support",
              },
            ].map((testimonial, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-primary text-xl">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold">
                      {testimonial.name} – {testimonial.city}
                    </p>
                    <p className="text-xs text-primary">{testimonial.tag}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/testimonials">Read More Reviews</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Requirements Snapshot */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-muted/50">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-2xl font-bold text-center">Basic Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Must have verifiable income</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Must meet minimum income and screening criteria</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>No active serious evictions or violent felonies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Must submit requested documents to stay eligible</span>
                </li>
              </ul>
              <div className="text-center pt-4">
                <Button asChild variant="link">
                  <Link to="/policies">See Full Policies</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Available Products</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.node.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {product.node.images?.edges?.[0]?.node && (
                    <img
                      src={product.node.images.edges[0].node.url}
                      alt={product.node.title}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{product.node.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{product.node.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {product.node.priceRange.minVariantPrice.currencyCode} {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                      </span>
                      <Button asChild>
                        <Link to={`/product/${product.node.handle}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-4">No products found</p>
              <p className="text-muted-foreground">Start by telling me what products you'd like to sell!</p>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-hero-gradient text-center">
        <div className="container mx-auto max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold">Ready to stop getting denied?</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of renters who found their home with Rent EZ
          </p>
          <Button asChild size="lg" className="text-lg h-14 px-8">
            <Link to="/apply">Start Application – $20</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
