import { useMemo } from "react";

export type IntentType = 
  | "sign"
  | "review"
  | "transfer"
  | "compress"
  | "convert"
  | "search"
  | "insight"
  | "remind"
  | "unknown";

export interface DetectedIntent {
  type: IntentType;
  confidence: number;
  action: string;
  description: string;
  extractedEntities: {
    recipients?: string[];
    document?: string;
    deadline?: string;
    signingOrder?: string[];
    query?: string;
  };
}

interface IntentPattern {
  patterns: RegExp[];
  type: IntentType;
  action: string;
  description: string;
  entityExtractor?: (input: string) => DetectedIntent["extractedEntities"];
}

// Extract recipients from input like "to John and HR" or "John, Sarah, Legal"
function extractRecipients(input: string): string[] {
  const toMatch = input.match(/(?:to|send to|for)\s+([^,]+(?:,\s*[^,]+)*)/i);
  if (toMatch) {
    return toMatch[1]
      .split(/(?:,\s*|\s+and\s+|\s+then\s+)/i)
      .map(r => r.trim())
      .filter(r => r.length > 0 && !["this", "it", "the document"].includes(r.toLowerCase()));
  }
  return [];
}

// Extract signing order from phrases like "HR first" or "John first, then Legal"
function extractSigningOrder(input: string): string[] {
  const orderMatch = input.match(/(\w+)\s+first(?:\s*,?\s*(?:then\s+)?(\w+))?/i);
  if (orderMatch) {
    const order = [orderMatch[1]];
    if (orderMatch[2]) order.push(orderMatch[2]);
    return order;
  }
  return [];
}

// Extract deadline from input
function extractDeadline(input: string): string | undefined {
  const deadlinePatterns = [
    /(?:by|before|deadline|due)\s+(\w+\s+\d+|\d+\s+\w+|tomorrow|next\s+\w+|end of \w+)/i,
    /within\s+(\d+\s+(?:day|hour|week)s?)/i,
  ];
  
  for (const pattern of deadlinePatterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  return undefined;
}

const INTENT_PATTERNS: IntentPattern[] = [
  // Signing intents
  {
    patterns: [
      /send\s+(?:this\s+)?(?:for\s+)?signature/i,
      /(?:get|request)\s+(?:this\s+)?signed/i,
      /send\s+(?:this\s+)?to\s+.+\s+(?:for\s+)?sign/i,
      /prepare\s+(?:this\s+)?for\s+signing/i,
      /send\s+this\s+(?:to|for)/i,
    ],
    type: "sign",
    action: "Send for Signature",
    description: "Route document for e-signature collection",
    entityExtractor: (input) => ({
      recipients: extractRecipients(input),
      signingOrder: extractSigningOrder(input),
      deadline: extractDeadline(input),
    }),
  },
  // Resend / reminder intents
  {
    patterns: [
      /resend\s+(?:this|to)/i,
      /send\s+(?:a\s+)?reminder/i,
      /remind\s+(?:them|everyone|the\s+signer)/i,
      /nudge/i,
      /follow\s+up/i,
    ],
    type: "remind",
    action: "Send Reminder",
    description: "Notify pending signers about outstanding signatures",
    entityExtractor: (input) => ({
      recipients: extractRecipients(input),
      deadline: extractDeadline(input),
    }),
  },
  // Review intents
  {
    patterns: [
      /(?:prepare|get|make)\s+(?:this\s+)?(?:ready\s+)?for\s+(?:review|approval)/i,
      /send\s+(?:this\s+)?for\s+(?:review|approval)/i,
      /(?:needs?|requires?)\s+(?:review|approval)/i,
      /prepare\s+(?:this\s+)?for\s+investors?/i,
      /get\s+(?:legal|compliance)\s+(?:review|approval)/i,
    ],
    type: "review",
    action: "Request Review",
    description: "Send document for internal review or approval",
    entityExtractor: (input) => ({
      recipients: extractRecipients(input),
    }),
  },
  // Transfer intents
  {
    patterns: [
      /(?:transfer|send|share)\s+(?:this\s+)?(?:securely|safely)?/i,
      /secure\s+(?:transfer|send|share)/i,
      /send\s+(?:via\s+)?link/i,
    ],
    type: "transfer",
    action: "Secure Transfer",
    description: "Share document via secure transfer link",
    entityExtractor: (input) => ({
      recipients: extractRecipients(input),
    }),
  },
  // Compress intents
  {
    patterns: [
      /compress\s+(?:this)?/i,
      /reduce\s+(?:file\s+)?size/i,
      /make\s+(?:this\s+)?smaller/i,
      /optimize\s+(?:this)?/i,
    ],
    type: "compress",
    action: "Compress Document",
    description: "Reduce file size while maintaining quality",
  },
  // Convert intents
  {
    patterns: [
      /convert\s+(?:this\s+)?(?:to\s+)?(?:pdf|docx|word)/i,
      /(?:make|turn)\s+(?:this\s+)?(?:into\s+)?(?:a\s+)?(?:pdf|docx|word)/i,
      /(?:export|save)\s+(?:as|to)\s+(?:pdf|docx)/i,
    ],
    type: "convert",
    action: "Convert Format",
    description: "Convert document to another format",
  },
  // Insight intents
  {
    patterns: [
      /why\s+(?:hasn't?|isn't?|is)\s+(?:this|it)/i,
      /what(?:'s|\s+is)\s+(?:blocking|holding|delaying)/i,
      /who(?:'s|\s+is)\s+(?:blocking|holding|slowing)/i,
      /which\s+(?:signer|recipient|clause)/i,
      /analyze\s+(?:this|the)/i,
    ],
    type: "insight",
    action: "Get Insights",
    description: "Analyze document status and identify blockers",
    entityExtractor: (input) => ({
      query: input,
    }),
  },
  // Search intents
  {
    patterns: [
      /(?:show|find|get|list|search)\s+(?:me\s+)?(?:all\s+)?(?:my\s+)?/i,
      /(?:where|which)\s+(?:are|is)\s+(?:my|the)/i,
      /documents?\s+(?:that|which|waiting|pending|signed)/i,
      /(?:unsigned|pending|completed|draft)\s+(?:contracts?|documents?|agreements?)/i,
    ],
    type: "search",
    action: "Search Documents",
    description: "Find documents matching your criteria",
    entityExtractor: (input) => ({
      query: input,
    }),
  },
];

export function useIntentDetection(input: string): DetectedIntent | null {
  return useMemo(() => {
    if (!input.trim()) return null;
    
    const inputLower = input.toLowerCase().trim();
    
    for (const pattern of INTENT_PATTERNS) {
      for (const regex of pattern.patterns) {
        if (regex.test(inputLower)) {
          const entities = pattern.entityExtractor?.(input) || {};
          
          return {
            type: pattern.type,
            confidence: 0.85 + Math.random() * 0.1, // Simulated confidence
            action: pattern.action,
            description: pattern.description,
            extractedEntities: entities,
          };
        }
      }
    }
    
    // Default to search for unrecognized input
    if (inputLower.length > 2) {
      return {
        type: "search",
        confidence: 0.6,
        action: "Search Documents",
        description: "Find documents matching your criteria",
        extractedEntities: { query: input },
      };
    }
    
    return null;
  }, [input]);
}

export function getIntentIcon(type: IntentType): string {
  const icons: Record<IntentType, string> = {
    sign: "PenTool",
    review: "Eye",
    transfer: "Send",
    compress: "Minimize2",
    convert: "FileText",
    search: "Search",
    insight: "Sparkles",
    remind: "Bell",
    unknown: "HelpCircle",
  };
  return icons[type];
}
