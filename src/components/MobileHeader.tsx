import { useNavigate } from "react-router-dom";
import { ChevronLeft, Settings, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  backHref?: string;
  showSettings?: boolean;
  onSettingsClick?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

export function MobileHeader({
  title,
  backHref = "/dashboard",
  showSettings = false,
  onSettingsClick,
  rightContent,
  className,
}: MobileHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 md:hidden",
        "flex items-center justify-between h-14 px-2",
        "bg-[#070A12]/95 border-b border-white/10 backdrop-blur-lg",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(backHref)}
        className="min-h-[44px] min-w-[44px] text-white/70 hover:text-white hover:bg-white/10"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <h1 className="text-lg font-semibold text-white absolute left-1/2 -translate-x-1/2">
        {title}
      </h1>

      <div className="flex items-center gap-1">
        {rightContent}
        {showSettings && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick || (() => navigate("/settings/profile"))}
            className="min-h-[44px] min-w-[44px] text-white/70 hover:text-white hover:bg-white/10"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
