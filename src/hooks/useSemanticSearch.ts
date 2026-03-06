import { useMemo } from "react";

interface StorageFile {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx" | "pptx" | "mp4" | "jpg" | "png" | "folder";
  size?: number;
  uploadDate: string;
  lastModified: string;
  owner: string;
  status?: "signed" | "pending" | "draft";
  aiTag?: string;
  thumbnail?: string;
  parentId?: string;
  tags?: string[];
}

interface SemanticResult extends StorageFile {
  semanticContext?: string;
  relevanceScore: number;
}

// Document classification patterns
const DOCUMENT_PATTERNS: Record<string, { keywords: string[]; intents: string[] }> = {
  Resume: {
    keywords: ["resume", "cv", "curriculum vitae", "experience", "skills", "candidate"],
    intents: ["resumes", "candidates", "hiring", "job applications", "applicants"]
  },
  Contract: {
    keywords: ["contract", "agreement", "nda", "terms", "legal", "binding"],
    intents: ["contracts", "agreements", "legal documents", "signed documents"]
  },
  Invoice: {
    keywords: ["invoice", "bill", "payment", "due", "amount", "receipt"],
    intents: ["invoices", "bills", "payments", "financial documents"]
  },
  Proposal: {
    keywords: ["proposal", "pitch", "project", "scope", "deliverable"],
    intents: ["proposals", "pitches", "project documents", "business proposals"]
  },
  Presentation: {
    keywords: ["presentation", "deck", "slides", "pitch deck", "intro", "overview"],
    intents: ["presentations", "decks", "slides", "pitch decks", "marketing materials"]
  },
  Report: {
    keywords: ["report", "analysis", "findings", "quarterly", "annual", "summary"],
    intents: ["reports", "analysis", "summaries", "quarterly reports"]
  },
  Guide: {
    keywords: ["guide", "manual", "how-to", "instructions", "tutorial", "documentation"],
    intents: ["guides", "manuals", "documentation", "help documents"]
  }
};

// Intent patterns for natural language queries
const INTENT_PATTERNS: Array<{ pattern: RegExp; handler: (match: RegExpMatchArray, files: StorageFile[]) => SemanticResult[] }> = [
  {
    // "show all resumes" / "find resumes" / "get resumes"
    pattern: /(?:show|find|get|list|display)\s+(?:all\s+)?(\w+)/i,
    handler: (match, files) => {
      const term = match[1].toLowerCase();
      return classifyByIntent(files, term);
    }
  },
  {
    // "documents related to X" / "files about X"
    pattern: /(?:documents?|files?)\s+(?:related to|about|for|regarding)\s+(.+)/i,
    handler: (match, files) => {
      const topic = match[1].toLowerCase().trim();
      return classifyByTopic(files, topic);
    }
  },
  {
    // "contracts expiring soon" / "pending documents"
    pattern: /(\w+)\s+(?:expiring|pending|due|awaiting|needing)\s*(\w*)/i,
    handler: (match, files) => {
      const docType = match[1].toLowerCase();
      return classifyByTypeAndStatus(files, docType, "pending");
    }
  },
  {
    // "signed by X" / "edited by X" / "from X"
    pattern: /(?:signed|edited|created|owned|from)\s+(?:by\s+)?(\w+)/i,
    handler: (match, files) => {
      const person = match[1].toLowerCase();
      return classifyByPerson(files, person);
    }
  },
  {
    // "hiring documents" / "marketing materials"
    pattern: /(\w+)\s+(?:documents?|materials?|files?)/i,
    handler: (match, files) => {
      const category = match[1].toLowerCase();
      return classifyByCategory(files, category);
    }
  }
];

function classifyDocument(file: StorageFile): string | null {
  const name = file.name.toLowerCase();
  
  // First check if already classified
  if (file.aiTag) return file.aiTag;
  
  // Check patterns
  for (const [category, { keywords }] of Object.entries(DOCUMENT_PATTERNS)) {
    if (keywords.some(kw => name.includes(kw))) {
      return category;
    }
  }
  
  return null;
}

