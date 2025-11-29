import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Home, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsentModal } from "@/components/ConsentModal";
import { getListingById } from "@/data/listings";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const listing = id ? getListingById(parseInt(id, 10)) : null;

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
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-card relative">
                <img
                  src={listing.images[selectedImage].src}
                  alt={`${listing.title} - ${listing.images[selectedImage].label}`}
                  className="w-full h-full object-cover"
                />
                {/* Listing Number Badge */}
                <Badge variant="secondary" className="absolute top-4 right-4 bg-background/90 text-foreground font-bold text-sm px-3 py-1">
                  Listing {listing.listingNumber}
                </Badge>
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
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary text-primary-foreground">{listing.type}</Badge>
                  <Badge variant="outline" className="font-bold">Listing {listing.listingNumber}</Badge>
                </div>
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
                  Apply for Listing {listing.listingNumber} – $20
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
