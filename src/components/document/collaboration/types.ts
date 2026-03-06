// Collaboration types for enterprise document editing

export type UserRole = "owner" | "editor" | "viewer";
export type CollaborationMode = "view" | "edit" | "comment" | "annotate" | "suggest";

export interface DocumentSelection {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  paragraphId: string;
}

export interface ThreadedComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  selection?: DocumentSelection;
  replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface Suggestion {
  id: string;
  author: string;
  avatar: string;
  originalText: string;
  suggestedText: string;
  selection: DocumentSelection;
  timestamp: string;
  status: "pending" | "accepted" | "rejected";
}

export interface Annotation {
  id: string;
  type: "highlight" | "underline" | "strikethrough" | "rectangle" | "arrow" | "callout";
  color: string;
  selection?: DocumentSelection;
  position?: { x: number; y: number; width?: number; height?: number; endX?: number; endY?: number };
  content?: string;
  comment?: ThreadedComment;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  isOnline: boolean;
  cursorColor: string;
  cursorPosition?: { x: number; y: number; paragraphId?: string };
}

export interface VersionHistoryItem {
  id: string;
  timestamp: string;
  author: string;
  changes: string;
  snapshot?: string;
}

// Permission helpers
export const canPerformAction = (
  role: UserRole, 
  mode: CollaborationMode, 
  action: "edit" | "comment" | "suggest" | "annotate" | "manage"
): boolean => {
  switch (action) {
    case "manage":
      return role === "owner";
    case "edit":
      return (role === "owner" || role === "editor") && mode === "edit";
    case "suggest":
      return (role === "owner" || role === "editor") && mode === "suggest";
    case "comment":
      return mode === "comment";
    case "annotate":
      return mode === "annotate";
    default:
      return false;
  }
};

export const getModeForRole = (role: UserRole): CollaborationMode[] => {
  switch (role) {
    case "owner":
      return ["view", "edit", "comment", "annotate", "suggest"];
    case "editor":
      return ["view", "edit", "comment", "annotate", "suggest"];
    case "viewer":
      return ["view", "comment"];
    default:
      return ["view"];
  }
};
