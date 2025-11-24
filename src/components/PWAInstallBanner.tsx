import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { usePWAInstall } from '@/hooks/use-pwa-install';

const BANNER_DISMISSED_KEY = 'pwa-banner-dismissed';

export function PWAInstallBanner() {
  const { canInstall, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (!dismissed && canInstall) {
      setIsDismissed(false);
    }
  }, [canInstall]);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  if (isDismissed || !canInstall) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border p-4 shadow-lg animate-in slide-in-from-bottom">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Smartphone className="w-6 h-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Install Rent EZ App</p>
            <p className="text-sm text-muted-foreground">Get quick access to your rental application</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleInstall} size="sm" className="whitespace-nowrap">
            <Download className="w-4 h-4 mr-2" />
            Install
          </Button>
          <Button onClick={handleDismiss} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
