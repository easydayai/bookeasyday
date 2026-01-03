import { useState, useEffect, useRef, useCallback } from "react";
import { DAISY_CONFIG } from "@/components/daisy-constants";

type UseDraggableOptions = {
  enabled: boolean;
  panelRef: React.RefObject<HTMLDivElement>;
  boundsBuffer?: number;
};

type DragState = {
  startX: number;
  startY: number;
  startPosX: number;
  startPosY: number;
};

export function useDraggable({ 
  enabled, 
  panelRef, 
  boundsBuffer = DAISY_CONFIG.DRAG_BOUNDS_BUFFER 
}: UseDraggableOptions) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Use ref for drag state to avoid stale closure issues
  const dragRef = useRef<DragState | null>(null);
  const positionRef = useRef(position);
  
  // Keep positionRef in sync
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Reset position when disabled (e.g., switching modes)
  useEffect(() => {
    if (!enabled) {
      setPosition({ x: 0, y: 0 });
    }
  }, [enabled]);

  // Handle window resize - keep panel on screen
  useEffect(() => {
    if (!enabled) return;

    const handleResize = () => {
      if (!panelRef.current) return;
      
      const rect = panelRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let needsReset = false;
      
      // Check if panel is mostly off-screen
      if (rect.right < boundsBuffer || rect.left > viewportWidth - boundsBuffer) {
        needsReset = true;
      }
      if (rect.bottom < boundsBuffer || rect.top > viewportHeight - boundsBuffer) {
        needsReset = true;
      }
      
      if (needsReset) {
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [enabled, panelRef, boundsBuffer]);

  // Stable mouse down handler - uses ref for position to avoid recreating
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enabled) return;
    
    // Don't start drag if clicking on interactive elements
    if ((e.target as HTMLElement).closest("button, input, a, [role='button']")) {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: positionRef.current.x,
      startPosY: positionRef.current.y,
    };
  }, [enabled]);

  // Mouse move and up handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      
      setPosition({
        x: dragRef.current.startPosX + dx,
        y: dragRef.current.startPosY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return {
    position,
    isDragging,
    handleMouseDown,
    resetPosition: () => setPosition({ x: 0, y: 0 }),
  };
}
