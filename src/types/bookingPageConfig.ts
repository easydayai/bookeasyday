export interface BookingPageConfig {
  theme: {
    primary: string;
    accent: string;
    background: string;
    text: string;
    radius: number;
    font: string;
  };
  cover: {
    style: 'none' | 'gradient' | 'image';
    imageUrl: string | null;
    overlay: number;
  };
  header: {
    showLogo: boolean;
    logoUrl: string;
    title: string;
    tagline: string;
    align: 'left' | 'center' | 'right';
  };
  layout: {
    maxWidth: number;
    cardStyle: 'flat' | 'glass' | 'shadow';
    spacing: 'compact' | 'comfortable' | 'spacious';
  };
  buttons: {
    style: 'filled' | 'outline';
    shadow: boolean;
  };
}

export const defaultBookingPageConfig: BookingPageConfig = {
  theme: {
    primary: '#6d28d9',
    accent: '#22c55e',
    background: '#0b1220',
    text: '#e5e7eb',
    radius: 14,
    font: 'Inter',
  },
  cover: {
    style: 'gradient',
    imageUrl: null,
    overlay: 0.35,
  },
  header: {
    showLogo: true,
    logoUrl: '',
    title: 'Book an Appointment',
    tagline: 'Book in 60 seconds',
    align: 'left',
  },
  layout: {
    maxWidth: 920,
    cardStyle: 'glass',
    spacing: 'comfortable',
  },
  buttons: {
    style: 'filled',
    shadow: true,
  },
};
