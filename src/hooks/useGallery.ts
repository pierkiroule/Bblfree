import { useState, useEffect, useCallback } from 'react';

export interface GalleryItem {
  id: string;
  title: string;
  date: string;
  dataUrl: string;
  thumbnail: string;
  duration: number;
}

const DB_NAME = 'bubbleloop_db';
const DB_VERSION = 1;
const STORE_NAME = 'gallery';

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
      }
    };
  });
}

// Get all items from IndexedDB
async function getAllItems(): Promise<GalleryItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      // Sort by date descending (newest first)
      const items = request.result.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      resolve(items);
    };
    
    transaction.oncomplete = () => db.close();
  });
}

// Add item to IndexedDB
async function addItem(item: GalleryItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(item);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

// Update item in IndexedDB
async function updateItem(item: GalleryItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(item);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

// Delete item from IndexedDB
async function removeItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

// Get storage estimate
async function getStorageEstimate(): Promise<{ used: number; quota: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return null;
}

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState<{ used: number; quota: number } | null>(null);

  // Load gallery from IndexedDB
  useEffect(() => {
    async function loadGallery() {
      try {
        const storedItems = await getAllItems();
        setItems(storedItems);
        
        // Get storage info
        const storage = await getStorageEstimate();
        setStorageInfo(storage);
      } catch (e) {
        console.error('Failed to load gallery:', e);
      }
      setIsLoading(false);
    }
    
    loadGallery();
  }, []);

  // Save item to gallery
  const saveItem = useCallback(async (dataUrl: string, thumbnail: string, duration: number) => {
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

    try {
      await addItem(newItem);
      setItems(prev => [newItem, ...prev]);
      
      // Update storage info
      const storage = await getStorageEstimate();
      setStorageInfo(storage);
    } catch (e) {
      console.error('Failed to save to gallery:', e);
    }

    return newItem;
  }, []);

  // Delete item from gallery
  const deleteItem = useCallback(async (id: string) => {
    try {
      await removeItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      
      // Update storage info
      const storage = await getStorageEstimate();
      setStorageInfo(storage);
    } catch (e) {
      console.error('Failed to delete from gallery:', e);
    }
  }, []);

  // Rename item
  const renameItem = useCallback(async (id: string, newTitle: string) => {
    try {
      const item = items.find(i => i.id === id);
      if (item) {
        const updatedItem = { ...item, title: newTitle };
        await updateItem(updatedItem);
        setItems(prev => prev.map(i => i.id === id ? updatedItem : i));
      }
    } catch (e) {
      console.error('Failed to rename item:', e);
    }
  }, [items]);

  return {
    items,
    isLoading,
    saveItem,
    deleteItem,
    renameItem,
    storageInfo,
  };
}
