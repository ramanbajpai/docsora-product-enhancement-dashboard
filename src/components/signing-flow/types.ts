// Types for the guided signing flow

export type SigningFlowStep = 
  | "otp"           // Step 0: Identity verification
  | "overview"      // Step 1: Signing overview
  | "document"      // Step 2: Guided document signing
  | "review"        // Step 3: Review summary
  | "submitting"    // Processing submission
  | "success";      // Step 4: Success screen

export interface SigningField {
  id: string;
  type: "signature" | "initials" | "date" | "text" | "checkbox";
  label: string;
  page: number;
  position: { x: number; y: number; width: number; height: number };
  required: boolean;
  completed: boolean;
  value?: string;
}

export interface SigningDocument {
  id: string;
  name: string;
  type: "pdf" | "docx";
  senderName: string;
  senderEmail: string;
  recipientRole: "signer" | "approver" | "viewer";
  dueDate?: Date;
  fields: SigningField[];
  totalPages: number;
}

export interface SigningComment {
  id: string;
  text: string;
  selection?: {
    page: number;
    text: string;
    position: { x: number; y: number };
  };
  createdAt: Date;
}

export type DeclineReason = 
  | "terms_revision"
  | "clause_review"
  | "incorrect_info"
  | "legal_approval"
  | "need_time"
  | "sent_error"
  | "other";

export const declineReasonLabels: Record<DeclineReason, string> = {
  terms_revision: "Terms need revision",
  clause_review: "Specific clause needs review",
  incorrect_info: "Incorrect or missing information",
  legal_approval: "Legal approval required",
  need_time: "Need more time",
  sent_error: "Sent in error",
  other: "Other"
};

// Reasons that show the clause reference field
export const clauseReferenceReasons: DeclineReason[] = ["terms_revision", "clause_review"];
