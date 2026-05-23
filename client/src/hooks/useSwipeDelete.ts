import { useRef, useState } from 'react';

export function useSwipeDelete(onDelete: () => void, threshold = 80) {
  const startX = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) setOffset(Math.max(dx, -140));
  };

  const onTouchEnd = () => {
    if (offset < -threshold) {
      onDelete();
    } else {
      setOffset(0);
    }
    setSwiping(false);
    startX.current = null;
  };

  const style = {
    transform: `translateX(${offset}px)`,
    transition: swiping ? 'none' : 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
  };

  return { onTouchStart, onTouchMove, onTouchEnd, style, offset };
}
