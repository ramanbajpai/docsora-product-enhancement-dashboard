import { useState, useEffect, useCallback } from "react";

export interface SavedSignature {
  id: string;
  data: string; // Base64 image data or styled text
  name: string;
  createdAt: Date;
  type: "styled" | "drawn" | "uploaded";
  fontName?: string;
}

const STORAGE_KEY = "docsora_saved_signatures";
const MAX_SIGNATURES = 10;

const loadFromStorage = (): SavedSignature[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((sig: any) => ({
        ...sig,
        createdAt: new Date(sig.createdAt)
      }));
    }
  } catch (e) {
    console.error("Failed to load saved signatures:", e);
  }
  return [];
};

const saveToStorage = (signatures: SavedSignature[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signatures));
  } catch (e) {
    console.error("Failed to save signatures:", e);
  }
};

export function useSavedSignatures() {
  const [signatures, setSignatures] = useState<SavedSignature[]>(() => loadFromStorage());

  // Reload from storage when hook mounts (to sync across tabs/components)
  useEffect(() => {
    setSignatures(loadFromStorage());
  }, []);

  // Add a new signature
  const addSignature = useCallback((
    data: string, 
    name: string, 
    type: SavedSignature["type"],
    fontName?: string
  ): SavedSignature => {
    const newSignature: SavedSignature = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      name,
      type,
      fontName,
      createdAt: new Date(),
    };

    const updated = [newSignature, ...signatures].slice(0, MAX_SIGNATURES);
    setSignatures(updated);
    saveToStorage(updated);
    return newSignature;
  }, [signatures]);

  // Delete a signature
  const deleteSignature = useCallback((id: string) => {
    const updated = signatures.filter(s => s.id !== id);
    setSignatures(updated);
    saveToStorage(updated);
  }, [signatures]);

  // Rename a signature
  const renameSignature = useCallback((id: string, newName: string) => {
    const updated = signatures.map(s => 
      s.id === id ? { ...s, name: newName } : s
    );
    setSignatures(updated);
    saveToStorage(updated);
  }, [signatures]);

  // Get the most recent signature
  const getLatestSignature = useCallback((): SavedSignature | null => {
    return signatures.length > 0 ? signatures[0] : null;
  }, [signatures]);

  // Refresh from storage (useful when switching between pages)
  const refresh = useCallback(() => {
    setSignatures(loadFromStorage());
  }, []);

  return {
    signatures,
    addSignature,
    deleteSignature,
    renameSignature,
    getLatestSignature,
    hasSignatures: signatures.length > 0,
    refresh,
  };
}
