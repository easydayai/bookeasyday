import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Palette, 
  Type, 
  LayoutGrid, 
  Image, 
  Heading,
  Square,
  Settings,
  ChevronRight
} from 'lucide-react';

interface ComponentListProps {
  selectedElement: string | null;
  onSelectElement: (elementId: string) => void;
  isMobile?: boolean;
}

const components = [
  { id: 'theme', label: 'Theme & Colors', icon: Palette, description: 'Primary, accent, background colors' },
  { id: 'header', label: 'Header', icon: Heading, description: 'Logo, title, tagline' },
  { id: 'cover', label: 'Cover Style', icon: Image, description: 'Background gradient or image' },
  { id: 'layout', label: 'Layout', icon: LayoutGrid, description: 'Spacing, card style, width' },
  { id: 'buttons', label: 'Buttons', icon: Square, description: 'Style and shadow' },
  { id: 'typography', label: 'Typography', icon: Type, description: 'Font and corner radius' },
];

const presets = [
  { id: 'dark-purple', label: 'Dark Purple', colors: ['#6d28d9', '#0b1220'] },
  { id: 'light-minimal', label: 'Light Minimal', colors: ['#3b82f6', '#ffffff'] },
  { id: 'warm-sunset', label: 'Warm Sunset', colors: ['#f97316', '#1c1917'] },
  { id: 'ocean-blue', label: 'Ocean Blue', colors: ['#0ea5e9', '#0f172a'] },
  { id: 'forest-green', label: 'Forest Green', colors: ['#22c55e', '#14532d'] },
];

export function ComponentList({ selectedElement, onSelectElement, isMobile }: ComponentListProps) {
  if (isMobile) {
    return (
      <div className="flex flex-col">
        <div className="p-3 space-y-2">
          {components.map((component) => (
            <button
              key={component.id}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors touch-manipulation ${
                selectedElement === component.id 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'bg-secondary/50 border border-transparent active:bg-secondary'
              }`}
              onClick={() => onSelectElement(component.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${selectedElement === component.id ? 'bg-primary/20' : 'bg-background'}`}>
                  <component.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{component.label}</div>
                  <div className="text-xs text-muted-foreground">{component.description}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border mt-2">
          <h3 className="text-xs font-medium text-muted-foreground mb-3 px-1">QUICK PRESETS</h3>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary active:bg-secondary transition-colors touch-manipulation"
                onClick={() => onSelectElement(`preset-${preset.id}`)}
              >
                <div className="flex gap-0.5">
                  {preset.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-background flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Components
        </h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {components.map((component) => (
            <Button
              key={component.id}
              variant={selectedElement === component.id ? 'secondary' : 'ghost'}
              className="w-full justify-start h-10"
              onClick={() => onSelectElement(component.id)}
            >
              <component.icon className="h-4 w-4 mr-3" />
              {component.label}
            </Button>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <h3 className="text-xs font-medium text-muted-foreground mb-3">PRESETS</h3>
          <div className="space-y-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                onClick={() => onSelectElement(`preset-${preset.id}`)}
              >
                <div className="flex gap-0.5">
                  {preset.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-sm">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
