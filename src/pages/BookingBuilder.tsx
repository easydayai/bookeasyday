import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DaisyProvider } from '@/contexts/DaisyContext';
import { useBookingPageConfig } from '@/hooks/useBookingPageConfig';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useViewportHeight } from '@/hooks/use-viewport-height';
import { Loader2, Layers, SlidersHorizontal, X, ChevronLeft, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { DaisyAssistant } from '@/components/DaisyAssistant';

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

  useViewportHeight();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'components' | 'inspector' | null>(null);
  const [mobileEditMode, setMobileEditMode] = useState(false);

  // Auto-open inspector when element is selected on mobile in edit mode
  useEffect(() => {
    if (isMobile && selectedElement && mobileEditMode) {
      setMobilePanel('inspector');
    }
  }, [selectedElement, isMobile, mobileEditMode]);

  // Set mobile view mode automatically on mobile devices
  useEffect(() => {
    if (isMobile) {
      setViewMode('mobile');
    }
  }, [isMobile]);

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

  const handleMobileElementSelect = (elementId: string) => {
    if (mobileEditMode) {
      setSelectedElement(elementId);
      setMobilePanel('inspector');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <DaisyProvider>
      <div 
        className="flex flex-col bg-background overflow-hidden"
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
      >
        {/* Mobile header */}
        <header className="h-14 shrink-0 border-b border-border bg-background flex items-center justify-between px-3 z-50">
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <span className="font-semibold text-sm">Page Builder</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Edit/Preview mode toggle */}
            <div className="flex items-center bg-secondary rounded-lg p-1">
              <Button
                variant={!mobileEditMode ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setMobileEditMode(false)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                variant={mobileEditMode ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setMobileEditMode(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isSaving}
              className="h-8"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publish'}
            </Button>
          </div>
        </header>

        {/* Edit mode indicator banner */}
        {mobileEditMode && (
          <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-center gap-2 shrink-0">
            <Pencil className="h-3 w-3 text-primary" />
            <span className="text-xs text-primary font-medium">
              Tap elements to edit, or use the buttons below
            </span>
          </div>
        )}

        {/* Preview area - takes remaining space */}
        <div className="flex-1 overflow-auto relative">
          <BookingPreview
            config={config}
            viewMode="mobile"
            selectedElement={mobileEditMode ? selectedElement : null}
            onSelectElement={handleMobileElementSelect}
            isEditMode={mobileEditMode}
          />
        </div>

        {/* Mobile bottom action bar - with safe area padding */}
        <div 
          className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 z-50"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          {mobileEditMode ? (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 h-12"
                onClick={() => setMobilePanel('components')}
              >
                <Layers className="h-5 w-5 mr-2" />
                Components
              </Button>
              <Button
                variant={selectedElement ? 'default' : 'secondary'}
                className="flex-1 h-12"
                onClick={() => setMobilePanel('inspector')}
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                Edit Style
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={handleDiscard}
                disabled={!hasUnsavedChanges}
              >
                Discard Changes
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={handleReset}
              >
                Reset All
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Components Sheet */}
        <Sheet open={mobilePanel === 'components'} onOpenChange={(open) => !open && setMobilePanel(null)}>
          <SheetContent 
            side="bottom" 
            className="h-[80vh] rounded-t-2xl p-0"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <SheetHeader className="p-4 border-b border-border sticky top-0 bg-background z-10">
              <div className="flex items-center justify-between">
                <SheetTitle>Select Component</SheetTitle>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setMobilePanel(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </SheetHeader>
            <div className="overflow-auto pb-6" style={{ maxHeight: 'calc(80vh - 60px)' }}>
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
          <SheetContent 
            side="bottom" 
            className="h-[80vh] rounded-t-2xl p-0"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <SheetHeader className="p-4 border-b border-border sticky top-0 bg-background z-10">
              <div className="flex items-center justify-between">
                <SheetTitle>
                  {selectedElement ? (
                    selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1).replace('-', ' ')
                  ) : 'Select an element'}
                </SheetTitle>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setMobilePanel(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </SheetHeader>
            <div className="overflow-auto pb-6" style={{ maxHeight: 'calc(80vh - 60px)' }}>
              <InspectorPanel
                selectedElement={selectedElement}
                config={config}
                onUpdateConfig={updateConfig}
                isMobile
              />
            </div>
          </SheetContent>
        </Sheet>
        
        <DaisyAssistant />
      </div>
      </DaisyProvider>
    );
  }

  // Desktop layout
  return (
    <DaisyProvider>
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
        {/* Left panel - Component list */}
        <ComponentList
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
        />

        {/* Center - Live preview */}
        <BookingPreview
          config={config}
          viewMode={viewMode}
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
          isEditMode
        />

        {/* Right panel - Inspector */}
        <InspectorPanel
          selectedElement={selectedElement}
          config={config}
          onUpdateConfig={updateConfig}
        />
      </div>
      
      <DaisyAssistant />
    </div>
    </DaisyProvider>
  );
}
