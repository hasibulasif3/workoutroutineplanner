import { useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { MouseEvent, TouchEvent } from 'react';

interface DragEventOptions {
  onDragStart?: (e: MouseEvent | TouchEvent) => void;
  onDragMove?: (e: MouseEvent | TouchEvent) => void;
  onDragEnd?: () => void;
  threshold?: number;
  debounceMs?: number;
}

export function useDragEvents({
  onDragStart,
  onDragMove,
  onDragEnd,
  threshold = 5,
  debounceMs = 16
}: DragEventOptions) {
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  
  const debouncedMove = useCallback(
    debounce((e: MouseEvent | TouchEvent) => {
      onDragMove?.(e);
    }, debounceMs),
    [onDragMove]
  );

  const cleanup = useCallback(() => {
    isDraggingRef.current = false;
    onDragEnd?.();
    document.removeEventListener('mousemove', handleMove as any);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchmove', handleMove as any);
    document.removeEventListener('touchend', handleEnd);
  }, [onDragEnd]);

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    debouncedMove(e);
  }, [debouncedMove]);

  const handleEnd = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const handleStart = useCallback((e: MouseEvent | TouchEvent) => {
    const pos = 'touches' in e ? e.touches[0] : e;
    startPosRef.current = { x: pos.clientX, y: pos.clientY };
    isDraggingRef.current = true;
    onDragStart?.(e);

    document.addEventListener('mousemove', handleMove as any);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove as any, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }, [handleMove, handleEnd, onDragStart]);

  useEffect(() => {
    return () => {
      cleanup();
      debouncedMove.cancel();
    };
  }, [cleanup, debouncedMove]);

  return { handleStart };
}