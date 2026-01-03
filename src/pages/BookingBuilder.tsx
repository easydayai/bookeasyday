import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBookingPageConfig } from '@/hooks/useBookingPageConfig';
import { useDaisy } from '@/contexts/DaisyContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useViewportHeight } from '@/hooks/use-viewport-height';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Layers, SlidersHorizontal, X, ChevronLeft, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { bookingConfigToPageModel, pageModelToBookingConfig } from '@/types/pageModel';

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
    saveConfig,
    publishConfig,
    discardChanges,
    resetToDefaults,
  } = useBookingPageConfig();

  // Get user's slug for preview URL
  const [userSlug, setUserSlug] = useState<string | null>(null);

  const { setPageModel, pageModel, setSelectedNode } = useDaisy();

  useViewportHeight();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'components' | 'inspector' | null>(null);
  const [mobileEditMode, setMobileEditMode] = useState(false);
  const [services, setServices] = useState<Array<{ id: string; name: string; duration_minutes: number; price: number | null; description: string | null }>>([]);
  
  // Ref to prevent sync loops between config and pageModel
  const isSyncingFromPatch = useRef(false);
  const lastPageModelRef = useRef<string | null>(null);

  // Fetch services for the pageModel
  useEffect(() => {
    if (!user) return;
    const fetchServices = async () => {
      const { data } = await supabase
        .from('appointment_types')
        .select('id, name, duration_minutes, price, description')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (data) {
        setServices(data);
      }
    };
    fetchServices();
  }, [user]);

  // Sync config to pageModel for Daisy (only when NOT syncing from patches)
  useEffect(() => {
    if (!config || isSyncingFromPatch.current) return;
    const model = bookingConfigToPageModel(config, services);
    const modelStr = JSON.stringify(model);
    // Only update if different from last known model
    if (modelStr !== lastPageModelRef.current) {
      lastPageModelRef.current = modelStr;
      setPageModel(model);
    }
  }, [config, services, setPageModel]);

  // Sync pageModel changes back to config (when Daisy applies patches)
  useEffect(() => {
    if (!pageModel) return;
    const modelStr = JSON.stringify(pageModel);
    // Skip if this is just the initial sync from config
    if (modelStr === lastPageModelRef.current) return;
    
    lastPageModelRef.current = modelStr;
    isSyncingFromPatch.current = true;
    
    const newConfig = pageModelToBookingConfig(pageModel);
    // Apply each section
    Object.entries(newConfig).forEach(([section, value]) => {
      Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
        updateConfig(`${section}.${key}`, val);
      });
    });
    
    // Reset sync flag after a short delay to allow state to settle
    setTimeout(() => {
      isSyncingFromPatch.current = false;
    }, 100);
  }, [pageModel, updateConfig]);

  // Sync selected element to Daisy context
  useEffect(() => {
    if (selectedElement) {
      const parts = selectedElement.split('-');
      if (parts[0] === 'service' && parts[1]) {
        setSelectedNode({ type: 'service', index: parseInt(parts[1], 10) });
      } else {
        setSelectedNode({ type: selectedElement as 'brand' | 'hero' | 'cover' | 'layout' | 'buttons' | 'logo' });
      }
    } else {
      setSelectedNode(null);
    }
  }, [selectedElement, setSelectedNode]);

  // Cleanup pageModel on unmount
  useEffect(() => {
    return () => {
      setPageModel(null);
    };
  }, [setPageModel]);

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

  // Fetch user slug for preview URL
  useEffect(() => {
    if (!user) return;
    const fetchSlug = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('slug')
        .eq('id', user.id)
        .single();
      if (data?.slug) {
        setUserSlug(data.slug);
      }
    };
    fetchSlug();
  }, [user]);

  const handleSave = async () => {
    try {
      await saveConfig();
      toast({
        title: 'Saved!',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <BuilderTopBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onDiscard={handleDiscard}
        onReset={handleReset}
        onSave={handleSave}
        onPublish={handlePublish}
        previewUrl={userSlug ? `/book/${userSlug}` : undefined}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Component list */}
        <ComponentList
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
        />

        {/* Center - Live preview (full width now, no right sidebar) */}
        <BookingPreview
          config={config}
          viewMode={viewMode}
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
          isEditMode
        />
      </div>
    </div>
  );
}
