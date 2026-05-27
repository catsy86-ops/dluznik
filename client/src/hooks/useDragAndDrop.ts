/**
 * useDragAndDrop Hook
 * 
 * Handles drag-and-drop reordering of items.
 * Works on both desktop (mouse) and mobile (touch).
 */

import { useRef, useState } from 'react';

interface UseDragAndDropOptions<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  getKey: (item: T) => string;
}

export function useDragAndDrop<T>({ items, onReorder, getKey: _getKey }: UseDragAndDropOptions<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDragIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && overIndex !== null && dragItem.current !== overIndex) {
      const newItems = [...items];
      const dragged = newItems.splice(dragItem.current, 1)[0];
      newItems.splice(overIndex, 0, dragged);
      onReorder(newItems);
    }
    dragItem.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  const getDragProps = (index: number) => ({
    draggable: true,
    onDragStart: () => handleDragStart(index),
    onDragEnter: () => handleDragEnter(index),
    onDragEnd: handleDragEnd,
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    style: {
      opacity: dragIndex === index ? 0.5 : 1,
      transform: overIndex === index && dragIndex !== index ? 'scale(1.02)' : 'scale(1)',
      transition: 'all 0.15s ease',
      cursor: 'grab',
    } as React.CSSProperties,
  });

  return { getDragProps, dragIndex, overIndex };
}
