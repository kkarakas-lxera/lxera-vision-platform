import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

interface UseCustomOrderProps<T> {
  items: T[];
  storageKey: string;
  getItemId: (item: T) => string;
}

export function useCustomOrder<T>({ items, storageKey, getItemId }: UseCustomOrderProps<T>) {
  const [orderedItems, setOrderedItems] = useState<T[]>(items);

  // Load saved order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem(storageKey);
    if (savedOrder) {
      try {
        const orderMap = JSON.parse(savedOrder);
        const sorted = [...items].sort((a, b) => {
          const aOrder = orderMap[getItemId(a)] ?? 999;
          const bOrder = orderMap[getItemId(b)] ?? 999;
          return aOrder - bOrder;
        });
        setOrderedItems(sorted);
      } catch (e) {
        console.error('Failed to parse saved order:', e);
        setOrderedItems(items);
      }
    } else {
      setOrderedItems(items);
    }
  }, [items, storageKey, getItemId]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setOrderedItems((items) => {
        const oldIndex = items.findIndex(item => getItemId(item) === active.id);
        const newIndex = items.findIndex(item => getItemId(item) === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save new order to localStorage
        const orderMap: Record<string, number> = {};
        newOrder.forEach((item, index) => {
          orderMap[getItemId(item)] = index;
        });
        localStorage.setItem(storageKey, JSON.stringify(orderMap));
        
        return newOrder;
      });
    }
  };

  return {
    orderedItems,
    handleDragEnd,
    setOrderedItems
  };
}