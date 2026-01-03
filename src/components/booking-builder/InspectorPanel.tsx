import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingPageConfig } from '@/types/bookingPageConfig';
import { Palette, Info } from 'lucide-react';

interface InspectorPanelProps {
  selectedElement: string | null;
  config: BookingPageConfig;
  onUpdateConfig: (path: string, value: unknown) => void;
  isMobile?: boolean;
}

export function InspectorPanel({ selectedElement, config, onUpdateConfig, isMobile }: InspectorPanelProps) {
  if (!selectedElement) {
    return (
      <div className={isMobile 
        ? "flex flex-col items-center justify-center p-8 text-center" 
        : "w-72 border-l border-border bg-background flex items-center justify-center"
      }>
        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Info className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground px-4">
            {isMobile 
              ? "Select a component from the list or tap an element in the preview"
              : "Click an element in the preview or select a component from the left panel"
            }
          </p>
        </div>
      </div>
    );
  }

  const renderThemeControls = () => (
    <div className="space-y-5">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Primary Color</Label>
        <div className="flex gap-3">
          <div className="relative">
            <Input
              type="color"
              value={config.theme.primary}
              onChange={(e) => onUpdateConfig('theme.primary', e.target.value)}
              className="w-14 h-12 p-1 cursor-pointer rounded-lg"
            />
          </div>
          <Input
            type="text"
            value={config.theme.primary}
            onChange={(e) => onUpdateConfig('theme.primary', e.target.value)}
            className="flex-1 h-12 font-mono text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Accent Color</Label>
        <div className="flex gap-3">
          <Input
            type="color"
            value={config.theme.accent}
            onChange={(e) => onUpdateConfig('theme.accent', e.target.value)}
            className="w-14 h-12 p-1 cursor-pointer rounded-lg"
          />
          <Input
            type="text"
            value={config.theme.accent}
            onChange={(e) => onUpdateConfig('theme.accent', e.target.value)}
            className="flex-1 h-12 font-mono text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Background Color</Label>
        <div className="flex gap-3">
          <Input
            type="color"
            value={config.theme.background}
            onChange={(e) => onUpdateConfig('theme.background', e.target.value)}
            className="w-14 h-12 p-1 cursor-pointer rounded-lg"
          />
          <Input
            type="text"
            value={config.theme.background}
            onChange={(e) => onUpdateConfig('theme.background', e.target.value)}
            className="flex-1 h-12 font-mono text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Text Color</Label>
        <div className="flex gap-3">
          <Input
            type="color"
            value={config.theme.text}
            onChange={(e) => onUpdateConfig('theme.text', e.target.value)}
            className="w-14 h-12 p-1 cursor-pointer rounded-lg"
          />
          <Input
            type="text"
            value={config.theme.text}
            onChange={(e) => onUpdateConfig('theme.text', e.target.value)}
            className="flex-1 h-12 font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderTypographyControls = () => (
    <div className="space-y-5">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Font Family</Label>
        <Select
          value={config.theme.font}
          onValueChange={(value) => onUpdateConfig('theme.font', value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="System">System</SelectItem>
            <SelectItem value="Poppins">Poppins</SelectItem>
            <SelectItem value="DM Sans">DM Sans</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Corner Radius</Label>
          <span className="text-sm text-muted-foreground">{config.theme.radius}px</span>
        </div>
        <Slider
          value={[config.theme.radius]}
          onValueChange={([value]) => onUpdateConfig('theme.radius', value)}
          min={0}
          max={24}
          step={2}
          className="py-2"
        />
      </div>
    </div>
  );

  const renderHeaderControls = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
        <Label className="text-sm font-medium">Show Logo</Label>
        <Switch
          checked={config.header.showLogo}
          onCheckedChange={(checked) => onUpdateConfig('header.showLogo', checked)}
        />
      </div>

      {config.header.showLogo && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Logo URL</Label>
          <Input
            value={config.header.logoUrl}
            onChange={(e) => onUpdateConfig('header.logoUrl', e.target.value)}
            placeholder="https://..."
            className="h-12"
          />
        </div>
      )}

      <div className="space-y-3">
        <Label className="text-sm font-medium">Title</Label>
        <Input
          value={config.header.title}
          onChange={(e) => onUpdateConfig('header.title', e.target.value)}
          className="h-12"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Tagline</Label>
        <Input
          value={config.header.tagline}
          onChange={(e) => onUpdateConfig('header.tagline', e.target.value)}
          className="h-12"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Alignment</Label>
        <Select
          value={config.header.align}
          onValueChange={(value) => onUpdateConfig('header.align', value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderCoverControls = () => (
    <div className="space-y-5">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Cover Style</Label>
        <Select
          value={config.cover.style}
          onValueChange={(value) => onUpdateConfig('cover.style', value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="gradient">Gradient</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.cover.style === 'image' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Image URL</Label>
          <Input
            value={config.cover.imageUrl || ''}
            onChange={(e) => onUpdateConfig('cover.imageUrl', e.target.value)}
            placeholder="https://..."
            className="h-12"
          />
        </div>
      )}

      {config.cover.style !== 'none' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Overlay Opacity</Label>
            <span className="text-sm text-muted-foreground">{Math.round(config.cover.overlay * 100)}%</span>
          </div>
          <Slider
            value={[config.cover.overlay * 100]}
            onValueChange={([value]) => onUpdateConfig('cover.overlay', value / 100)}
            min={0}
            max={100}
            step={5}
            className="py-2"
          />
        </div>
      )}
    </div>
  );

  const renderLayoutControls = () => (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Max Width</Label>
          <span className="text-sm text-muted-foreground">{config.layout.maxWidth}px</span>
        </div>
        <Slider
          value={[config.layout.maxWidth]}
          onValueChange={([value]) => onUpdateConfig('layout.maxWidth', value)}
          min={600}
          max={1200}
          step={20}
          className="py-2"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Card Style</Label>
        <Select
          value={config.layout.cardStyle}
          onValueChange={(value) => onUpdateConfig('layout.cardStyle', value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flat">Flat</SelectItem>
            <SelectItem value="glass">Glass</SelectItem>
            <SelectItem value="shadow">Shadow</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Spacing</Label>
        <Select
          value={config.layout.spacing}
          onValueChange={(value) => onUpdateConfig('layout.spacing', value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="spacious">Spacious</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderButtonControls = () => (
    <div className="space-y-5">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Button Style</Label>
        <Select
          value={config.buttons.style}
          onValueChange={(value) => onUpdateConfig('buttons.style', value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="filled">Filled</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
        <Label className="text-sm font-medium">Button Shadow</Label>
        <Switch
          checked={config.buttons.shadow}
          onCheckedChange={(checked) => onUpdateConfig('buttons.shadow', checked)}
        />
      </div>
    </div>
  );

  const getControls = () => {
    switch (selectedElement) {
      case 'theme':
        return renderThemeControls();
      case 'typography':
        return renderTypographyControls();
      case 'header':
        return renderHeaderControls();
      case 'cover':
        return renderCoverControls();
      case 'layout':
        return renderLayoutControls();
      case 'buttons':
        return renderButtonControls();
      default:
        if (selectedElement?.startsWith('preset-')) {
          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Apply this preset theme to quickly change your booking page's look and feel.
              </p>
              <Button 
                className="w-full h-12" 
                onClick={() => {
                  const presetId = selectedElement.replace('preset-', '');
                  applyPreset(presetId);
                }}
              >
                <Palette className="h-4 w-4 mr-2" />
                Apply Preset
              </Button>
            </div>
          );
        }
        return null;
    }
  };

  const applyPreset = (presetId: string) => {
    switch (presetId) {
      case 'dark-purple':
        onUpdateConfig('theme.primary', '#6d28d9');
        onUpdateConfig('theme.background', '#0b1220');
        onUpdateConfig('theme.text', '#e5e7eb');
        break;
      case 'light-minimal':
        onUpdateConfig('theme.primary', '#3b82f6');
        onUpdateConfig('theme.background', '#ffffff');
        onUpdateConfig('theme.text', '#1f2937');
        break;
      case 'warm-sunset':
        onUpdateConfig('theme.primary', '#f97316');
        onUpdateConfig('theme.background', '#1c1917');
        onUpdateConfig('theme.text', '#fafaf9');
        break;
      case 'ocean-blue':
        onUpdateConfig('theme.primary', '#0ea5e9');
        onUpdateConfig('theme.background', '#0f172a');
        onUpdateConfig('theme.text', '#e2e8f0');
        break;
      case 'forest-green':
        onUpdateConfig('theme.primary', '#22c55e');
        onUpdateConfig('theme.background', '#14532d');
        onUpdateConfig('theme.text', '#dcfce7');
        break;
    }
  };

  const getTitle = () => {
    switch (selectedElement) {
      case 'theme': return 'Theme & Colors';
      case 'typography': return 'Typography';
      case 'header': return 'Header';
      case 'cover': return 'Cover Style';
      case 'layout': return 'Layout';
      case 'buttons': return 'Buttons';
      default:
        if (selectedElement?.startsWith('preset-')) {
          return 'Apply Preset';
        }
        return 'Inspector';
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col p-4">
        {getControls()}
      </div>
    );
  }

  return (
    <div className="w-72 border-l border-border bg-background flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm">{getTitle()}</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        {getControls()}
      </ScrollArea>
    </div>
  );
}
