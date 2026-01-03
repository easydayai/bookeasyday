/**
 * Page Model for Daisy's JSON Patch-based editing
 * This represents the booking page configuration in a format optimized for live editing
 */

export interface ServiceItem {
  id: string;
  name: string;
  durationMin: number;
  price: number | null;
  description: string;
}

export interface PageModel {
  brand: {
    primary: string;
    accent: string;
    background: string;
    text: string;
    radius: number;
    font: string;
  };
  hero: {
    headline: string;
    tagline: string;
    align: 'left' | 'center' | 'right';
  };
  cover: {
    style: 'none' | 'gradient' | 'image';
    imageUrl: string | null;
    overlay: number;
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
  logo: {
    show: boolean;
    url: string;
  };
  services: ServiceItem[];
}

/**
 * Convert BookingPageConfig to PageModel format
 */
export function bookingConfigToPageModel(
  config: {
    theme: { primary: string; accent: string; background: string; text: string; radius: number; font: string };
    cover: { style: string; imageUrl: string | null; overlay: number };
    header: { showLogo: boolean; logoUrl: string; title: string; tagline: string; align: string };
    layout: { maxWidth: number; cardStyle: string; spacing: string };
    buttons: { style: string; shadow: boolean };
  },
  services: Array<{ id: string; name: string; duration_minutes: number; price: number | null; description: string | null }>
): PageModel {
  return {
    brand: {
      primary: config.theme.primary,
      accent: config.theme.accent,
      background: config.theme.background,
      text: config.theme.text,
      radius: config.theme.radius,
      font: config.theme.font,
    },
    hero: {
      headline: config.header.title,
      tagline: config.header.tagline,
      align: config.header.align as 'left' | 'center' | 'right',
    },
    cover: {
      style: config.cover.style as 'none' | 'gradient' | 'image',
      imageUrl: config.cover.imageUrl,
      overlay: config.cover.overlay,
    },
    layout: {
      maxWidth: config.layout.maxWidth,
      cardStyle: config.layout.cardStyle as 'flat' | 'glass' | 'shadow',
      spacing: config.layout.spacing as 'compact' | 'comfortable' | 'spacious',
    },
    buttons: {
      style: config.buttons.style as 'filled' | 'outline',
      shadow: config.buttons.shadow,
    },
    logo: {
      show: config.header.showLogo,
      url: config.header.logoUrl,
    },
    services: services.map(s => ({
      id: s.id,
      name: s.name,
      durationMin: s.duration_minutes,
      price: s.price,
      description: s.description || '',
    })),
  };
}

/**
 * Convert PageModel back to BookingPageConfig format
 */
export function pageModelToBookingConfig(model: PageModel): {
  theme: { primary: string; accent: string; background: string; text: string; radius: number; font: string };
  cover: { style: string; imageUrl: string | null; overlay: number };
  header: { showLogo: boolean; logoUrl: string; title: string; tagline: string; align: string };
  layout: { maxWidth: number; cardStyle: string; spacing: string };
  buttons: { style: string; shadow: boolean };
} {
  return {
    theme: {
      primary: model.brand.primary,
      accent: model.brand.accent,
      background: model.brand.background,
      text: model.brand.text,
      radius: model.brand.radius,
      font: model.brand.font,
    },
    cover: {
      style: model.cover.style,
      imageUrl: model.cover.imageUrl,
      overlay: model.cover.overlay,
    },
    header: {
      showLogo: model.logo.show,
      logoUrl: model.logo.url,
      title: model.hero.headline,
      tagline: model.hero.tagline,
      align: model.hero.align,
    },
    layout: {
      maxWidth: model.layout.maxWidth,
      cardStyle: model.layout.cardStyle,
      spacing: model.layout.spacing,
    },
    buttons: {
      style: model.buttons.style,
      shadow: model.buttons.shadow,
    },
  };
}
