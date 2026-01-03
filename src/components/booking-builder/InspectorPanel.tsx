import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingPageConfig } from '@/types/bookingPageConfig';

interface InspectorPanelProps {
  selectedElement: string | null;
  config: BookingPageConfig;
  onUpdateConfig: (path: string, value: unknown) => void;
}

export function InspectorPanel({ selectedElement, config, onUpdateConfig }: InspectorPanelProps) {
  if (!selectedElement) {
    return (
      <div className="w-72 border-l border-border bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center px-4">
          Click an element in the preview or select a component from the left panel
        </p>
      </div>
    );
  }

  const renderThemeControls = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Primary Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={config.theme.primary}
            onChange={(e) => onUpdateConfig('theme.primary', e.target.value)}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={config.theme.primary}
            onChange={(e) => onUpdateConfig('theme.primary', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Accent Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={config.theme.accent}
            onChange={(e) => onUpdateConfig('theme.accent', e.target.value)}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={config.theme.accent}
            onChange={(e) => onUpdateConfig('theme.accent', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Background Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={config.theme.background}
            onChange={(e) => onUpdateConfig('theme.background', e.target.value)}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={config.theme.background}
            onChange={(e) => onUpdateConfig('theme.background', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={config.theme.text}
            onChange={(e) => onUpdateConfig('theme.text', e.target.value)}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={config.theme.text}
            onChange={(e) => onUpdateConfig('theme.text', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );

  const renderTypographyControls = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Font Family</Label>
        <Select
          value={config.theme.font}
          onValueChange={(value) => onUpdateConfig('theme.font', value)}
        >
          <SelectTrigger>
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

      <div className="space-y-2">
        <Label>Corner Radius: {config.theme.radius}px</Label>
        <Slider
          value={[config.theme.radius]}
          onValueChange={([value]) => onUpdateConfig('theme.radius', value)}
          min={0}
          max={24}
          step={2}
        />
      </div>
    </div>
  );

  const renderHeaderControls = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Show Logo</Label>
        <Switch
          checked={config.header.showLogo}
          onCheckedChange={(checked) => onUpdateConfig('header.showLogo', checked)}
        />
      </div>

      {config.header.showLogo && (
        <div className="space-y-2">
          <Label>Logo URL</Label>
          <Input
            value={config.header.logoUrl}
            onChange={(e) => onUpdateConfig('header.logoUrl', e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={config.header.title}
          onChange={(e) => onUpdateConfig('header.title', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Tagline</Label>
        <Input
          value={config.header.tagline}
          onChange={(e) => onUpdateConfig('header.tagline', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Alignment</Label>
        <Select
          value={config.header.align}
          onValueChange={(value) => onUpdateConfig('header.align', value)}
        >
          <SelectTrigger>
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Cover Style</Label>
        <Select
          value={config.cover.style}
          onValueChange={(value) => onUpdateConfig('cover.style', value)}
        >
          <SelectTrigger>
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
        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input
            value={config.cover.imageUrl || ''}
            onChange={(e) => onUpdateConfig('cover.imageUrl', e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      {config.cover.style !== 'none' && (
        <div className="space-y-2">
          <Label>Overlay Opacity: {Math.round(config.cover.overlay * 100)}%</Label>
          <Slider
            value={[config.cover.overlay * 100]}
            onValueChange={([value]) => onUpdateConfig('cover.overlay', value / 100)}
            min={0}
            max={100}
            step={5}
          />
        </div>
      )}
    </div>
  );

  const renderLayoutControls = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Max Width: {config.layout.maxWidth}px</Label>
        <Slider
          value={[config.layout.maxWidth]}
          onValueChange={([value]) => onUpdateConfig('layout.maxWidth', value)}
          min={600}
          max={1200}
          step={20}
        />
      </div>

      <div className="space-y-2">
        <Label>Card Style</Label>
        <Select
          value={config.layout.cardStyle}
          onValueChange={(value) => onUpdateConfig('layout.cardStyle', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flat">Flat</SelectItem>
            <SelectItem value="glass">Glass</SelectItem>
            <SelectItem value="shadow">Shadow</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Spacing</Label>
        <Select
          value={config.layout.spacing}
          onValueChange={(value) => onUpdateConfig('layout.spacing', value)}
        >
          <SelectTrigger>
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Button Style</Label>
        <Select
          value={config.buttons.style}
          onValueChange={(value) => onUpdateConfig('buttons.style', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="filled">Filled</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label>Button Shadow</Label>
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
            <div className="text-sm text-muted-foreground">
              Click "Apply Preset" to apply this preset theme.
              <Button className="w-full mt-4" onClick={() => {
                const presetId = selectedElement.replace('preset-', '');
                applyPreset(presetId);
              }}>
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
