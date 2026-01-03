import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBookingPageConfig } from '@/hooks/useBookingPageConfig';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, Layers, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { BuilderTopBar } from '@/components/booking-builder/BuilderTopBar';
import { ComponentList } from '@/components/booking-builder/ComponentList';
import { InspectorPanel } from '@/components/booking-builder/InspectorPanel';
import { BookingPreview } from '@/components/booking-builder/BookingPreview';

export default function BookingBuilder() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const {
    config,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    updateConfig,
    publishConfig,
    discardChanges,
    resetToDefaults,
  } = useBookingPageConfig();

  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'components' | 'inspector' | null>(null);

  // Auto-open inspector when element is selected on mobile
  useEffect(() => {
    if (isMobile && selectedElement) {
      setMobilePanel('inspector');
    }
  }, [selectedElement, isMobile]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handlePublish = async () => {
    try {
      await publishConfig();
      toast({
        title: 'Published!',
        description: 'Your booking page changes are now live.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDiscard = () => {
    discardChanges();
    toast({
      title: 'Changes discarded',
      description: 'Reverted to the last published version.',
    });
  };

  const handleReset = () => {
    resetToDefaults();
    toast({
      title: 'Reset to defaults',
      description: 'All settings have been reset to defaults.',
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <BuilderTopBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onDiscard={handleDiscard}
        onReset={handleReset}
        onPublish={handlePublish}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Component list (hidden on mobile) */}
        <div className="hidden lg:flex">
          <ComponentList
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
          />
        </div>

        {/* Center - Live preview */}
        <BookingPreview
          config={config}
          viewMode={viewMode}
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
        />

        {/* Right panel - Inspector (hidden on mobile) */}
        <div className="hidden lg:flex">
          <InspectorPanel
            selectedElement={selectedElement}
            config={config}
            onUpdateConfig={updateConfig}
          />
        </div>
      </div>

      {/* Mobile floating action buttons */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 flex justify-center gap-3 z-50">
        <Button
          size="lg"
          variant="secondary"
          className="h-14 px-6 shadow-lg rounded-full"
          onClick={() => setMobilePanel('components')}
        >
          <Layers className="h-5 w-5 mr-2" />
          Components
        </Button>
        <Button
          size="lg"
          variant={selectedElement ? 'default' : 'secondary'}
          className="h-14 px-6 shadow-lg rounded-full"
          onClick={() => setMobilePanel('inspector')}
        >
          <SlidersHorizontal className="h-5 w-5 mr-2" />
          Edit
        </Button>
      </div>

      {/* Mobile Components Sheet */}
      <Sheet open={mobilePanel === 'components'} onOpenChange={(open) => !open && setMobilePanel(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle>Components</SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => setMobilePanel(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>
          <div className="h-full overflow-auto pb-20">
            <ComponentList
              selectedElement={selectedElement}
              onSelectElement={(id) => {
                setSelectedElement(id);
                setMobilePanel('inspector');
              }}
              isMobile
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Inspector Sheet */}
      <Sheet open={mobilePanel === 'inspector'} onOpenChange={(open) => !open && setMobilePanel(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle>
                {selectedElement ? (
                  selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1).replace('-', ' ')
                ) : 'Select an element'}
              </SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => setMobilePanel(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>
          <div className="h-full overflow-auto pb-20">
            <InspectorPanel
              selectedElement={selectedElement}
              config={config}
              onUpdateConfig={updateConfig}
              isMobile
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
