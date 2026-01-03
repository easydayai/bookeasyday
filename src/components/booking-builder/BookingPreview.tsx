import { BookingPageConfig } from '@/types/bookingPageConfig';
import { Clock, MapPin, Calendar } from 'lucide-react';
import LogoInsignia from '@/components/LogoInsignia';

interface BookingPreviewProps {
  config: BookingPageConfig;
  viewMode: 'desktop' | 'mobile';
  selectedElement: string | null;
  onSelectElement: (elementId: string) => void;
  isEditMode?: boolean;
}

export function BookingPreview({ config, viewMode, selectedElement, onSelectElement, isEditMode = true }: BookingPreviewProps) {
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

  const getEditableProps = (elementId: string) => {
    if (!isEditMode) {
      return {
        'data-edit-id': elementId,
        className: '',
      };
    }

    const isSelected = selectedElement === elementId;
    return {
      'data-edit-id': elementId,
      onClick: (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onSelectElement(elementId);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.stopPropagation();
        onSelectElement(elementId);
      },
      className: `cursor-pointer transition-all touch-manipulation ${
        isSelected 
          ? 'ring-2 ring-offset-2 ring-primary ring-offset-transparent' 
          : 'hover:ring-1 hover:ring-primary/50 active:ring-1 active:ring-primary/50'
      }`,
      style: { WebkitTapHighlightColor: 'transparent' } as React.CSSProperties,
    };
  };

  const renderCover = () => {
    if (cover.style === 'none') return null;

    const editProps = getEditableProps('cover');

    if (cover.style === 'gradient') {
      return (
        <div
          data-edit-id={editProps['data-edit-id']}
          onClick={editProps.onClick as any}
          onTouchEnd={editProps.onTouchEnd}
          className={`absolute inset-0 ${editProps.className}`}
          style={{
            background: `linear-gradient(135deg, ${theme.primary}30 0%, ${theme.background} 100%)`,
            ...editProps.style,
          }}
        />
      );
    }

    if (cover.style === 'image' && cover.imageUrl) {
      return (
        <div
          data-edit-id={editProps['data-edit-id']}
          onClick={editProps.onClick as any}
          onTouchEnd={editProps.onTouchEnd}
          className={`absolute inset-0 ${editProps.className}`}
          style={{
            backgroundImage: `url(${cover.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            ...editProps.style,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `rgba(0,0,0,${cover.overlay})` }}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 bg-muted/30 flex items-start lg:items-center justify-center p-2 sm:p-4 lg:p-8 overflow-auto">
      <div
        className={`relative overflow-hidden transition-all duration-300 ${viewMode === 'mobile' ? 'w-full max-w-[375px]' : 'w-full'}`}
        style={{
          maxWidth: viewMode === 'desktop' ? `${layout.maxWidth}px` : '375px',
          minHeight: viewMode === 'mobile' ? '500px' : '600px',
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
            className={`border-b border-white/10 py-4 px-4 sm:px-6 flex items-center gap-3 ${getEditableProps('header').className}`}
            style={{
              justifyContent: header.align === 'center' ? 'center' : header.align === 'right' ? 'flex-end' : 'flex-start',
              ...getEditableProps('header').style,
            }}
          >
            {header.showLogo && (
              header.logoUrl ? (
                <img src={header.logoUrl} alt="Logo" className="h-8 w-8 object-contain pointer-events-none" />
              ) : (
                <LogoInsignia className="h-8 w-8 pointer-events-none" />
              )
            )}
            <div style={{ textAlign: header.align }} className="pointer-events-none">
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
              {['Consultation Call', 'Follow-up Session'].map((name, i) => {
                const editProps = getEditableProps('layout');
                return (
                  <div
                    key={i}
                    data-edit-id={editProps['data-edit-id']}
                    onClick={editProps.onClick as any}
                    onTouchEnd={editProps.onTouchEnd}
                    className={`p-4 rounded-lg ${editProps.className}`}
                    style={{
                      ...cardStyles,
                      borderRadius: `${theme.radius}px`,
                      ...editProps.style,
                    }}
                  >
                    <div className="flex items-center justify-between pointer-events-none">
                      <div>
                        <h3 className="font-medium">{name}</h3>
                        <p className="text-sm opacity-60">Quick intro meeting</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm opacity-70">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {i === 0 ? '30' : '15'} min
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Video
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sample button */}
            <div className="mt-6">
              <button
                {...getEditableProps('buttons')}
                className={`w-full py-3 px-6 font-medium flex items-center justify-center gap-2 ${getEditableProps('buttons').className}`}
                style={{
                  ...buttonStyles,
                  ...getEditableProps('buttons').style,
                }}
              >
                <Calendar className="h-4 w-4 pointer-events-none" />
                <span className="pointer-events-none">Book Appointment</span>
              </button>
            </div>

            {/* Theme preview */}
            <div
              {...getEditableProps('theme')}
              className={`mt-6 p-4 rounded-lg ${getEditableProps('theme').className}`}
              style={{
                ...cardStyles,
                borderRadius: `${theme.radius}px`,
                ...getEditableProps('theme').style,
              }}
            >
              <div className="flex items-center gap-3 pointer-events-none">
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
