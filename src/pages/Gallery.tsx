import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = [
    { src: gallery1, caption: "Modern 2BR Living Room – Houston, TX" },
    { src: gallery2, caption: "Luxury 1BR Bedroom – Atlanta, GA" },
    { src: gallery3, caption: "Contemporary Kitchen – Phoenix, AZ" },
    { src: gallery4, caption: "Spa-like Bathroom – Dallas, TX" },
    { src: gallery5, caption: "Rooftop Lounge Area – Miami, FL" },
    { src: gallery6, caption: "Private Balcony with City View – Chicago, IL" },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">Apartment Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            These are sample units and styles we work with. Actual availability and locations may vary.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {images.map((image, idx) => (
            <div
              key={idx}
              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
              onClick={() => setSelectedImage(idx)}
            >
              <img
                src={image.src}
                alt={image.caption}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-medium">{image.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage !== null && (
          <div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background transition"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={images[selectedImage].src}
                alt={images[selectedImage].caption}
                className="w-full h-auto rounded-lg"
              />
              <p className="text-center mt-4 text-lg">{images[selectedImage].caption}</p>
            </div>
          </div>
        )}

        <div className="text-center space-y-6 py-12 bg-hero-gradient rounded-lg">
          <h2 className="text-3xl font-bold">Apply Once – Let Us Find Your Match</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stop scrolling endlessly. Our rental specialists will match you with properties that fit
            your needs and budget.
          </p>
          <Button asChild size="lg" className="h-12 px-8">
            <Link to="/apply">Start Your Application – $20</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
