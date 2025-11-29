import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Home, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsentModal } from "@/components/ConsentModal";

// Listing 1 images - Bushwick brick style
import listing1Bedroom from "@/assets/listing-1-bedroom.jpg";
import listing1Living from "@/assets/listing-1-living.jpg";
import listing1Kitchen from "@/assets/listing-1-kitchen.jpg";
import listing1Bathroom from "@/assets/listing-1-bathroom.jpg";

// Listing 2 images - Brooklyn brownstone
import listing2Bedroom from "@/assets/listing-2-bedroom.jpg";
import listing2Living from "@/assets/listing-2-living.jpg";
import listing2Kitchen from "@/assets/listing-2-kitchen.jpg";
import listing2Bathroom from "@/assets/listing-2-bathroom.jpg";

// Listing 3 images - Bed-Stuy parquet
import listing3Bedroom from "@/assets/listing-3-bedroom.jpg";
import listing3Living from "@/assets/listing-3-living.jpg";
import listing3Kitchen from "@/assets/listing-3-kitchen.jpg";
import listing3Bathroom from "@/assets/listing-3-bathroom.jpg";

// Listing 4 images - Bronx carpet
import listing4Bedroom from "@/assets/listing-4-bedroom.jpg";
import listing4Living from "@/assets/listing-4-living.jpg";
import listing4Kitchen from "@/assets/listing-4-kitchen.jpg";
import listing4Bathroom from "@/assets/listing-4-bathroom.jpg";

// Listing 5 images - NYC studio
import listing5Main from "@/assets/listing-5-main.jpg";
import listing5Kitchen from "@/assets/listing-5-kitchen.jpg";
import listing5Bathroom from "@/assets/listing-5-bathroom.jpg";

interface ListingData {
  id: number;
  title: string;
  type: string;
  bedrooms: string;
  price: number;
  location: string;
  neighborhood: string;
  description: string;
  images: { src: string; label: string }[];
  amenities: string[];
}

