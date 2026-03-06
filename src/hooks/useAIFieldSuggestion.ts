import { useState, useCallback } from "react";

export type SuggestedFieldType = "signature" | "initials" | "date" | "name" | "title" | "company" | "location" | "checkbox";

export interface SuggestedField {
  type: SuggestedFieldType;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  confidence: number;
  recipientHint?: string; // Keywords like "client", "seller", etc.
}

// Simulated AI detection patterns - in production this would use OCR/document parsing
const FIELD_PATTERNS = [
  { type: "signature" as const, keywords: ["signature", "signed by", "sign here", "authorized signature"], defaultSize: { w: 200, h: 60 } },
  { type: "initials" as const, keywords: ["initials", "initial here"], defaultSize: { w: 80, h: 50 } },
  { type: "date" as const, keywords: ["date", "dated", "day of"], defaultSize: { w: 160, h: 40 } },
  { type: "name" as const, keywords: ["name", "printed name", "full name"], defaultSize: { w: 180, h: 40 } },
  { type: "title" as const, keywords: ["title", "position", "role"], defaultSize: { w: 150, h: 40 } },
  { type: "company" as const, keywords: ["company", "organization", "firm"], defaultSize: { w: 150, h: 40 } },
];

const RECIPIENT_KEYWORDS = [
  { hint: "client", keywords: ["client", "customer", "buyer", "purchaser", "tenant", "lessee"] },
  { hint: "vendor", keywords: ["vendor", "seller", "landlord", "lessor", "provider"] },
  { hint: "witness", keywords: ["witness", "notary"] },
];

// Simulated common signature block positions (bottom of page)
const COMMON_POSITIONS = [
  // Single signature block (bottom center)
  { x: 15, y: 75, role: "primary" },
  // Two signature blocks (left and right)
  { x: 10, y: 75, role: "first" },
  { x: 55, y: 75, role: "second" },
];

export interface UseAIFieldSuggestionOptions {
  totalPages: number;
}

export function useAIFieldSuggestion({ totalPages }: UseAIFieldSuggestionOptions) {
  const [isScanning, setIsScanning] = useState(false);

  const suggestFields = useCallback(async (): Promise<SuggestedField[]> => {
    setIsScanning(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const suggestions: SuggestedField[] = [];
    
    // For demo, suggest common signature block pattern on the last page
    // In production, this would analyze actual document content
    
    // Primary signature field
    suggestions.push({
      type: "signature",
      x: 15,
      y: 72,
      width: 200,
      height: 60,
      page: totalPages, // Last page typically has signature
      confidence: 0.92,
      recipientHint: "primary",
    });
    
    // Date field near signature
    suggestions.push({
      type: "date",
      x: 15,
      y: 82,
      width: 160,
      height: 40,
      page: totalPages,
      confidence: 0.88,
    });
    
    // Name field (printed name)
    suggestions.push({
      type: "name",
      x: 55,
      y: 72,
      width: 180,
      height: 40,
      page: totalPages,
      confidence: 0.85,
    });
    
    // Title field
    suggestions.push({
      type: "title",
      x: 55,
      y: 80,
      width: 150,
      height: 40,
      page: totalPages,
      confidence: 0.75,
    });
    
    // Initials on first page (common for multi-page documents)
    if (totalPages > 1) {
      suggestions.push({
        type: "initials",
        x: 85,
        y: 90,
        width: 80,
        height: 50,
        page: 1,
        confidence: 0.80,
      });
    }
    
    setIsScanning(false);
    return suggestions;
  }, [totalPages]);

  const suggestFieldsForMultiple = useCallback(async (recipientCount: number): Promise<SuggestedField[]> => {
    setIsScanning(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const suggestions: SuggestedField[] = [];
    
    // For multiple recipients, suggest signature blocks for each
    const signersToPlace = Math.min(recipientCount, 3); // Max 3 signature blocks
    const spacing = 85 / signersToPlace;
    
    for (let i = 0; i < signersToPlace; i++) {
      const yOffset = 70 + (i % 2) * 12; // Stagger vertically if needed
      const xOffset = i < 2 ? 10 + (i * 45) : 10; // Side by side, then below
      const pageNum = i < 2 ? totalPages : totalPages; // All on last page for now
      
      // Signature for each recipient
      suggestions.push({
        type: "signature",
        x: xOffset,
        y: yOffset,
        width: 180,
        height: 55,
        page: pageNum,
        confidence: 0.90,
        recipientHint: i === 0 ? "first" : i === 1 ? "second" : "third",
      });
      
      // Date for first two signers
      if (i < 2) {
        suggestions.push({
          type: "date",
          x: xOffset,
          y: yOffset + 8,
          width: 140,
          height: 35,
          page: pageNum,
          confidence: 0.85,
        });
      }
    }
    
    // Initials on first page for all signers
    if (totalPages > 1) {
      for (let i = 0; i < Math.min(signersToPlace, 2); i++) {
        suggestions.push({
          type: "initials",
          x: 80 + (i * 10),
          y: 90,
          width: 70,
          height: 45,
          page: 1,
          confidence: 0.78,
          recipientHint: i === 0 ? "first" : "second",
        });
      }
    }
    
    setIsScanning(false);
    return suggestions;
  }, [totalPages]);

  return {
    isScanning,
    suggestFields,
    suggestFieldsForMultiple,
  };
}
