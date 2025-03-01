
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    // Auto-resize textarea functionality
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const combinedRef = (node: HTMLTextAreaElement) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      // Reset height to calculate new height
      textarea.style.height = 'auto';
      
      // Set new height based on scrollHeight
      const newHeight = Math.max(80, textarea.scrollHeight);
      textarea.style.height = `${newHeight}px`;
    }, []);

    React.useEffect(() => {
      adjustHeight();
      // Add event listener for input
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.addEventListener('input', adjustHeight);
        
        // Adjust on window resize
        window.addEventListener('resize', adjustHeight);
        
        return () => {
          textarea.removeEventListener('input', adjustHeight);
          window.removeEventListener('resize', adjustHeight);
        };
      }
    }, [adjustHeight]);

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical transition-all duration-200",
          className
        )}
        ref={combinedRef}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
