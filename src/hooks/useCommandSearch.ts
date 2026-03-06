import { useMemo } from "react";

export interface CommandDocument {
  id: string;
  name: string;
  type: "contract" | "nda" | "proposal" | "agreement" | "invoice" | "report";
  status: "pending" | "signed" | "draft" | "declined" | "expired";
  signers?: {
    name: string;
    role: string;
    status: "pending" | "signed" | "declined";
    lastActivity?: string;
    daysIdle?: number;
  }[];
  owner: string;
  lastActivity: string;
  daysIdle: number;
  deadline?: string;
  aiInsight?: string;
  riskLevel?: "low" | "medium" | "high";
}

export interface SearchResultGroup {
  category: "needs_action" | "in_progress" | "at_risk" | "completed";
  label: string;
  documents: CommandDocument[];
}

// Mock document data
const MOCK_DOCUMENTS: CommandDocument[] = [
  {
    id: "1",
    name: "Series A Investment Agreement",
    type: "agreement",
    status: "pending",
    signers: [
      { name: "John Smith", role: "Investor", status: "signed", lastActivity: "2 days ago" },
      { name: "Legal Team", role: "Approver", status: "pending", lastActivity: "5 days ago", daysIdle: 5 },
      { name: "CEO", role: "Final Signer", status: "pending" },
    ],
    owner: "Alex Chen",
    lastActivity: "5 days ago",
    daysIdle: 5,
    deadline: "Jan 20, 2026",
    aiInsight: "Legal approval typically takes 2-3 days. Currently idle for 5 days.",
    riskLevel: "high",
  },
  {
    id: "2",
    name: "Vendor NDA - TechCorp",
    type: "nda",
    status: "pending",
    signers: [
      { name: "TechCorp Legal", role: "Signer", status: "pending", lastActivity: "3 days ago", daysIdle: 3 },
    ],
    owner: "Sarah Miller",
    lastActivity: "3 days ago",
    daysIdle: 3,
    aiInsight: "This signer usually completes within 48 hours. Consider a gentle reminder.",
    riskLevel: "medium",
  },
  {
    id: "3",
    name: "Q4 Sales Proposal",
    type: "proposal",
    status: "pending",
    signers: [
      { name: "Client Rep", role: "Reviewer", status: "pending", lastActivity: "1 day ago", daysIdle: 1 },
    ],
    owner: "Alex Chen",
    lastActivity: "1 day ago",
    daysIdle: 1,
    deadline: "Jan 18, 2026",
    riskLevel: "low",
  },
  {
    id: "4",
    name: "Employment Contract - M. Johnson",
    type: "contract",
    status: "signed",
    signers: [
      { name: "M. Johnson", role: "Employee", status: "signed", lastActivity: "Today" },
      { name: "HR Director", role: "Company", status: "signed", lastActivity: "Today" },
    ],
    owner: "HR Team",
    lastActivity: "Today",
    daysIdle: 0,
  },
  {
    id: "5",
    name: "Software License Agreement",
    type: "agreement",
    status: "declined",
    signers: [
      { name: "Procurement", role: "Reviewer", status: "declined", lastActivity: "2 days ago" },
    ],
    owner: "Alex Chen",
    lastActivity: "2 days ago",
    daysIdle: 2,
    aiInsight: "Declined due to pricing terms. Similar agreements have 60% revision success rate.",
    riskLevel: "high",
  },
  {
    id: "6",
    name: "Partnership Agreement Draft",
    type: "agreement",
    status: "draft",
    owner: "Alex Chen",
    lastActivity: "1 week ago",
    daysIdle: 7,
  },
  {
    id: "7",
    name: "Consulting Services Contract",
    type: "contract",
    status: "pending",
    signers: [
      { name: "Finance", role: "Approver", status: "signed", lastActivity: "Today" },
      { name: "Consultant", role: "Signer", status: "pending", daysIdle: 0 },
    ],
    owner: "Alex Chen",
    lastActivity: "Today",
    daysIdle: 0,
  },
];

function categorizeDocuments(documents: CommandDocument[]): SearchResultGroup[] {
  const needsAction = documents.filter(d => 
    d.status === "pending" && d.daysIdle >= 3
  );
  
  const inProgress = documents.filter(d => 
    d.status === "pending" && d.daysIdle < 3
  );
  
  const atRisk = documents.filter(d => 
    d.status === "declined" || d.riskLevel === "high"
  );
  
  const completed = documents.filter(d => 
    d.status === "signed"
  );
  
  const groups: SearchResultGroup[] = [];
  
  if (needsAction.length > 0) {
    groups.push({ category: "needs_action", label: "Needs Action", documents: needsAction });
  }
  if (inProgress.length > 0) {
    groups.push({ category: "in_progress", label: "In Progress", documents: inProgress });
  }
  if (atRisk.length > 0) {
    groups.push({ category: "at_risk", label: "At Risk", documents: atRisk });
  }
  if (completed.length > 0) {
    groups.push({ category: "completed", label: "Completed", documents: completed });
  }
  
  return groups;
}

function filterDocuments(documents: CommandDocument[], query: string): CommandDocument[] {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/);
  
  return documents.filter(doc => {
    // Status matches
    if (words.includes("unsigned") || words.includes("pending")) {
      return doc.status === "pending";
    }
    if (words.includes("signed") || words.includes("completed")) {
      return doc.status === "signed";
    }
    if (words.includes("declined") || words.includes("rejected")) {
      return doc.status === "declined";
    }
    if (words.includes("draft") || words.includes("drafts")) {
      return doc.status === "draft";
    }
    
    // Type matches
    if (words.includes("contract") || words.includes("contracts")) {
      return doc.type === "contract";
    }
    if (words.includes("nda") || words.includes("ndas")) {
      return doc.type === "nda";
    }
    if (words.includes("agreement") || words.includes("agreements")) {
      return doc.type === "agreement";
    }
    if (words.includes("proposal") || words.includes("proposals")) {
      return doc.type === "proposal";
    }
    
    // Signer/blocker queries
    if (queryLower.includes("waiting on") || queryLower.includes("blocking")) {
      return doc.status === "pending" && doc.signers?.some(s => s.status === "pending");
    }
    if (queryLower.includes("legal")) {
      return doc.signers?.some(s => s.name.toLowerCase().includes("legal")) || 
             doc.name.toLowerCase().includes("legal");
    }
    
    // Name match
    if (doc.name.toLowerCase().includes(queryLower)) {
      return true;
    }
    
    // Fallback: match any word
    return words.some(word => 
      doc.name.toLowerCase().includes(word) ||
      doc.type.includes(word) ||
      doc.status.includes(word)
    );
  });
}

export function useCommandSearch(query: string): SearchResultGroup[] {
  return useMemo(() => {
    if (!query.trim()) {
      return categorizeDocuments(MOCK_DOCUMENTS);
    }
    
    const filtered = filterDocuments(MOCK_DOCUMENTS, query);
    return categorizeDocuments(filtered);
  }, [query]);
}

export function getMockDocument(id: string): CommandDocument | undefined {
  return MOCK_DOCUMENTS.find(d => d.id === id);
}

export function getAllMockDocuments(): CommandDocument[] {
  return MOCK_DOCUMENTS;
}