const listingsData: Record<string, ListingData> = {
  "1": {
    id: 1,
    title: "Private Room in Bushwick",
    type: "Private Room",
    bedrooms: "Room in 2BR Apartment",
    price: 850,
    location: "Brooklyn",
    neighborhood: "Bushwick",
    description: "Cozy private room in a shared 2-bedroom apartment in the heart of Bushwick. Features exposed brick walls, hardwood floors, and great natural light. Close to the L train and local amenities.",
    images: [
      { src: listing1Bedroom, label: "Bedroom" },
      { src: listing1Living, label: "Living Room" },
      { src: listing1Kitchen, label: "Kitchen" },
      { src: listing1Bathroom, label: "Bathroom" },
    ],
    amenities: ["Wifi Included", "Heat & Hot Water", "Near L Train", "Laundry Nearby", "Hardwood Floors", "Exposed Brick"],
  },
  "2": {
    id: 2,
    title: "Private Room in Brooklyn Brownstone",
    type: "Private Room",
    bedrooms: "Room in 3BR Apartment",
    price: 900,
    location: "Brooklyn",
    neighborhood: "Brooklyn",
    description: "Spacious private room in a classic Brooklyn brownstone with high ceilings, exposed brick throughout, and beautiful natural light. Shared living spaces with 2 roommates.",
    images: [
      { src: listing2Bedroom, label: "Bedroom" },
      { src: listing2Living, label: "Living Room" },
      { src: listing2Kitchen, label: "Kitchen" },
      { src: listing2Bathroom, label: "Bathroom" },
    ],
    amenities: ["Laundry in Building", "Exposed Brick", "Natural Light", "High Ceilings", "Hardwood Floors", "Near Transit"],
  },
  "3": {
    id: 3,
    title: "2 Bedroom Apartment in Bed-Stuy",
    type: "2 Bedroom",
    bedrooms: "2BR Apartment",
    price: 1000,
    location: "Brooklyn",
    neighborhood: "Bed-Stuy",
    description: "Bright 2-bedroom apartment in Bedford-Stuyvesant featuring beautiful parquet hardwood floors, large windows, and classic pre-war details. Great for roommates or a small family.",
    images: [
      { src: listing3Bedroom, label: "Bedroom" },
      { src: listing3Living, label: "Living Room" },
      { src: listing3Kitchen, label: "Kitchen" },
      { src: listing3Bathroom, label: "Bathroom" },
    ],
    amenities: ["Hardwood Floors", "Large Windows", "Pet Friendly", "Near A/C Trains", "Pre-war Charm", "Spacious Layout"],
  },
  "4": {
    id: 4,
    title: "3 Bedroom Apartment in the Bronx",
    type: "3 Bedroom",
    bedrooms: "3BR Apartment",
    price: 1150,
    location: "Bronx",
    neighborhood: "Bronx",
    description: "Spacious 3-bedroom apartment perfect for families or roommates. Features carpeted bedrooms, good closet space, and heat included. Close to public transportation and shopping.",
    images: [
      { src: listing4Bedroom, label: "Bedroom" },
      { src: listing4Living, label: "Living Room" },
      { src: listing4Kitchen, label: "Kitchen" },
      { src: listing4Bathroom, label: "Bathroom" },
    ],
    amenities: ["Spacious Layout", "Near Transit", "Heat Included", "Good Closet Space", "Carpeted Bedrooms", "Family Friendly"],
  },
  "5": {
    id: 5,
    title: "Studio Apartment in NYC",
    type: "Studio",
    bedrooms: "Studio",
    price: 1200,
    location: "New York City",
    neighborhood: "New York City",
    description: "Efficient studio apartment with modern kitchenette, hardwood floors throughout, and good natural light. Perfect for singles or couples looking for their own space in the city.",
    images: [
      { src: listing5Main, label: "Main Room" },
      { src: listing5Kitchen, label: "Kitchen" },
      { src: listing5Bathroom, label: "Bathroom" },
    ],
    amenities: ["All Utilities", "Furnished Option", "Flexible Lease", "Hardwood Floors", "Modern Kitchen", "Natural Light"],
  },
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const listing = id ? listingsData[id] : null;

  if (!listing) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
          <Link to="/listings">
            <Button variant="outline">Back to Listings</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-20 pb-4 px-4 border-b border-border">
        <div className="container mx-auto">
          <Link 
            to="/listings" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Link>
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-card">
                <img
                  src={listing.images[selectedImage].src}
                  alt={`${listing.title} - ${listing.images[selectedImage].label}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail Strip */}
              <div className="grid grid-cols-4 gap-2">
                {listing.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? "border-primary" : "border-transparent hover:border-muted"
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              {/* Image Label */}
              <p className="text-sm text-muted-foreground text-center">
                {listing.images[selectedImage].label}
              </p>
            </div>

            {/* Listing Details */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <Badge className="mb-2">{listing.type}</Badge>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.neighborhood}, {listing.location}</span>
                </div>
                <p className="text-4xl font-bold text-foreground">
                  ${listing.price}<span className="text-lg font-normal text-muted-foreground">/month</span>
                </p>
              </div>

              {/* Unit Type */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Home className="h-5 w-5" />
                <span>{listing.bedrooms}</span>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold mb-2">About This Unit</h2>
                <p className="text-muted-foreground">{listing.description}</p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Amenities</h2>
                <div className="grid grid-cols-2 gap-2">
                  {listing.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Notice */}
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-sm text-foreground font-medium mb-1">
                  <span className="text-primary">$20 Application</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Apply once, access multiple listings. Your application gives you access to all available units.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => setConsentModalOpen(true)}
                >
                  Apply for $20
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  asChild
                >
                  <Link to="/listings">View Similar Units</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Disclaimer */}
      <footer className="bg-card border-t border-border px-4 py-8 mt-12">
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

export default ListingDetail;
