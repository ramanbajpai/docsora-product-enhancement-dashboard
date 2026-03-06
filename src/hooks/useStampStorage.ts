import { useState, useEffect, useCallback } from "react";

export interface SavedStamp {
  id: string;
  imageData: string;
  name: string;
  createdAt: number;
}

const STORAGE_KEY = "docsora_saved_stamps";
const MAX_STAMPS = 20;

export function useStampStorage() {
  const [stamps, setStamps] = useState<SavedStamp[]>([]);

  // Load stamps from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setStamps(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load saved stamps:", error);
    }
  }, []);

  // Save stamps to localStorage
  const persistStamps = useCallback((newStamps: SavedStamp[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStamps));
    } catch (error) {
      console.error("Failed to save stamps:", error);
    }
  }, []);

  // Add a new stamp
  const addStamp = useCallback((imageData: string, name?: string) => {
    const newStamp: SavedStamp = {
      id: `stamp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageData,
      name: name || `Stamp ${stamps.length + 1}`,
      createdAt: Date.now(),
    };

    const newStamps = [newStamp, ...stamps].slice(0, MAX_STAMPS);
    setStamps(newStamps);
    persistStamps(newStamps);
    return newStamp;
  }, [stamps, persistStamps]);

  // Delete a stamp
  const deleteStamp = useCallback((id: string) => {
    const newStamps = stamps.filter(s => s.id !== id);
    setStamps(newStamps);
    persistStamps(newStamps);
  }, [stamps, persistStamps]);

  // Rename a stamp
  const renameStamp = useCallback((id: string, newName: string) => {
    const newStamps = stamps.map(s => 
      s.id === id ? { ...s, name: newName } : s
    );
    setStamps(newStamps);
    persistStamps(newStamps);
  }, [stamps, persistStamps]);

  return {
    stamps,
    addStamp,
    deleteStamp,
    renameStamp,
    hasStamps: stamps.length > 0,
  };
}
