// Listing images
import listing1Bedroom from "@/assets/listing-1-bedroom.jpg";
import listing1Living from "@/assets/listing-1-living.jpg";
import listing1Kitchen from "@/assets/listing-1-kitchen.jpg";
import listing1Bathroom from "@/assets/listing-1-bathroom.jpg";

import listing2Bedroom from "@/assets/listing-2-bedroom.jpg";
import listing2Living from "@/assets/listing-2-living.jpg";
import listing2Kitchen from "@/assets/listing-2-kitchen.jpg";
import listing2Bathroom from "@/assets/listing-2-bathroom.jpg";

import listing3Bedroom from "@/assets/listing-3-bedroom.jpg";
import listing3Living from "@/assets/listing-3-living.jpg";
import listing3Kitchen from "@/assets/listing-3-kitchen.jpg";
import listing3Bathroom from "@/assets/listing-3-bathroom.jpg";

import listing4Bedroom from "@/assets/listing-4-bedroom.jpg";
import listing4Living from "@/assets/listing-4-living.jpg";
import listing4Kitchen from "@/assets/listing-4-kitchen.jpg";
import listing4Bathroom from "@/assets/listing-4-bathroom.jpg";

import listing5Main from "@/assets/listing-5-main.jpg";
import listing5Kitchen from "@/assets/listing-5-kitchen.jpg";
import listing5Bathroom from "@/assets/listing-5-bathroom.jpg";

export interface ListingImage {
  src: string;
  label: string;
}

export interface Listing {
  id: number;
  listingNumber: string; // e.g., "#101"
  title: string;
  type: string;
  bedrooms: string;
  price: number;
  location: string;
  neighborhood: string;
  description: string;
  images: ListingImage[];
  thumbnailImage: string;
  amenities: string[];
  available: boolean;
}

// Convert listing ID to listing number (e.g., 1 -> "#101")
export const getListingNumber = (id: number): string => `#${100 + id}`;

// Parse listing number from user input (e.g., "#101", "101", "Listing 101" -> 1)
export const parseListingNumber = (input: string): number | null => {
  const match = input.match(/(\d{3})/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 101 && num <= 199) {
      return num - 100;
    }
  }
  return null;
};

export const listings: Listing[] = [
  {
    id: 1,
    listingNumber: "#101",
    title: "Private Room in Bushwick",
    type: "Private Room",
    bedrooms: "Room in 2BR",
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
    thumbnailImage: listing1Bedroom,
    amenities: ["Wifi Included", "Heat & Hot Water", "Near L Train", "Laundry Nearby", "Hardwood Floors", "Exposed Brick"],
    available: true,
  },
  {
    id: 2,
    listingNumber: "#102",
    title: "Private Room in Brooklyn Brownstone",
    type: "Private Room",
    bedrooms: "Room in 3BR",
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
    thumbnailImage: listing2Bedroom,
    amenities: ["Laundry in Building", "Exposed Brick", "Natural Light", "High Ceilings", "Hardwood Floors", "Near Transit"],
    available: true,
  },
  {
    id: 3,
    listingNumber: "#103",
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
    thumbnailImage: listing3Living,
    amenities: ["Hardwood Floors", "Large Windows", "Pet Friendly", "Near A/C Trains", "Pre-war Charm", "Spacious Layout"],
    available: true,
  },
  {
    id: 4,
    listingNumber: "#104",
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
    thumbnailImage: listing4Living,
    amenities: ["Spacious Layout", "Near Transit", "Heat Included", "Good Closet Space", "Carpeted Bedrooms", "Family Friendly"],
    available: true,
  },
  {
    id: 5,
    listingNumber: "#105",
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
    thumbnailImage: listing5Main,
    amenities: ["All Utilities", "Furnished Option", "Flexible Lease", "Hardwood Floors", "Modern Kitchen", "Natural Light"],
    available: true,
  },
];

export const getListingById = (id: number): Listing | undefined => {
  return listings.find((l) => l.id === id);
};

export const getListingByNumber = (listingNumber: string): Listing | undefined => {
  return listings.find((l) => l.listingNumber === listingNumber);
};

export const filterListingsByType = (type: string): Listing[] => {
  if (type === "room") {
    return listings.filter((l) => l.type === "Private Room");
  }
  if (type === "studio") {
    return listings.filter((l) => l.type === "Studio");
  }
  if (type === "2br") {
    return listings.filter((l) => l.type === "2 Bedroom");
  }
  if (type === "3br") {
    return listings.filter((l) => l.type === "3 Bedroom");
  }
  return listings;
};