function classifyByIntent(files: StorageFile[], intent: string): SemanticResult[] {
  const results: SemanticResult[] = [];
  const intentLower = intent.toLowerCase().replace(/s$/, ""); // Remove plural
  
  for (const file of files) {
    if (file.type === "folder") continue;
    
    let score = 0;
    let context: string | undefined;
    
    const classification = classifyDocument(file);
    
    // Direct classification match
    if (classification?.toLowerCase() === intentLower) {
      score = 1;
      context = classification;
    }
    
    // Check intent patterns
    for (const [category, { intents }] of Object.entries(DOCUMENT_PATTERNS)) {
      if (intents.some(i => i.includes(intentLower) || intentLower.includes(i.split(" ")[0]))) {
        if (classification === category || file.aiTag === category) {
          score = Math.max(score, 0.95);
          context = category;
        }
      }
    }
    
    // Check tags
    if (file.tags?.some(t => t.toLowerCase().includes(intentLower))) {
      score = Math.max(score, 0.8);
      context = context || `Tagged: ${file.tags.find(t => t.toLowerCase().includes(intentLower))}`;
    }
    
    // Check name
    if (file.name.toLowerCase().includes(intentLower)) {
      score = Math.max(score, 0.7);
    }
    
    if (score > 0) {
      results.push({ ...file, relevanceScore: score, semanticContext: context });
    }
  }
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function classifyByTopic(files: StorageFile[], topic: string): SemanticResult[] {
  const results: SemanticResult[] = [];
  const topicWords = topic.toLowerCase().split(/\s+/);
  
  for (const file of files) {
    if (file.type === "folder") continue;
    
    let score = 0;
    let context: string | undefined;
    
    // Check tags for topic relevance
    const matchingTags = file.tags?.filter(t => 
      topicWords.some(tw => t.toLowerCase().includes(tw))
    );
    
    if (matchingTags && matchingTags.length > 0) {
      score = 0.9;
      context = matchingTags.join(", ");
    }
    
    // Check AI classification
    if (file.aiTag && topicWords.some(tw => file.aiTag!.toLowerCase().includes(tw))) {
      score = Math.max(score, 0.85);
      context = context || file.aiTag;
    }
    
    // Check name
    if (topicWords.some(tw => file.name.toLowerCase().includes(tw))) {
      score = Math.max(score, 0.7);
    }
    
    if (score > 0) {
      results.push({ ...file, relevanceScore: score, semanticContext: context });
    }
  }
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function classifyByTypeAndStatus(files: StorageFile[], docType: string, status: string): SemanticResult[] {
  const results: SemanticResult[] = [];
  const typeLower = docType.toLowerCase().replace(/s$/, "");
  
  for (const file of files) {
    if (file.type === "folder") continue;
    
    let score = 0;
    let context: string | undefined;
    
    const classification = classifyDocument(file);
    const typeMatch = classification?.toLowerCase() === typeLower || 
                      file.aiTag?.toLowerCase() === typeLower ||
                      file.name.toLowerCase().includes(typeLower);
    
    const statusMatch = file.status === status;
    
    if (typeMatch && statusMatch) {
      score = 1;
      context = `${file.status} ${classification || docType}`;
    } else if (statusMatch) {
      score = 0.8;
      context = `${file.status}`;
    } else if (typeMatch) {
      score = 0.5;
      context = classification;
    }
    
    if (score > 0) {
      results.push({ ...file, relevanceScore: score, semanticContext: context });
    }
  }
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function classifyByPerson(files: StorageFile[], person: string): SemanticResult[] {
  const results: SemanticResult[] = [];
  const personLower = person.toLowerCase();
  
  for (const file of files) {
    if (file.type === "folder") continue;
    
    let score = 0;
    let context: string | undefined;
    
    if (file.owner.toLowerCase().includes(personLower)) {
      score = 0.9;
      context = `By ${file.owner}`;
    }
    
    // Check if person name is in file name
    if (file.name.toLowerCase().includes(personLower)) {
      score = Math.max(score, 0.8);
      context = context || "Name match";
    }
    
    if (score > 0) {
      results.push({ ...file, relevanceScore: score, semanticContext: context });
    }
  }
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function classifyByCategory(files: StorageFile[], category: string): SemanticResult[] {
  const results: SemanticResult[] = [];
  const catLower = category.toLowerCase();
  
  // Map common categories to related terms
  const categoryMappings: Record<string, string[]> = {
    hiring: ["resume", "cv", "candidate", "interview", "applicant", "hr"],
    marketing: ["presentation", "pitch", "branding", "sales", "campaign"],
    legal: ["contract", "agreement", "nda", "terms", "policy"],
    financial: ["invoice", "receipt", "budget", "expense", "payment"],
    project: ["proposal", "plan", "timeline", "milestone", "deliverable"]
  };
  
  const relatedTerms = categoryMappings[catLower] || [catLower];
  
  for (const file of files) {
    if (file.type === "folder") continue;
    
    let score = 0;
    let context: string | undefined;
    
    // Check tags
    const matchingTags = file.tags?.filter(t => 
      relatedTerms.some(term => t.toLowerCase().includes(term)) ||
      t.toLowerCase().includes(catLower)
    );
    
    if (matchingTags && matchingTags.length > 0) {
      score = 0.9;
      context = matchingTags[0];
    }
    
    // Check classification
    const classification = classifyDocument(file);
    if (classification && relatedTerms.some(term => classification.toLowerCase().includes(term))) {
      score = Math.max(score, 0.85);
      context = context || classification;
    }
    
    // Check name
    if (relatedTerms.some(term => file.name.toLowerCase().includes(term))) {
      score = Math.max(score, 0.7);
      context = context || `${catLower}-related`;
    }
    
    if (score > 0) {
      results.push({ ...file, relevanceScore: score, semanticContext: context });
    }
  }
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function fallbackKeywordSearch(files: StorageFile[], query: string): SemanticResult[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  
  const results: SemanticResult[] = [];
  
  for (const file of files) {
    let score = 0;
    
    // Name match
    if (file.name.toLowerCase().includes(queryLower)) {
      score = 0.8;
    } else if (queryWords.some(w => file.name.toLowerCase().includes(w))) {
      score = 0.5;
    }
    
    // Tag match
    if (file.tags?.some(t => t.toLowerCase().includes(queryLower))) {
      score = Math.max(score, 0.7);
    }
    
    // Status match
    if (file.status?.toLowerCase().includes(queryLower)) {
      score = Math.max(score, 0.6);
    }
    
    // Owner match
    if (file.owner.toLowerCase().includes(queryLower)) {
      score = Math.max(score, 0.6);
    }
    
    // AI tag match
    if (file.aiTag?.toLowerCase().includes(queryLower)) {
      score = Math.max(score, 0.7);
    }
    
    // Type match
    if (file.type.toLowerCase().includes(queryLower)) {
      score = Math.max(score, 0.5);
    }
    
    if (score > 0) {
      results.push({ ...file, relevanceScore: score });
    }
  }
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

export function useSemanticSearch(files: StorageFile[], query: string): SemanticResult[] {
  return useMemo(() => {
    if (!query.trim()) {
      // Return all files with default relevance
      return files.map(f => ({ ...f, relevanceScore: 1 }));
    }
    
    // Try intent-based patterns first
    for (const { pattern, handler } of INTENT_PATTERNS) {
      const match = query.match(pattern);
      if (match) {
        const results = handler(match, files);
        if (results.length > 0) {
          return results;
        }
      }
    }
    
    // Try direct classification search
    const classificationResults = classifyByIntent(files, query);
    if (classificationResults.length > 0) {
      return classificationResults;
    }
    
    // Fallback to keyword search
    return fallbackKeywordSearch(files, query);
  }, [files, query]);
}

export type { SemanticResult, StorageFile };
