import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, DollarSign, Home, Calendar, Wifi, Snowflake, Car, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConsentModal } from "@/components/ConsentModal";

// Import listing images
import listing1Bedroom from "@/assets/listing-1-bedroom.jpg";
import listing1Kitchen from "@/assets/listing-1-kitchen.jpg";
import listing2Bedroom from "@/assets/listing-2-bedroom.jpg";
import listing3Living from "@/assets/listing-3-living.jpg";
import listing4Living from "@/assets/listing-4-living.jpg";
import listing5Studio from "@/assets/listing-5-studio.jpg";

interface Listing {
  id: number;
  type: string;
  price: number;
  location: string;
  neighborhood: string;
  images: string[];
  amenities: string[];
  available: boolean;
  bedrooms: string;
}

const listings: Listing[] = [
  {
    id: 1,
    type: "Private Room",
    bedrooms: "Room in 2BR",
    price: 850,
    location: "Brooklyn",
    neighborhood: "Bushwick",
    images: [listing1Bedroom, listing1Kitchen],
    amenities: ["Wifi Included", "Heat & Hot Water", "Near L Train"],
    available: true,
  },
  {
    id: 2,
    type: "Private Room",
    bedrooms: "Room in 3BR",
    price: 900,
    location: "Brooklyn",
    neighborhood: "Brooklyn",
    images: [listing2Bedroom],
    amenities: ["Laundry in Building", "Exposed Brick", "Natural Light"],
    available: true,
  },
  {
    id: 3,
    type: "2 Bedroom",
    bedrooms: "2BR Apartment",
    price: 1000,
    location: "Brooklyn",
    neighborhood: "Bed-Stuy",
    images: [listing3Living],
    amenities: ["Hardwood Floors", "Large Windows", "Pet Friendly"],
    available: true,
  },
  {
    id: 4,
    type: "3 Bedroom",
    bedrooms: "3BR Apartment",
    price: 1150,
    location: "Bronx",
    neighborhood: "Bronx",
    images: [listing4Living],
    amenities: ["Spacious Layout", "Near Transit", "Heat Included"],
    available: true,
  },
  {
    id: 5,
    type: "Studio",
    bedrooms: "Studio",
    price: 1200,
    location: "New York City",
    neighborhood: "New York City",
    images: [listing5Studio],
    amenities: ["All Utilities", "Furnished Option", "Flexible Lease"],
    available: true,
  },
];

const Listings = () => {
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = locationFilter === "all" || 
      listing.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesPrice = priceFilter === "all" ||
      (priceFilter === "under900" && listing.price < 900) ||
      (priceFilter === "900-1100" && listing.price >= 900 && listing.price <= 1100) ||
      (priceFilter === "over1100" && listing.price > 1100);
    
    const matchesUnit = unitFilter === "all" ||
      (unitFilter === "room" && listing.type === "Private Room") ||
      (unitFilter === "studio" && listing.type === "Studio") ||
      (unitFilter === "2br" && listing.type === "2 Bedroom") ||
      (unitFilter === "3br" && listing.type === "3 Bedroom");
    
    const matchesAvailability = availabilityFilter === "all" || listing.available;

    return matchesSearch && matchesLocation && matchesPrice && matchesUnit && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* SEO-friendly header structure */}
      <header className="pt-24 pb-8 px-4">
        <div className="container mx-auto">
          {/* Limited Availability Banner */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-8 text-center">
            <p className="text-primary font-semibold">
              Limited Availability – Units Update Frequently
            </p>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Apartments & Rooms for Rent
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Find affordable rooms for rent in Brooklyn, NYC studio apartments, and housing in the Bronx
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">$20 Application</span> – Apply once, access multiple listings
          </p>
        </div>
      </header>

      {/* Search and Filters */}
      <section className="px-4 pb-8" aria-label="Search filters">
        <div className="container mx-auto">
          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by neighborhood or unit type..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="brooklyn">Brooklyn</SelectItem>
                    <SelectItem value="bronx">Bronx</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <DollarSign className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Price</SelectItem>
                    <SelectItem value="under900">Under $900</SelectItem>
                    <SelectItem value="900-1100">$900 - $1,100</SelectItem>
                    <SelectItem value="over1100">Over $1,100</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger>
                    <Home className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Unit Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="room">Private Room</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="2br">2 Bedroom</SelectItem>
                    <SelectItem value="3br">3 Bedroom</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available Now</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <main className="px-4 pb-12">
        <div className="container mx-auto">
          <p className="text-muted-foreground mb-6">
            {filteredListings.length} {filteredListings.length === 1 ? "listing" : "listings"} found
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <article key={listing.id} className="group">
                <Card className="overflow-hidden border-border hover:border-primary/50 transition-colors">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={listing.images[0]}
                      alt={`${listing.bedrooms} in ${listing.neighborhood} - Affordable housing New York`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                      {listing.available ? "Available" : "Pending"}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    {/* Price and Type */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          ${listing.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{listing.bedrooms}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {listing.type}
                      </Badge>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{listing.neighborhood}, {listing.location}</span>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {listing.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                    </div>

                    {/* Application Info */}
                    <p className="text-xs text-muted-foreground mb-4">
                      <span className="text-primary font-medium">$20 Application</span> – Apply once, access multiple listings
                    </p>

                    {/* CTAs */}
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => setConsentModalOpen(true)}
                      >
                        Apply for $20
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setUnitFilter(
                            listing.type === "Private Room" ? "room" :
                            listing.type === "Studio" ? "studio" :
                            listing.type === "2 Bedroom" ? "2br" : "3br"
                          );
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        View Similar Units
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No listings match your filters</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setLocationFilter("all");
                setPriceFilter("all");
                setUnitFilter("all");
                setAvailabilityFilter("all");
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Disclaimer Footer */}
      <footer className="bg-card border-t border-border px-4 py-8">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              RentEZ is a listing-access service that connects users with available rental opportunities. 
              Listings are subject to availability and may change without notice. RentEZ does not guarantee 
              specific units but provides access to current housing opportunities based on inventory. 
              All photos shown are representative. Exact addresses are provided after application approval.
            </p>
          </div>
        </div>
      </footer>

      <ConsentModal open={consentModalOpen} onOpenChange={setConsentModalOpen} />
    </div>
  );
};

export default Listings;
