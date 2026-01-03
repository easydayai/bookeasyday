import { Button } from '@/components/ui/button';
import { Loader2, Monitor, Smartphone, Undo2, RotateCcw, Upload, Save, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoInsignia from '@/components/LogoInsignia';

interface BuilderTopBarProps {
  viewMode: 'desktop' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onDiscard: () => void;
  onReset: () => void;
  onSave: () => void;
  onPublish: () => void;
  previewUrl?: string;
}

export function BuilderTopBar({
  viewMode,
  onViewModeChange,
  hasUnsavedChanges,
  isSaving,
  onDiscard,
  onReset,
  onSave,
  onPublish,
  previewUrl,
}: BuilderTopBarProps) {
  return (
    <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <LogoInsignia className="h-7 w-7" />
          <span className="font-semibold hidden sm:inline">Easy Day AI</span>
        </Link>
        <div className="h-6 w-px bg-border hidden sm:block" />
        <span className="text-sm text-muted-foreground hidden sm:inline">Booking Page Builder</span>
      </div>

      <div className="flex items-center gap-2">
        {/* View mode toggle */}
        <div className="flex items-center bg-secondary rounded-lg p-1">
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => onViewModeChange('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => onViewModeChange('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Preview button */}
        {previewUrl && (
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Preview</span>
            </a>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          disabled={!hasUnsavedChanges || isSaving}
        >
          <Undo2 className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Discard</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={isSaving}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Reset</span>
        </Button>

        {/* Save button */}
        <Button
          variant="secondary"
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Save</span>
        </Button>

        <Button
          onClick={onPublish}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Publish
        </Button>
      </div>
    </div>
  );
}
