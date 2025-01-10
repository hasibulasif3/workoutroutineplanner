import { useEffect } from 'react';
import { toast } from 'sonner';

export const useKeyboardShortcuts = (
  onCollapseAll: () => void,
  onExpandAll: () => void,
  onNavigateLeft: () => void,
  onNavigateRight: () => void,
  onZoomIn: () => void,
  onZoomOut: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '[':
            e.preventDefault();
            onCollapseAll();
            toast.success('All columns collapsed');
            break;
          case ']':
            e.preventDefault();
            onExpandAll();
            toast.success('All columns expanded');
            break;
          case '+':
            e.preventDefault();
            onZoomIn();
            break;
          case '-':
            e.preventDefault();
            onZoomOut();
            break;
        }
      } else if (e.altKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            onNavigateLeft();
            break;
          case 'ArrowRight':
            e.preventDefault();
            onNavigateRight();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCollapseAll, onExpandAll, onNavigateLeft, onNavigateRight, onZoomIn, onZoomOut]);
};