import { BookingPageConfig } from '@/types/bookingPageConfig';
import { Clock, MapPin, Calendar } from 'lucide-react';
import LogoInsignia from '@/components/LogoInsignia';

interface BookingPreviewProps {
  config: BookingPageConfig;
  viewMode: 'desktop' | 'mobile';
  selectedElement: string | null;
  onSelectElement: (elementId: string) => void;
}

export function BookingPreview({ config, viewMode, selectedElement, onSelectElement }: BookingPreviewProps) {
  const { theme, cover, header, layout, buttons } = config;

  const fontFamily = {
    'Inter': 'Inter, sans-serif',
    'System': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'Poppins': 'Poppins, sans-serif',
    'DM Sans': '"DM Sans", sans-serif',
  }[theme.font] || 'Inter, sans-serif';

  const spacingClass = {
    compact: 'p-4',
    comfortable: 'p-6',
    spacious: 'p-8',
  }[layout.spacing];

  const cardStyles = {
    flat: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' },
    glass: { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' },
    shadow: { background: 'rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  }[layout.cardStyle];

  const buttonStyles = {
    background: buttons.style === 'filled' ? theme.primary : 'transparent',
    border: buttons.style === 'outline' ? `2px solid ${theme.primary}` : 'none',
    color: buttons.style === 'filled' ? '#ffffff' : theme.primary,
    boxShadow: buttons.shadow ? `0 4px 14px ${theme.primary}40` : 'none',
    borderRadius: `${theme.radius}px`,
  };

  const getEditableProps = (elementId: string) => ({
    'data-edit-id': elementId,
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectElement(elementId);
    },
    className: `cursor-pointer transition-all ${selectedElement === elementId ? 'ring-2 ring-offset-2 ring-blue-500 ring-offset-transparent' : 'hover:ring-1 hover:ring-blue-400/50'}`,
  });

  const renderCover = () => {
    if (cover.style === 'none') return null;

    if (cover.style === 'gradient') {
      return (
        <div
          {...getEditableProps('cover')}
          className={`absolute inset-0 ${getEditableProps('cover').className}`}
          style={{
            background: `linear-gradient(135deg, ${theme.primary}30 0%, ${theme.background} 100%)`,
          }}
        />
      );
    }

    if (cover.style === 'image' && cover.imageUrl) {
      return (
        <div
          {...getEditableProps('cover')}
          className={`absolute inset-0 ${getEditableProps('cover').className}`}
          style={{
            backgroundImage: `url(${cover.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `rgba(0,0,0,${cover.overlay})` }}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 bg-muted/30 flex items-center justify-center p-4 sm:p-8 overflow-auto">
      <div
        className={`relative overflow-hidden transition-all duration-300 ${viewMode === 'mobile' ? 'w-[375px]' : 'w-full'}`}
        style={{
          maxWidth: viewMode === 'desktop' ? `${layout.maxWidth}px` : '375px',
          minHeight: viewMode === 'mobile' ? '667px' : '600px',
          background: theme.background,
          color: theme.text,
          fontFamily,
          borderRadius: `${theme.radius}px`,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {renderCover()}

        <div className="relative z-10">
          {/* Header */}
          <header
            {...getEditableProps('header')}
            className={`border-b border-white/10 py-4 px-6 flex items-center gap-3 ${getEditableProps('header').className}`}
            style={{
              justifyContent: header.align === 'center' ? 'center' : header.align === 'right' ? 'flex-end' : 'flex-start',
            }}
          >
            {header.showLogo && (
              header.logoUrl ? (
                <img src={header.logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
              ) : (
                <LogoInsignia className="h-8 w-8" />
              )
            )}
            <div style={{ textAlign: header.align }}>
              <h1 className="font-semibold">{header.title}</h1>
              {header.tagline && (
                <p className="text-sm opacity-70">{header.tagline}</p>
              )}
            </div>
          </header>

          {/* Main content */}
          <main className={spacingClass}>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Book an Appointment</h2>
              <p className="text-sm opacity-70">Select a service to get started</p>
            </div>

            {/* Sample appointment types */}
            <div className="space-y-3">
              {['Consultation Call', 'Follow-up Session'].map((name, i) => (
                <div
                  key={i}
                  {...getEditableProps('layout')}
                  className={`p-4 rounded-lg cursor-pointer ${getEditableProps('layout').className}`}
                  style={{
                    ...cardStyles,
                    borderRadius: `${theme.radius}px`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{name}</h3>
                      <p className="text-sm opacity-60">Quick intro meeting</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm opacity-70">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {i === 0 ? '30' : '15'} min
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Video
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sample button */}
            <div className="mt-6">
              <button
                {...getEditableProps('buttons')}
                className={`w-full py-3 px-6 font-medium flex items-center justify-center gap-2 ${getEditableProps('buttons').className}`}
                style={buttonStyles}
              >
                <Calendar className="h-4 w-4" />
                Book Appointment
              </button>
            </div>

            {/* Theme preview */}
            <div
              {...getEditableProps('theme')}
              className={`mt-6 p-4 rounded-lg ${getEditableProps('theme').className}`}
              style={{
                ...cardStyles,
                borderRadius: `${theme.radius}px`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ background: theme.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ background: theme.accent }}
                />
                <span className="text-sm opacity-70">Theme colors</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
