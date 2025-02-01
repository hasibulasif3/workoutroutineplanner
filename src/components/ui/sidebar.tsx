import { useMediaQuery } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ className, isCollapsed, onToggle, ...props }: SidebarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-background",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-4 translate-x-1/2 rounded-full border shadow-md"
        onClick={onToggle}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      <ScrollArea className="flex-1">
        {props.children}
      </ScrollArea>
    </div>
  );
}