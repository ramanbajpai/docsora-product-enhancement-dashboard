import { useState, useCallback, useEffect } from "react";

export interface SignerProfile {
  fullName: string;
  initials: string;
  email: string;
  signatureMethod: "style" | "draw" | "upload";
  signatureData: string; // Base64 or font name
  signatureFont?: string;
  title?: string;
  company?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY_PREFIX = "docsora_signer_profile_";

const getStorageKey = (requestId: string, email: string) => 
  `${STORAGE_KEY_PREFIX}${requestId}_${email.toLowerCase()}`;

export function useSignerProfile(requestId: string, recipientEmail: string) {
  const [profile, setProfile] = useState<SignerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage
  useEffect(() => {
    setIsLoading(true);
    try {
      const key = getStorageKey(requestId, recipientEmail);
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
        });
      } else {
        setProfile(null);
      }
    } catch (e) {
      console.error("Failed to load signer profile:", e);
      setProfile(null);
    }
    setIsLoading(false);
  }, [requestId, recipientEmail]);

  // Save profile to localStorage
  const saveProfile = useCallback((data: Omit<SignerProfile, "createdAt" | "updatedAt">) => {
    try {
      const key = getStorageKey(requestId, recipientEmail);
      const now = new Date();
      const profileData: SignerProfile = {
        ...data,
        createdAt: profile?.createdAt || now,
        updatedAt: now,
      };
      localStorage.setItem(key, JSON.stringify(profileData));
      setProfile(profileData);
      return true;
    } catch (e) {
      console.error("Failed to save signer profile:", e);
      return false;
    }
  }, [requestId, recipientEmail, profile?.createdAt]);

  // Clear profile (for testing or reset)
  const clearProfile = useCallback(() => {
    try {
      const key = getStorageKey(requestId, recipientEmail);
      localStorage.removeItem(key);
      setProfile(null);
    } catch (e) {
      console.error("Failed to clear signer profile:", e);
    }
  }, [requestId, recipientEmail]);

  // Check if profile is complete (has signature)
  const isProfileComplete = profile !== null && 
    profile.fullName.trim() !== "" && 
    profile.initials.trim() !== "" && 
    profile.signatureData !== "";

  return {
    profile,
    isLoading,
    isProfileComplete,
    saveProfile,
    clearProfile,
  };
}
