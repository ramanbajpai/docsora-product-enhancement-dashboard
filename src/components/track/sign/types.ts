// Sign-specific types for the unified Track → Sign section
// Status-first design: role-aware, recipient-centric for Received tab

export type SignStatus = 
  | "action_required"    // User needs to sign or approve now (received tab only)
  | "waiting"            // Sequential signing - not user's turn yet (received tab only)
  | "in_progress"        // Sent, awaiting signatures (sent tab only)
  | "completed"          // All parties signed/approved
  | "approved"           // Approver has approved (received tab - approver specific)
  | "declined"           // Any signer declined - terminal (sent tab only)
  | "expired"            // Deadline passed - terminal
  | "cancelled"          // Sender manually cancelled - terminal (sent tab only)
  | "voided";            // Sender voided the request - terminal

// Legacy alias for backward compatibility during migration
export const LEGACY_STATUS_MAP: Record<string, SignStatus> = {
  "waiting_for_others": "in_progress"
};

// Recipient roles determine what action they need to take
export type RecipientRole = "signer" | "approver" | "viewer" | "cc";

export interface SignRecipient {
  name: string;
  email: string;
  status: "pending" | "viewed" | "signed" | "declined";
  role: RecipientRole;
  signedAt?: Date;
  viewedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
  avatar?: string;
  isCurrentUser?: boolean; // Indicates if this recipient is the logged-in user
}

// Role configuration for display
export const recipientRoleConfig: Record<RecipientRole, {
  label: string;
  requiresAction: boolean;
  description: string;
}> = {
  signer: { label: "Signer", requiresAction: true, description: "Must sign the document" },
  approver: { label: "Approver", requiresAction: true, description: "Must approve the document" },
  viewer: { label: "Viewer", requiresAction: false, description: "View-only access" },
  cc: { label: "CC", requiresAction: false, description: "Receives a copy when complete" },
};

// Signing mode determines how recipients sign
export type SigningMode = "parallel" | "sequential";

export interface SignItem {
  id: string;
  name: string;
  type: "pdf" | "docx";
  status: SignStatus;
  signingMode: SigningMode; // Whether recipients sign in parallel or in order
  recipients: SignRecipient[];
  // Sender info - if present, current user is a recipient
  sender?: { name: string; email: string; avatar?: string };
  sentAt: Date;
  lastActivity: Date;
  expiresAt?: Date;
  size: string;
  hasPassword: boolean;
  viewCount: number;
  // Who declined (if declined)
  declinedBy?: {
    name: string;
    email: string;
    reason?: string;
    declinedAt: Date;
  };
  // Activity timeline
  activities: SignActivity[];
  // Audit log
  auditLog: AuditEntry[];
}

export interface SignActivity {
  id: string;
  type: "sent" | "viewed" | "signed" | "declined" | "reminder_sent" | "expired" | "deadline_extended";
  actor: string;
  actorEmail: string;
  timestamp: Date;
  details?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  actorEmail: string;
  timestamp: Date;
  ipAddress: string;
  device: string;
  signatureMetadata?: {
    signatureType: "draw" | "type" | "upload";
    certificateId?: string;
  };
}

// Status configuration for display
// Color mapping:
// - In Progress → Blue (primary brand blue) - Sent tab only
// - Waiting → Neutral blue-grey (recipient waiting for their turn) - Received tab only
// - Completed → Green (success)
// - Approved → Green (success for approvers)
// - Action Required → Amber/Orange (urgent attention, not failure) - Received tab, signers & approvers
// - Declined → Red (explicit rejection) - Sent tab only
// - Voided → Muted red (intentional stop by sender)
// - Expired → Orange (warning / passive failure)
// - Cancelled → Neutral grey (soft terminal state) - Sent tab only
export const signStatusConfig: Record<SignStatus, { 
  label: string; 
  color: string; 
  bg: string; 
  description: string;
  receivedDescription?: string; // Recipient-focused microcopy
  icon?: string;
  dotColor: string; // For dropdown filter dots
}> = {
  action_required: { 
    label: "Action Required", 
    color: "text-amber-600 dark:text-amber-400", 
    bg: "bg-amber-500/15 border-amber-500/40",
    description: "You need to take action on this document",
    receivedDescription: "You need to sign or approve this document now",
    icon: "alert",
    dotColor: "bg-amber-500"
  },
  waiting: { 
    label: "Waiting", 
    color: "text-slate-500 dark:text-slate-400", 
    bg: "bg-slate-500/10 border-slate-500/30",
    description: "Waiting for others to sign first",
    receivedDescription: "Waiting for others to sign first",
    dotColor: "bg-slate-500"
  },
  in_progress: { 
    label: "In Progress", 
    color: "text-blue-500", 
    bg: "bg-blue-500/10 border-blue-500/30",
    description: "Awaiting signatures from recipients",
    receivedDescription: "You've completed your step. Waiting for other participants to finish.",
    dotColor: "bg-blue-500"
  },
  completed: { 
    label: "Completed", 
    color: "text-emerald-500", 
    bg: "bg-emerald-500/10 border-emerald-500/30",
    description: "All parties have signed",
    receivedDescription: "You have signed this document",
    icon: "check",
    dotColor: "bg-emerald-500"
  },
  approved: { 
    label: "Approved", 
    color: "text-emerald-500", 
    bg: "bg-emerald-500/10 border-emerald-500/30",
    description: "You have approved this document",
    receivedDescription: "You have approved this document",
    icon: "check",
    dotColor: "bg-emerald-500"
  },
  declined: { 
    label: "Declined", 
    color: "text-red-500", 
    bg: "bg-red-500/10 border-red-500/30",
    description: "This request was declined",
    icon: "x",
    dotColor: "bg-red-500"
  },
  expired: { 
    label: "Expired", 
    color: "text-orange-500", 
    bg: "bg-orange-500/10 border-orange-500/30",
    description: "Signing deadline has passed",
    receivedDescription: "Signing deadline passed",
    dotColor: "bg-orange-500"
  },
  cancelled: { 
    label: "Cancelled", 
    color: "text-gray-500", 
    bg: "bg-gray-500/10 border-gray-500/30",
    description: "Request was cancelled by sender",
    dotColor: "bg-gray-500"
  },
  voided: { 
    label: "Voided", 
    color: "text-red-800 dark:text-red-400", 
    bg: "bg-red-900/10 border-red-800/25",
    description: "Request was voided by sender - cannot be completed",
    receivedDescription: "Request voided by sender",
    icon: "ban",
    dotColor: "bg-red-800 dark:bg-red-400"
  },
};
