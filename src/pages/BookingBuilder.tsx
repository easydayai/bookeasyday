import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBookingPageConfig } from '@/hooks/useBookingPageConfig';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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

  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

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
    </div>
  );
}
