import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Palette, 
  Type, 
  LayoutGrid, 
  Image, 
  MousePointer2,
  Heading,
  Square,
  Settings
} from 'lucide-react';

interface ComponentListProps {
  selectedElement: string | null;
  onSelectElement: (elementId: string) => void;
}

const components = [
  { id: 'theme', label: 'Theme & Colors', icon: Palette },
  { id: 'header', label: 'Header', icon: Heading },
  { id: 'cover', label: 'Cover Style', icon: Image },
  { id: 'layout', label: 'Layout', icon: LayoutGrid },
  { id: 'buttons', label: 'Buttons', icon: Square },
  { id: 'typography', label: 'Typography', icon: Type },
];

const presets = [
  { id: 'dark-purple', label: 'Dark Purple', colors: ['#6d28d9', '#0b1220'] },
  { id: 'light-minimal', label: 'Light Minimal', colors: ['#3b82f6', '#ffffff'] },
  { id: 'warm-sunset', label: 'Warm Sunset', colors: ['#f97316', '#1c1917'] },
  { id: 'ocean-blue', label: 'Ocean Blue', colors: ['#0ea5e9', '#0f172a'] },
  { id: 'forest-green', label: 'Forest Green', colors: ['#22c55e', '#14532d'] },
];

export function ComponentList({ selectedElement, onSelectElement }: ComponentListProps) {
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
