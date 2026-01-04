import { useState, useEffect, useCallback } from 'react';

export interface GalleryItem {
  id: string;
  title: string;
  date: string;
  dataUrl: string;
  thumbnail: string;
  duration: number;
}

const GALLERY_KEY = 'bubbleloop_gallery';

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load gallery from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GALLERY_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load gallery:', e);
    }
    setIsLoading(false);
  }, []);

  // Save item to gallery
  const saveItem = useCallback((dataUrl: string, thumbnail: string, duration: number) => {
    const now = new Date();
    const title = `Loop ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    
    const newItem: GalleryItem = {
      id: crypto.randomUUID(),
      title,
      date: now.toISOString(),
      dataUrl,
      thumbnail,
      duration,
    };

    setItems(prev => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save to gallery:', e);
        // If storage is full, remove oldest items
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          const trimmed = updated.slice(0, 10);
          localStorage.setItem(GALLERY_KEY, JSON.stringify(trimmed));
          return trimmed;
        }
      }
      return updated;
    });

    return newItem;
  }, []);

  // Delete item from gallery
  const deleteItem = useCallback((id: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Rename item
  const renameItem = useCallback((id: string, newTitle: string) => {
    setItems(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, title: newTitle } : item
      );
      localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    items,
    isLoading,
    saveItem,
    deleteItem,
    renameItem,
  };
}
