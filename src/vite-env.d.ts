/// <reference types="vite/client" />

interface Window {
  tap?: (action: string, ...args: any[]) => void;
  TapfiliateObject?: string;
}
