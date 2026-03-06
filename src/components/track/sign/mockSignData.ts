import { SignItem } from "./types";

// Current user context for demo
const CURRENT_USER = { name: "You", email: "you@company.com" };

// Unified mock data - combines sent and received into one list
// Status is automatically determined based on user's role and document state
export const mockSignItems: SignItem[] = [
  // ACTION REQUIRED - User needs to sign (Parallel with multiple signers)
  {
    id: "s1",
    name: "Vendor Agreement - Sign Request.pdf",
    type: "pdf",
    status: "action_required",
    signingMode: "parallel",
    recipients: [
      { name: "You", email: "you@company.com", status: "viewed", role: "signer", viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), isCurrentUser: true },
      { name: "John Smith", email: "john.smith@acme.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
      { name: "Sarah Johnson", email: "sarah.j@acme.com", status: "pending", role: "signer" },
      { name: "Legal Team", email: "legal@acme.com", status: "signed", role: "approver", signedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 10 * 60 * 60 * 1000) },
      { name: "Contract Admin", email: "admin@acme.com", status: "pending", role: "cc" },
    ],
    sender: { name: "Acme Corp", email: "contracts@acme.com" },
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    size: "2.1 MB",
    hasPassword: false,
    viewCount: 3,
    activities: [
      { id: "a1", type: "sent", actor: "Acme Corp", actorEmail: "contracts@acme.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "Legal Team", actorEmail: "legal@acme.com", timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "John Smith", actorEmail: "john.smith@acme.com", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      { id: "a4", type: "viewed", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "Acme Corp", actorEmail: "contracts@acme.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
      { id: "l2", action: "Document signed (1/3)", actor: "John Smith", actorEmail: "john.smith@acme.com", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), ipAddress: "10.0.0.50", device: "Safari on macOS" },
    ],
  },
  {
    id: "s2",
    name: "NDA - Confidentiality Agreement.pdf",
    type: "pdf",
    status: "action_required",
    signingMode: "sequential",
    recipients: [
      { name: "CEO - TechStart", email: "ceo@techstart.io", status: "signed", role: "signer", signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000) },
      { name: "You", email: "you@company.com", status: "pending", role: "signer", isCurrentUser: true },
      { name: "Legal Counsel", email: "legal@techstart.io", status: "pending", role: "approver" },
      { name: "HR Director", email: "hr@techstart.io", status: "pending", role: "viewer" },
    ],
    sender: { name: "TechStart Inc", email: "legal@techstart.io" },
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    size: "890 KB",
    hasPassword: true,
    viewCount: 2,
    activities: [
      { id: "a1", type: "sent", actor: "TechStart Inc", actorEmail: "legal@techstart.io", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "CEO - TechStart", actorEmail: "ceo@techstart.io", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "TechStart Inc", actorEmail: "legal@techstart.io", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
    ],
  },
  // ACTION REQUIRED - Large multi-party sequential signing
  {
    id: "s2b",
    name: "Enterprise Software License Agreement.pdf",
    type: "pdf",
    status: "action_required",
    signingMode: "sequential",
    recipients: [
      { name: "VP of Sales", email: "vp.sales@enterprise.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { name: "Account Manager", email: "am@enterprise.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { name: "You", email: "you@company.com", status: "viewed", role: "signer", viewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), isCurrentUser: true },
      { name: "IT Director", email: "it.director@company.com", status: "pending", role: "signer" },
      { name: "Procurement Lead", email: "procurement@company.com", status: "pending", role: "approver" },
      { name: "Finance Controller", email: "finance@company.com", status: "pending", role: "approver" },
      { name: "Legal Review", email: "legal.review@company.com", status: "pending", role: "viewer" },
      { name: "CTO Office", email: "cto@company.com", status: "pending", role: "cc" },
    ],
    sender: { name: "Enterprise Software Inc", email: "contracts@enterprise.com" },
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    size: "4.2 MB",
    hasPassword: false,
    viewCount: 5,
    activities: [
      { id: "a1", type: "sent", actor: "Enterprise Software Inc", actorEmail: "contracts@enterprise.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "VP of Sales", actorEmail: "vp.sales@enterprise.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "Account Manager", actorEmail: "am@enterprise.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: "a4", type: "viewed", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "Enterprise Software Inc", actorEmail: "contracts@enterprise.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
    ],
  },

  // WAITING FOR OTHERS - User sent, waiting for signatures (PARALLEL)
  {
    id: "s3",
    name: "Employment Contract - John Doe.pdf",
    type: "pdf",
    status: "in_progress",
    signingMode: "parallel",
    recipients: [
      { name: "John Doe", email: "john@employee.com", status: "viewed", role: "signer", viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { name: "HR Manager", email: "hr@company.com", status: "signed", role: "approver", signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    ],
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    size: "1.1 MB",
    hasPassword: false,
    viewCount: 4,
    activities: [
      { id: "a1", type: "sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "viewed", actor: "HR Manager", actorEmail: "hr@company.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "HR Manager", actorEmail: "hr@company.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: "a4", type: "viewed", actor: "John Doe", actorEmail: "john@employee.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: "a5", type: "reminder_sent", actor: "System", actorEmail: "system@docsora.com", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), details: "Reminder sent to John Doe" },
    ],
    auditLog: [
      { id: "l1", action: "Document created and sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS" },
      { id: "l2", action: "Document signed (1/2)", actor: "HR Manager", actorEmail: "hr@company.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), ipAddress: "10.0.0.15", device: "Safari on macOS", signatureMetadata: { signatureType: "draw", certificateId: "CERT-2025-001" } },
    ],
  },
  // WAITING FOR OTHERS - User sent, waiting for signatures (SEQUENTIAL - shows order)
  {
    id: "s4",
    name: "Investment Agreement - MultiSig.pdf",
    type: "pdf",
    status: "in_progress",
    signingMode: "sequential",
    recipients: [
      { name: "Investor A", email: "investor.a@fund.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { name: "Investor B", email: "investor.b@fund.com", status: "viewed", role: "signer", viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { name: "Legal Counsel", email: "counsel@law.com", status: "pending", role: "approver" },
      { name: "Admin Team", email: "admin@company.com", status: "pending", role: "cc" },
    ],
    sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    size: "4.5 MB",
    hasPassword: true,
    viewCount: 12,
    activities: [
      { id: "a1", type: "sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "viewed", actor: "Investor A", actorEmail: "investor.a@fund.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "Investor A", actorEmail: "investor.a@fund.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: "a4", type: "viewed", actor: "Investor B", actorEmail: "investor.b@fund.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document created and sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS" },
      { id: "l2", action: "Document signed (1/3)", actor: "Investor A", actorEmail: "investor.a@fund.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), ipAddress: "172.16.0.50", device: "Safari on iOS", signatureMetadata: { signatureType: "draw", certificateId: "CERT-2025-003" } },
    ],
  },

  // SIGNER COMPLETED - Waiting for others (Received, user has signed but doc still in progress)
  {
    id: "s4b",
    name: "Partnership Agreement - Final Review.pdf",
    type: "pdf",
    status: "in_progress",
    signingMode: "sequential",
    recipients: [
      { name: "You", email: "you@company.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), isCurrentUser: true },
      { name: "Partner Representative", email: "partner@partnerfirm.com", status: "viewed", role: "signer", viewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      { name: "Legal Counsel", email: "legal@partnerfirm.com", status: "pending", role: "approver" },
      { name: "Finance Director", email: "finance@company.com", status: "pending", role: "approver" },
      { name: "Compliance Team", email: "compliance@company.com", status: "pending", role: "viewer" },
    ],
    sender: { name: "Partner Firm LLP", email: "contracts@partnerfirm.com" },
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    size: "3.2 MB",
    hasPassword: false,
    viewCount: 4,
    activities: [
      { id: "a1", type: "sent", actor: "Partner Firm LLP", actorEmail: "contracts@partnerfirm.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "viewed", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: "a4", type: "viewed", actor: "Partner Representative", actorEmail: "partner@partnerfirm.com", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "Partner Firm LLP", actorEmail: "contracts@partnerfirm.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
      { id: "l2", action: "Document signed (1/4)", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS", signatureMetadata: { signatureType: "draw", certificateId: "CERT-2025-010" } },
    ],
  },

  // COMPLETED - All signed
  {
    id: "s5",
    name: "NDA Agreement - Vendor.pdf",
    type: "pdf",
    status: "completed",
    signingMode: "parallel",
    recipients: [
      { name: "Vendor Corp", email: "legal@vendor.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
    ],
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    size: "890 KB",
    hasPassword: true,
    viewCount: 3,
    activities: [
      { id: "a1", type: "sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "viewed", actor: "Vendor Corp", actorEmail: "legal@vendor.com", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "Vendor Corp", actorEmail: "legal@vendor.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document created and sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS" },
      { id: "l2", action: "Document signed - Complete", actor: "Vendor Corp", actorEmail: "legal@vendor.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), ipAddress: "203.0.113.42", device: "Firefox on Windows", signatureMetadata: { signatureType: "type", certificateId: "CERT-2025-002" } },
    ],
  },
  {
    id: "s6",
    name: "Service Agreement 2025.pdf",
    type: "pdf",
    status: "completed",
    signingMode: "sequential",
    recipients: [
      { name: "Client A", email: "client@company.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
      { name: "Client B", email: "clientb@company.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
    ],
    sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    size: "2.3 MB",
    hasPassword: false,
    viewCount: 8,
    activities: [
      { id: "a1", type: "sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "viewed", actor: "Client A", actorEmail: "client@company.com", timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "viewed", actor: "Client B", actorEmail: "clientb@company.com", timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
      { id: "a4", type: "signed", actor: "Client A", actorEmail: "client@company.com", timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { id: "a5", type: "signed", actor: "Client B", actorEmail: "clientb@company.com", timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document created and sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS" },
      { id: "l2", action: "All parties signed - Complete", actor: "System", actorEmail: "system@docsora.com", timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "System" },
    ],
  },
  {
    id: "s7",
    name: "Employment Offer Letter.pdf",
    type: "pdf",
    status: "completed",
    signingMode: "parallel",
    recipients: [
      { name: "HR Director", email: "hr.director@newemployer.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { name: "New Employer Co", email: "hr@newemployer.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { name: "You", email: "you@company.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), isCurrentUser: true },
      { name: "Department Manager", email: "manager@newemployer.com", status: "signed", role: "approver", signedAt: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { name: "Payroll Team", email: "payroll@newemployer.com", status: "pending", role: "cc" },
    ],
    sender: { name: "New Employer Co", email: "hr@newemployer.com" },
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    size: "1.2 MB",
    hasPassword: false,
    viewCount: 5,
    activities: [
      { id: "a1", type: "sent", actor: "New Employer Co", actorEmail: "hr@newemployer.com", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "HR Director", actorEmail: "hr.director@newemployer.com", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "New Employer Co", actorEmail: "hr@newemployer.com", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
      { id: "l2", action: "Document signed", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS", signatureMetadata: { signatureType: "draw" } },
    ],
  },

  // WAITING - Sequential signing, not user's turn yet (Received tab only)
  // Multi-party with many signers, approvers, viewers, and CC recipients
  {
    id: "s7b",
    name: "Multi-Party Investment Agreement.pdf",
    type: "pdf",
    status: "waiting",
    signingMode: "sequential",
    recipients: [
      { name: "Lead Investor", email: "lead@investor.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { name: "Co-Investor Alpha", email: "alpha@investors.vc", status: "signed", role: "signer", signedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { name: "Sarah Chen", email: "sarah.chen@angelgroup.com", status: "viewed", role: "signer", viewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      { name: "You", email: "you@company.com", status: "pending", role: "signer", isCurrentUser: true },
      { name: "Marcus Johnson", email: "marcus@fundpartners.io", status: "pending", role: "signer" },
      { name: "Emily Rodriguez", email: "emily.r@capitalventures.com", status: "pending", role: "signer" },
      { name: "Board Representative", email: "board@company.com", status: "pending", role: "approver" },
      { name: "Legal Counsel", email: "counsel@lawfirm.com", status: "pending", role: "approver" },
      { name: "CFO Office", email: "cfo@company.com", status: "pending", role: "approver" },
      { name: "Investor Relations", email: "ir@company.com", status: "viewed", role: "viewer", viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { name: "External Auditor", email: "audit@pwc.com", status: "pending", role: "viewer" },
      { name: "Compliance Officer", email: "compliance@company.com", status: "viewed", role: "viewer", viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { name: "Admin Team", email: "admin@company.com", status: "pending", role: "cc" },
      { name: "Deal Room Archive", email: "archive@vcfund.com", status: "pending", role: "cc" },
      { name: "Executive Assistant", email: "ea@ceo.com", status: "pending", role: "cc" },
      { name: "Records Department", email: "records@company.com", status: "pending", role: "cc" },
    ],
    sender: { name: "Venture Capital LLC", email: "deals@vcfund.com" },
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    size: "3.4 MB",
    hasPassword: false,
    viewCount: 18,
    activities: [
      { id: "a1", type: "sent", actor: "Venture Capital LLC", actorEmail: "deals@vcfund.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "Board Representative", actorEmail: "board@company.com", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "viewed", actor: "Lead Investor", actorEmail: "lead@investor.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: "a4", type: "signed", actor: "Lead Investor", actorEmail: "lead@investor.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: "a5", type: "viewed", actor: "Co-Investor Alpha", actorEmail: "alpha@investors.vc", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: "a6", type: "viewed", actor: "Compliance Officer", actorEmail: "compliance@company.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: "a7", type: "signed", actor: "Co-Investor Alpha", actorEmail: "alpha@investors.vc", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: "a8", type: "viewed", actor: "Investor Relations", actorEmail: "ir@company.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: "a9", type: "viewed", actor: "Sarah Chen", actorEmail: "sarah.chen@angelgroup.com", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "Venture Capital LLC", actorEmail: "deals@vcfund.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
      { id: "l2", action: "Board approval granted", actor: "Board Representative", actorEmail: "board@company.com", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), ipAddress: "10.0.1.50", device: "Chrome on Windows" },
      { id: "l3", action: "Document signed (1/6)", actor: "Lead Investor", actorEmail: "lead@investor.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), ipAddress: "172.16.0.50", device: "Safari on macOS", signatureMetadata: { signatureType: "draw", certificateId: "CERT-2025-INV-001" } },
      { id: "l4", action: "Document signed (2/6)", actor: "Co-Investor Alpha", actorEmail: "alpha@investors.vc", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), ipAddress: "192.168.10.22", device: "Chrome on macOS", signatureMetadata: { signatureType: "type", certificateId: "CERT-2025-INV-002" } },
    ],
  },

  // EXPIRED - Received (user failed to sign in time) - Multiple signers
  {
    id: "s7c",
    name: "Time-Sensitive Approval Request.pdf",
    type: "pdf",
    status: "expired",
    signingMode: "parallel",
    recipients: [
      { name: "You", email: "you@company.com", status: "pending", role: "signer", isCurrentUser: true },
      { name: "Department Head", email: "dept.head@urgentcorp.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
      { name: "Project Manager", email: "pm@urgentcorp.com", status: "pending", role: "signer" },
      { name: "Compliance Officer", email: "compliance@urgentcorp.com", status: "signed", role: "approver", signedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
    ],
    sender: { name: "Urgent Corp", email: "ops@urgentcorp.com" },
    sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    size: "540 KB",
    hasPassword: false,
    viewCount: 3,
    activities: [
      { id: "a1", type: "sent", actor: "Urgent Corp", actorEmail: "ops@urgentcorp.com", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "Department Head", actorEmail: "dept.head@urgentcorp.com", timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "expired", actor: "System", actorEmail: "system@docsora.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), details: "Signing deadline passed" },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "Urgent Corp", actorEmail: "ops@urgentcorp.com", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
      { id: "l2", action: "Document expired", actor: "System", actorEmail: "system@docsora.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "System" },
    ],
  },

  // VOIDED - Received (sender voided the request) - Sequential with multiple parties
  {
    id: "s7d",
    name: "Consulting Agreement.pdf",
    type: "pdf",
    status: "voided",
    signingMode: "sequential",
    recipients: [
      { name: "Senior Consultant", email: "senior@consultgroup.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000) },
      { name: "You", email: "you@company.com", status: "viewed", role: "signer", viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), isCurrentUser: true },
      { name: "Managing Partner", email: "partner@consultgroup.com", status: "pending", role: "signer" },
      { name: "Client Relations", email: "relations@consultgroup.com", status: "pending", role: "approver" },
      { name: "Billing Department", email: "billing@consultgroup.com", status: "pending", role: "cc" },
    ],
    sender: { name: "Consulting Group", email: "contracts@consultgroup.com" },
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    size: "1.8 MB",
    hasPassword: false,
    viewCount: 4,
    activities: [
      { id: "a1", type: "sent", actor: "Consulting Group", actorEmail: "contracts@consultgroup.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "Senior Consultant", actorEmail: "senior@consultgroup.com", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "Consulting Group", actorEmail: "contracts@consultgroup.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
      { id: "l2", action: "Document voided by sender", actor: "Consulting Group", actorEmail: "contracts@consultgroup.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
    ],
  },

  // ============================================
  // DECLINED EXAMPLES - Received Tab
  // ============================================

  // DECLINED - A signer declined the document (user was also a signer)
  {
    id: "s7-declined-signer",
    name: "Partnership Agreement.pdf",
    type: "pdf",
    status: "declined",
    signingMode: "parallel",
    recipients: [
      { name: "You", email: "you@company.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), isCurrentUser: true },
      { name: "James Wilson", email: "james.wilson@partner.com", status: "declined", role: "signer", viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), declinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), declineReason: "Terms in section 4.2 are not acceptable. Need to renegotiate revenue share percentage." },
      { name: "Lisa Chen", email: "lisa.chen@partner.com", status: "pending", role: "signer" },
      { name: "Legal Review", email: "legal@partner.com", status: "pending", role: "approver" },
      { name: "Finance Team", email: "finance@company.com", status: "pending", role: "cc" },
    ],
    sender: { name: "Partner Corp", email: "contracts@partner.com" },
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    size: "1.8 MB",
    hasPassword: false,
    viewCount: 4,
    declinedBy: {
      name: "James Wilson",
      email: "james.wilson@partner.com",
      reason: "Terms in section 4.2 are not acceptable. Need to renegotiate revenue share percentage.",
      declinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    activities: [
      { id: "a1", type: "sent", actor: "Partner Corp", actorEmail: "contracts@partner.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "viewed", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: "a4", type: "viewed", actor: "James Wilson", actorEmail: "james.wilson@partner.com", timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000) },
      { id: "a5", type: "declined", actor: "James Wilson", actorEmail: "james.wilson@partner.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), details: "Terms in section 4.2 are not acceptable" },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "Partner Corp", actorEmail: "contracts@partner.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
      { id: "l2", action: "Document signed", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS", signatureMetadata: { signatureType: "draw" } },
      { id: "l3", action: "Document declined", actor: "James Wilson", actorEmail: "james.wilson@partner.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), ipAddress: "10.0.0.88", device: "Safari on macOS" },
    ],
  },

  // DECLINED - An approver rejected the document
  {
    id: "s7-rejected-approver",
    name: "Vendor Onboarding Contract.pdf",
    type: "pdf",
    status: "declined",
    signingMode: "sequential",
    recipients: [
      { name: "Vendor Sales Rep", email: "sales@vendor.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { name: "You", email: "you@company.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), isCurrentUser: true },
      { name: "Compliance Officer", email: "compliance@company.com", status: "declined", role: "approver", viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), declinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), declineReason: "Vendor does not meet our compliance requirements. Missing SOC 2 certification and data privacy addendum." },
      { name: "Procurement Head", email: "procurement@company.com", status: "pending", role: "approver" },
      { name: "IT Security", email: "it.security@company.com", status: "pending", role: "viewer" },
      { name: "Accounts Payable", email: "ap@company.com", status: "pending", role: "cc" },
    ],
    sender: { name: "Procurement Team", email: "procurement@company.com" },
    sentAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    size: "2.4 MB",
    hasPassword: true,
    viewCount: 5,
    declinedBy: {
      name: "Compliance Officer",
      email: "compliance@company.com",
      reason: "Vendor does not meet our compliance requirements. Missing SOC 2 certification and data privacy addendum.",
      declinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    activities: [
      { id: "a1", type: "sent", actor: "Procurement Team", actorEmail: "procurement@company.com", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "Vendor Sales Rep", actorEmail: "sales@vendor.com", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: "a4", type: "viewed", actor: "Compliance Officer", actorEmail: "compliance@company.com", timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000) },
      { id: "a5", type: "declined", actor: "Compliance Officer", actorEmail: "compliance@company.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), details: "Missing SOC 2 certification and data privacy addendum" },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "Procurement Team", actorEmail: "procurement@company.com", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
      { id: "l2", action: "Document signed (1/2)", actor: "Vendor Sales Rep", actorEmail: "sales@vendor.com", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), ipAddress: "203.0.113.50", device: "Chrome on Windows" },
      { id: "l3", action: "Document signed (2/2)", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS", signatureMetadata: { signatureType: "type" } },
      { id: "l4", action: "Document rejected by approver", actor: "Compliance Officer", actorEmail: "compliance@company.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), ipAddress: "10.0.0.25", device: "Firefox on Windows" },
    ],
  },

  // ============================================
  // APPROVER EXAMPLES - Received Tab
  // ============================================
  
  // ACTION REQUIRED - User is an approver (with signers already signed)
  {
    id: "s7e",
    name: "Budget Approval Q1 2026.pdf",
    type: "pdf",
    status: "action_required",
    signingMode: "parallel",
    recipients: [
      { name: "CFO", email: "cfo@company.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 8 * 60 * 60 * 1000) },
      { name: "Controller", email: "controller@company.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { name: "You", email: "you@company.com", status: "pending", role: "approver", isCurrentUser: true },
      { name: "Board Secretary", email: "secretary@company.com", status: "pending", role: "approver" },
      { name: "Audit Committee", email: "audit@company.com", status: "pending", role: "viewer" },
      { name: "Executive Team", email: "exec@company.com", status: "pending", role: "cc" },
    ],
    sender: { name: "Finance Team", email: "finance@company.com" },
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    size: "1.5 MB",
    hasPassword: false,
    viewCount: 4,
    activities: [
      { id: "a1", type: "sent", actor: "Finance Team", actorEmail: "finance@company.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "CFO", actorEmail: "cfo@company.com", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "Controller", actorEmail: "controller@company.com", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "Finance Team", actorEmail: "finance@company.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
    ],
  },

  // ACTION REQUIRED - Sequential approval
  {
    id: "s7e2",
    name: "Vendor Contract Review - Urgent.pdf",
    type: "pdf",
    status: "action_required",
    signingMode: "sequential",
    recipients: [
      { name: "Vendor Rep", email: "rep@vendor.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000) },
      { name: "Procurement Manager", email: "manager@procurement.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 18 * 60 * 60 * 1000) },
      { name: "You", email: "you@company.com", status: "viewed", role: "approver", viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), isCurrentUser: true },
      { name: "Legal Department", email: "legal@company.com", status: "pending", role: "approver" },
      { name: "Risk Assessment", email: "risk@company.com", status: "pending", role: "viewer" },
    ],
    sender: { name: "Procurement", email: "procurement@company.com" },
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    size: "3.2 MB",
    hasPassword: false,
    viewCount: 4,
    activities: [
      { id: "a1", type: "sent", actor: "Procurement", actorEmail: "procurement@company.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "Vendor Rep", actorEmail: "rep@vendor.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "Procurement Manager", actorEmail: "manager@procurement.com", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      { id: "a4", type: "viewed", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "Procurement", actorEmail: "procurement@company.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
    ],
  },

  // APPROVED - User has approved (with multiple signers)
  {
    id: "s7f",
    name: "Marketing Campaign Proposal.pdf",
    type: "pdf",
    status: "completed",
    signingMode: "parallel",
    recipients: [
      { name: "Marketing Dept", email: "marketing@company.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { name: "Creative Director", email: "creative@marketing.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { name: "Brand Manager", email: "brand@marketing.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { name: "You", email: "you@company.com", status: "signed", role: "approver", signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), isCurrentUser: true },
      { name: "VP Marketing", email: "vp@marketing.com", status: "signed", role: "approver", signedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { name: "Media Team", email: "media@marketing.com", status: "viewed", role: "viewer", viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { name: "Analytics", email: "analytics@company.com", status: "pending", role: "cc" },
    ],
    sender: { name: "Marketing Dept", email: "marketing@company.com" },
    sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
    size: "2.3 MB",
    hasPassword: false,
    viewCount: 6,
    activities: [
      { id: "a1", type: "sent", actor: "Marketing Dept", actorEmail: "marketing@company.com", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "Creative Director", actorEmail: "creative@marketing.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document received", actor: "Marketing Dept", actorEmail: "marketing@company.com", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
      { id: "l2", action: "Document approved", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS" },
    ],
  },

  // ============================================
  // VIEWER EXAMPLES - Received Tab
  // ============================================

  // VIEWER - Pending document (Sequential with progress) - No password protection
  {
    id: "s7g2",
    name: "Strategic Plan 2026 - Draft.pdf",
    type: "pdf",
    status: "waiting",
    signingMode: "sequential",
    recipients: [
      { name: "Strategy Lead", email: "lead@strategy.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000) },
      { name: "Department Heads", email: "heads@company.com", status: "viewed", role: "signer", viewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      { name: "COO", email: "coo@company.com", status: "pending", role: "signer" },
      { name: "CEO", email: "ceo@company.com", status: "pending", role: "approver" },
      { name: "Board Representative", email: "board.rep@company.com", status: "pending", role: "approver" },
      { name: "You", email: "you@company.com", status: "pending", role: "viewer", isCurrentUser: true },
      { name: "External Consultant", email: "consultant@external.com", status: "pending", role: "viewer" },
      { name: "Stakeholder Group", email: "stakeholders@company.com", status: "pending", role: "cc" },
    ],
    sender: { name: "Strategy Team", email: "strategy@company.com" },
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    size: "5.4 MB",
    hasPassword: false,
    viewCount: 3,
    activities: [
      { id: "a1", type: "sent", actor: "Strategy Team", actorEmail: "strategy@company.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "Strategy Lead", actorEmail: "lead@strategy.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document shared for viewing", actor: "Strategy Team", actorEmail: "strategy@company.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
    ],
  },

  // ============================================
  // CC EXAMPLES - Received Tab
  // ============================================

  // CC - Pending document (Sequential in progress)
  {
    id: "s7h2",
    name: "Supplier Agreement - TechParts Inc.pdf",
    type: "pdf",
    status: "waiting",
    signingMode: "sequential",
    recipients: [
      { name: "TechParts Sales", email: "sales@techparts.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 18 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 20 * 60 * 60 * 1000) },
      { name: "TechParts Legal", email: "legal@techparts.com", status: "viewed", role: "signer", viewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
      { name: "Procurement Lead", email: "procurement.lead@company.com", status: "pending", role: "signer" },
      { name: "Vendor Manager", email: "vendor.manager@company.com", status: "pending", role: "approver" },
      { name: "Quality Assurance", email: "qa@company.com", status: "pending", role: "viewer" },
      { name: "You", email: "you@company.com", status: "pending", role: "cc", isCurrentUser: true },
      { name: "Supply Chain", email: "supplychain@company.com", status: "pending", role: "cc" },
    ],
    sender: { name: "Purchasing Dept", email: "purchasing@company.com" },
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    size: "2.7 MB",
    hasPassword: false,
    viewCount: 3,
    activities: [
      { id: "a1", type: "sent", actor: "Purchasing Dept", actorEmail: "purchasing@company.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "signed", actor: "TechParts Sales", actorEmail: "sales@techparts.com", timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "CC added to signing request", actor: "Purchasing Dept", actorEmail: "purchasing@company.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "-" },
    ],
  },

  // DECLINED - Terminal state
  {
    id: "s8",
    name: "Partnership Agreement.pdf",
    type: "pdf",
    status: "declined",
    signingMode: "parallel",
    recipients: [
      { name: "Partner Corp", email: "legal@partner.com", status: "declined", role: "signer", viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), declinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), declineReason: "Terms not acceptable - requesting revision to Section 4.2" },
    ],
    declinedBy: {
      name: "Partner Corp",
      email: "legal@partner.com",
      reason: "Terms not acceptable - requesting revision to Section 4.2",
      declinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    size: "1.8 MB",
    hasPassword: false,
    viewCount: 5,
    activities: [
      { id: "a1", type: "sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "viewed", actor: "Partner Corp", actorEmail: "legal@partner.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "declined", actor: "Partner Corp", actorEmail: "legal@partner.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), details: "Terms not acceptable - requesting revision to Section 4.2" },
    ],
    auditLog: [
      { id: "l1", action: "Document created and sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS" },
      { id: "l2", action: "Document declined - Signing request closed", actor: "Partner Corp", actorEmail: "legal@partner.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), ipAddress: "198.51.100.23", device: "Edge on Windows" },
    ],
  },

  // EXPIRED - Terminal state
  {
    id: "s9",
    name: "Lease Agreement - Office Space.pdf",
    type: "pdf",
    status: "expired",
    signingMode: "parallel",
    recipients: [
      { name: "Landlord LLC", email: "contracts@landlord.com", status: "pending", role: "signer" },
    ],
    sentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    size: "3.2 MB",
    hasPassword: true,
    viewCount: 0,
    activities: [
      { id: "a1", type: "sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "reminder_sent", actor: "System", actorEmail: "system@docsora.com", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), details: "Reminder sent to Landlord LLC" },
      { id: "a3", type: "expired", actor: "System", actorEmail: "system@docsora.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), details: "Signing deadline passed" },
    ],
    auditLog: [
      { id: "l1", action: "Document created and sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS" },
      { id: "l2", action: "Document expired - Signing deadline passed", actor: "System", actorEmail: "system@docsora.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "System" },
    ],
  },
  {
    id: "s10",
    name: "Consulting Agreement.pdf",
    type: "pdf",
    status: "expired",
    signingMode: "sequential",
    recipients: [
      { name: "Consultant Inc", email: "legal@consultant.com", status: "viewed", role: "signer", viewedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
    ],
    sentAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    size: "1.5 MB",
    hasPassword: false,
    viewCount: 2,
    activities: [
      { id: "a1", type: "sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "viewed", actor: "Consultant Inc", actorEmail: "legal@consultant.com", timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "expired", actor: "System", actorEmail: "system@docsora.com", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), details: "Signing deadline passed" },
    ],
    auditLog: [
      { id: "l1", action: "Document created and sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS" },
      { id: "l2", action: "Document expired", actor: "System", actorEmail: "system@docsora.com", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), ipAddress: "-", device: "System" },
    ],
  },

  // VOIDED - Terminal state
  {
    id: "s11",
    name: "Acquisition Term Sheet - VOIDED.pdf",
    type: "pdf",
    status: "voided",
    signingMode: "sequential",
    recipients: [
      { name: "Target Company CEO", email: "ceo@targetco.com", status: "signed", role: "signer", signedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), viewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { name: "Target Company CFO", email: "cfo@targetco.com", status: "viewed", role: "signer", viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { name: "Legal Counsel", email: "counsel@lawfirm.com", status: "pending", role: "approver" },
    ],
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    size: "2.8 MB",
    hasPassword: true,
    viewCount: 8,
    activities: [
      { id: "a1", type: "sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { id: "a2", type: "viewed", actor: "Target Company CEO", actorEmail: "ceo@targetco.com", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: "a3", type: "signed", actor: "Target Company CEO", actorEmail: "ceo@targetco.com", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { id: "a4", type: "viewed", actor: "Target Company CFO", actorEmail: "cfo@targetco.com", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document created and sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS" },
      { id: "l2", action: "Document signed (1/3)", actor: "Target Company CEO", actorEmail: "ceo@targetco.com", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), ipAddress: "172.16.0.50", device: "Safari on macOS", signatureMetadata: { signatureType: "draw", certificateId: "CERT-2025-010" } },
      { id: "l3", action: "Document voided - Signing process stopped", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS" },
    ],
  },
  {
    id: "s12",
    name: "Vendor Renewal Contract.pdf",
    type: "pdf",
    status: "voided",
    signingMode: "parallel",
    recipients: [
      { name: "Vendor Rep", email: "rep@oldvendor.com", status: "pending", role: "signer" },
    ],
    sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    size: "1.1 MB",
    hasPassword: false,
    viewCount: 0,
    activities: [
      { id: "a1", type: "sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    ],
    auditLog: [
      { id: "l1", action: "Document created and sent", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS" },
      { id: "l2", action: "Document voided - Vendor partnership discontinued", actor: "You", actorEmail: "you@company.com", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), ipAddress: "192.168.1.1", device: "Chrome on macOS" },
    ],
  },
];
