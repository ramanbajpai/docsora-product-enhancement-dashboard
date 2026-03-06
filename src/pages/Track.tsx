import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { isWithinInterval } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TrackHeader } from "@/components/track/TrackHeader";
import { TrackFilters } from "@/components/track/TrackFilters";
import { TrackList } from "@/components/track/TrackList";
import { TrackDetailPanel } from "@/components/track/TrackDetailPanel";
import { ReceivedDetailPanel } from "@/components/track/ReceivedDetailPanel";
import { ContractsSummary } from "@/components/track/ContractsSummary";
import { ContractsList } from "@/components/track/ContractsList";
import { ContractDetailPanel } from "@/components/track/ContractDetailPanel";
import { AddContractModal } from "@/components/track/AddContractModal";
import { SignListRedesign, SignDetailPanelRedesign, mockSignItems as signMockItems, SignItem, SignViewTab } from "@/components/track/sign";
import { RecipientTransferView } from "@/components/transfer/recipient/RecipientTransferView";
import { RecipientPasswordProtectedView } from "@/components/transfer/recipient/RecipientPasswordProtectedView";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type MainTab = "transfer" | "sign" | "contracts";
export type TransferSubTab = "sent" | "received";
// SignSubTab removed - unified list, no tabs

export interface TrackItemRecipient {
  name: string;
  email: string;
  status: "pending" | "viewed" | "signed" | "expired";
  avatar?: string;
  openedAt?: Date;
  downloadedAt?: Date;
}

export interface TrackItem {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx" | "pptx" | "image" | "other";
  status: "active" | "viewed" | "pending" | "signed" | "expired" | "completed" | "voided";
  recipients: TrackItemRecipient[];
  sender?: { name: string; email: string }; // For received transfers
  sentAt: Date;
  lastActivity: Date;
  expiresAt?: Date;
  size: string;
  priority: "high" | "normal";
  hasPassword: boolean;
  downloadCount: number;
  viewCount: number;
  voidedAt?: Date;
  voidReason?: string;
}

export interface Contract {
  id: string;
  name: string;
  company: string;
  status: "active" | "expiring" | "expired";
  startDate: Date;
  expiryDate: Date;
  renewalType: "auto" | "manual" | "unknown";
  tags: string[];
  parties: { name: string; role: string; email: string }[];
  signedDate?: Date;
  reminders: { days: number; enabled: boolean }[];
  documentUrl?: string;
  value?: string;
  notes?: string;
}

const mockTransferItems: TrackItem[] = [
  {
    id: "1",
    name: "Q4 Financial Report 2025.pdf",
    type: "pdf",
    status: "active",
    recipients: [
      { name: "Sarah Chen", email: "sarah@acme.com", status: "viewed", openedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { name: "Michael Park", email: "michael@acme.com", status: "pending" },
      { name: "David Kim", email: "david@acme.com", status: "signed", openedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), downloadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    size: "2.4 MB",
    priority: "high",
    hasPassword: true,
    downloadCount: 3,
    viewCount: 7,
  },
  {
    id: "2",
    name: "Contract Amendment Draft.docx",
    type: "docx",
    status: "viewed",
    recipients: [
      { name: "Emily Johnson", email: "emily@legal.co", status: "viewed" },
    ],
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    size: "856 KB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 1,
    viewCount: 4,
  },
  {
    id: "3",
    name: "Partnership Agreement v2.pdf",
    type: "pdf",
    status: "expired",
    recipients: [
      { name: "David Lee", email: "david@partner.io", status: "expired", openedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
      { name: "Anna White", email: "anna@partner.io", status: "expired" },
    ],
    sentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    size: "1.2 MB",
    priority: "high",
    hasPassword: true,
    downloadCount: 0,
    viewCount: 2,
  },
  {
    id: "4",
    name: "Product Roadmap Q1.pptx",
    type: "pptx",
    status: "active",
    recipients: [
      { name: "James Wilson", email: "james@startup.com", status: "viewed" },
      { name: "Lisa Brown", email: "lisa@startup.com", status: "viewed" },
      { name: "Tom Garcia", email: "tom@startup.com", status: "pending" },
    ],
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    size: "4.8 MB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 2,
    viewCount: 5,
  },
  {
    id: "5",
    name: "Annual Budget 2026.xlsx",
    type: "xlsx",
    status: "active",
    recipients: [
      { name: "Robert Kim", email: "robert@finance.co", status: "viewed" },
      { name: "Jessica Lee", email: "jessica@finance.co", status: "pending" },
      { name: "Mark Chen", email: "mark@finance.co", status: "pending" },
      { name: "Susan Park", email: "susan@finance.co", status: "pending" },
    ],
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    size: "3.1 MB",
    priority: "high",
    hasPassword: true,
    downloadCount: 1,
    viewCount: 3,
  },
  {
    id: "6",
    name: "Marketing Strategy Deck.pptx",
    type: "pptx",
    status: "active",
    recipients: [
      { name: "Amanda Torres", email: "amanda@marketing.io", status: "viewed" },
    ],
    sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    size: "5.2 MB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 2,
    viewCount: 6,
  },
  {
    id: "7",
    name: "Legal Compliance Report.pdf",
    type: "pdf",
    status: "expired",
    recipients: [
      { name: "Thomas Wright", email: "thomas@legal.com", status: "expired" },
    ],
    sentAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    size: "1.8 MB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 0,
    viewCount: 1,
  },
  {
    id: "8",
    name: "Employee Handbook 2026.pdf",
    type: "pdf",
    status: "active",
    recipients: [
      { name: "HR Team", email: "hr@company.com", status: "viewed" },
      { name: "Legal Review", email: "legal@company.com", status: "viewed" },
    ],
    sentAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    size: "2.9 MB",
    priority: "normal",
    hasPassword: true,
    downloadCount: 4,
    viewCount: 12,
  },
  {
    id: "9",
    name: "Investor Pitch Deck.pptx",
    type: "pptx",
    status: "active",
    recipients: [
      { name: "Venture Capital A", email: "vc@venturea.com", status: "viewed" },
      { name: "Angel Investor B", email: "angel@investorb.com", status: "pending" },
      { name: "PE Fund C", email: "pe@fundc.com", status: "pending" },
    ],
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    size: "8.4 MB",
    priority: "high",
    hasPassword: true,
    downloadCount: 1,
    viewCount: 4,
  },
  {
    id: "10",
    name: "Technical Architecture.pdf",
    type: "pdf",
    status: "viewed",
    recipients: [
      { name: "Dev Team Lead", email: "lead@devteam.io", status: "viewed" },
    ],
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    size: "4.1 MB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 3,
    viewCount: 8,
  },
  {
    id: "11",
    name: "Sales Pipeline Analysis.xlsx",
    type: "xlsx",
    status: "active",
    recipients: [
      { name: "Sales Director", email: "director@sales.co", status: "viewed" },
      { name: "Regional Manager", email: "regional@sales.co", status: "viewed" },
    ],
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    size: "1.5 MB",
    priority: "high",
    hasPassword: true,
    downloadCount: 5,
    viewCount: 15,
  },
  {
    id: "12",
    name: "Client Proposal - Tech Corp.docx",
    type: "docx",
    status: "pending",
    recipients: [
      { name: "Tech Corp CEO", email: "ceo@techcorp.com", status: "pending" },
      { name: "Tech Corp CFO", email: "cfo@techcorp.com", status: "pending" },
    ],
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    size: "980 KB",
    priority: "high",
    hasPassword: false,
    downloadCount: 0,
    viewCount: 0,
  },
  {
    id: "13",
    name: "Quarterly Review Slides.pptx",
    type: "pptx",
    status: "active",
    recipients: [
      { name: "Board Member 1", email: "board1@company.com", status: "viewed" },
      { name: "Board Member 2", email: "board2@company.com", status: "viewed" },
      { name: "Board Member 3", email: "board3@company.com", status: "viewed" },
      { name: "Board Member 4", email: "board4@company.com", status: "pending" },
      { name: "Board Member 5", email: "board5@company.com", status: "pending" },
    ],
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 8 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    size: "6.7 MB",
    priority: "high",
    hasPassword: true,
    downloadCount: 3,
    viewCount: 9,
  },
  {
    id: "14",
    name: "Vendor Agreement - Supplies Inc.pdf",
    type: "pdf",
    status: "expired",
    recipients: [
      { name: "Supplies Inc", email: "contracts@supplies.com", status: "expired" },
    ],
    sentAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    size: "1.3 MB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 1,
    viewCount: 2,
  },
  {
    id: "15",
    name: "Project Timeline.xlsx",
    type: "xlsx",
    status: "active",
    recipients: [
      { name: "Project Manager", email: "pm@project.io", status: "viewed" },
      { name: "Stakeholder A", email: "stakeholdera@client.com", status: "pending" },
    ],
    sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 18 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    size: "890 KB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 2,
    viewCount: 5,
  },
  {
    id: "16",
    name: "Security Audit Results.pdf",
    type: "pdf",
    status: "active",
    recipients: [
      { name: "Security Team", email: "security@company.com", status: "viewed" },
      { name: "IT Director", email: "it@company.com", status: "viewed" },
      { name: "Compliance Officer", email: "compliance@company.com", status: "viewed" },
    ],
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    size: "2.2 MB",
    priority: "high",
    hasPassword: true,
    downloadCount: 6,
    viewCount: 14,
  },
  {
    id: "17",
    name: "Brand Guidelines 2026.pdf",
    type: "pdf",
    status: "viewed",
    recipients: [
      { name: "Design Agency", email: "design@agency.co", status: "viewed" },
    ],
    sentAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    size: "12.5 MB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 4,
    viewCount: 7,
  },
  {
    id: "18",
    name: "Meeting Minutes - Strategy.docx",
    type: "docx",
    status: "active",
    recipients: [
      { name: "Executive Team", email: "exec@company.com", status: "viewed" },
    ],
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    size: "456 KB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 1,
    viewCount: 3,
  },
  {
    id: "19",
    name: "Insurance Policy Documents.pdf",
    type: "pdf",
    status: "active",
    recipients: [
      { name: "Insurance Broker", email: "broker@insurance.com", status: "pending" },
      { name: "Finance Team", email: "finance@company.com", status: "viewed" },
    ],
    sentAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    size: "3.4 MB",
    priority: "normal",
    hasPassword: true,
    downloadCount: 2,
    viewCount: 4,
  },
  {
    id: "20",
    name: "Customer Survey Results.xlsx",
    type: "xlsx",
    status: "active",
    recipients: [
      { name: "Product Team", email: "product@company.com", status: "viewed" },
      { name: "Marketing Lead", email: "marketing@company.com", status: "viewed" },
    ],
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    size: "1.1 MB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 3,
    viewCount: 8,
  },
  {
    id: "21",
    name: "Onboarding Materials.pdf",
    type: "pdf",
    status: "active",
    recipients: [
      { name: "New Hire 1", email: "newhire1@company.com", status: "viewed" },
      { name: "New Hire 2", email: "newhire2@company.com", status: "pending" },
      { name: "New Hire 3", email: "newhire3@company.com", status: "pending" },
    ],
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    size: "4.5 MB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 1,
    viewCount: 2,
  },
  {
    id: "22",
    name: "API Documentation v3.pdf",
    type: "pdf",
    status: "active",
    recipients: [
      { name: "Partner Dev Team", email: "dev@partner.io", status: "viewed" },
    ],
    sentAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    size: "2.8 MB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 5,
    viewCount: 11,
  },
  {
    id: "23",
    name: "Expense Report Q4.xlsx",
    type: "xlsx",
    status: "expired",
    recipients: [
      { name: "Finance Director", email: "finance@company.com", status: "expired" },
    ],
    sentAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    size: "780 KB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 1,
    viewCount: 2,
  },
  {
    id: "24",
    name: "Press Release Draft.docx",
    type: "docx",
    status: "pending",
    recipients: [
      { name: "PR Agency", email: "pr@agency.com", status: "pending" },
      { name: "Communications Lead", email: "comms@company.com", status: "pending" },
    ],
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    size: "320 KB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 0,
    viewCount: 0,
  },
  {
    id: "25",
    name: "Confidential Merger Documents.pdf",
    type: "pdf",
    status: "voided",
    recipients: [
      { name: "Legal Counsel", email: "legal@lawfirm.com", status: "pending" },
      { name: "CFO", email: "cfo@target.com", status: "viewed", openedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ],
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    size: "5.8 MB",
    priority: "high",
    hasPassword: true,
    downloadCount: 1,
    viewCount: 3,
    voidedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    voidReason: "Deal terms changed - new documents being prepared",
  },
  {
    id: "26",
    name: "Vendor Contract - Obsolete.pdf",
    type: "pdf",
    status: "voided",
    recipients: [
      { name: "Vendor Representative", email: "rep@vendor.com", status: "pending" },
    ],
    sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    size: "1.2 MB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 0,
    viewCount: 0,
    voidedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    voidReason: "Vendor partnership discontinued",
  },
  {
    id: "25",
    name: "Training Certification.pdf",
    type: "pdf",
    status: "active",
    recipients: [
      { name: "Training Participant", email: "trainee@company.com", status: "viewed" },
    ],
    sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    size: "1.9 MB",
    priority: "normal",
    hasPassword: true,
    downloadCount: 1,
    viewCount: 3,
  },
];

const mockSignItems: TrackItem[] = [
  {
    id: "s1",
    name: "Employment Contract - John Doe.pdf",
    type: "pdf",
    status: "pending",
    recipients: [
      { name: "John Doe", email: "john@employee.com", status: "pending" },
    ],
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    size: "1.1 MB",
    priority: "high",
    hasPassword: false,
    downloadCount: 0,
    viewCount: 1,
  },
  {
    id: "s2",
    name: "NDA Agreement - Vendor.pdf",
    type: "pdf",
    status: "signed",
    recipients: [
      { name: "Vendor Corp", email: "legal@vendor.com", status: "signed" },
    ],
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    size: "890 KB",
    priority: "normal",
    hasPassword: true,
    downloadCount: 2,
    viewCount: 3,
  },
  {
    id: "s3",
    name: "Service Agreement 2025.pdf",
    type: "pdf",
    status: "completed",
    recipients: [
      { name: "Client A", email: "client@company.com", status: "signed" },
      { name: "Client B", email: "clientb@company.com", status: "signed" },
    ],
    sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    size: "2.3 MB",
    priority: "normal",
    hasPassword: false,
    downloadCount: 4,
    viewCount: 8,
  },
];

const mockReceivedItems: TrackItem[] = [
  {
    id: "r1",
    name: "Proposal from Acme Corp.pdf",
    type: "pdf",
    status: "active",
    recipients: [{ name: "You", email: "you@company.com", status: "viewed" }],
    sender: { name: "Alex Johnson", email: "alex.johnson@acme.com" },
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    size: "3.2 MB",
    priority: "normal",
    hasPassword: true,
    downloadCount: 1,
    viewCount: 2,
  },
  {
    id: "r2",
    name: "Q1 Budget Report.xlsx",
    type: "xlsx",
    status: "active",
    recipients: [{ name: "You", email: "you@company.com", status: "viewed" }],
    sender: { name: "Alex Johnson", email: "alex.johnson@acme.com" },
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    size: "1.8 MB",
    priority: "high",
    hasPassword: false,
    downloadCount: 0,
    viewCount: 1,
  },
  {
    id: "r3",
    name: "Partnership Agreement Draft.pdf",
    type: "pdf",
    status: "expired",
    recipients: [{ name: "You", email: "you@company.com", status: "expired" }],
    sender: { name: "Alex Johnson", email: "alex.johnson@acme.com" },
    sentAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    size: "2.4 MB",
    priority: "normal",
    hasPassword: true,
    downloadCount: 0,
    viewCount: 2,
  },
  {
    id: "r4",
    name: "Client Presentation Deck.pptx",
    type: "pptx",
    status: "active",
    recipients: [{ name: "You", email: "you@company.com", status: "pending" }],
    sender: { name: "Alex Johnson", email: "alex.johnson@acme.com" },
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    size: "8.5 MB",
    priority: "high",
    hasPassword: false,
    downloadCount: 0,
    viewCount: 0,
  },
];

export const mockContracts: Contract[] = [
  {
    id: "c1",
    name: "Master Service Agreement",
    company: "Acme Corporation",
    status: "active",
    startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000),
    renewalType: "auto",
    tags: ["Vendor", "Services"],
    parties: [
      { name: "Acme Corporation", role: "Vendor", email: "contracts@acme.com" },
      { name: "Your Company", role: "Client", email: "legal@yourcompany.com" },
    ],
    signedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    reminders: [
      { days: 90, enabled: true },
      { days: 60, enabled: true },
      { days: 30, enabled: true },
    ],
    value: "$120,000/year",
  },
  {
    id: "c2",
    name: "Software License Agreement",
    company: "TechVendor Inc",
    status: "expiring",
    startDate: new Date(Date.now() - 340 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    renewalType: "manual",
    tags: ["Software", "License"],
    parties: [
      { name: "TechVendor Inc", role: "Licensor", email: "licensing@techvendor.com" },
      { name: "Your Company", role: "Licensee", email: "it@yourcompany.com" },
    ],
    signedDate: new Date(Date.now() - 340 * 24 * 60 * 60 * 1000),
    reminders: [
      { days: 90, enabled: true },
      { days: 60, enabled: true },
      { days: 30, enabled: true },
    ],
    value: "$45,000/year",
  },
  {
    id: "c3",
    name: "Logistics Partnership",
    company: "DHL Express",
    status: "expiring",
    startDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    renewalType: "manual",
    tags: ["Logistics", "Partnership"],
    parties: [
      { name: "DHL Express", role: "Carrier", email: "partnerships@dhl.com" },
      { name: "Your Company", role: "Shipper", email: "ops@yourcompany.com" },
    ],
    signedDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000),
    reminders: [
      { days: 90, enabled: true },
      { days: 60, enabled: true },
      { days: 30, enabled: true },
    ],
    value: "$280,000/year",
  },
  {
    id: "c4",
    name: "Office Lease Agreement",
    company: "Premium Properties LLC",
    status: "active",
    startDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000),
    renewalType: "unknown",
    tags: ["Real Estate", "Lease"],
    parties: [
      { name: "Premium Properties LLC", role: "Landlord", email: "leasing@premiumprops.com" },
      { name: "Your Company", role: "Tenant", email: "facilities@yourcompany.com" },
    ],
    signedDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
    reminders: [
      { days: 90, enabled: true },
      { days: 60, enabled: false },
      { days: 30, enabled: false },
    ],
    value: "$18,000/month",
  },
  {
    id: "c5",
    name: "NDA - Project Phoenix",
    company: "SecureTech Partners",
    status: "expired",
    startDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    renewalType: "manual",
    tags: ["Legal", "NDA"],
    parties: [
      { name: "SecureTech Partners", role: "Partner", email: "legal@securetech.com" },
      { name: "Your Company", role: "Partner", email: "legal@yourcompany.com" },
    ],
    signedDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
    reminders: [
      { days: 90, enabled: true },
      { days: 60, enabled: true },
      { days: 30, enabled: true },
    ],
  },
  {
    id: "c6",
    name: "Cloud Infrastructure SLA",
    company: "CloudScale AWS",
    status: "active",
    startDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 165 * 24 * 60 * 60 * 1000),
    renewalType: "auto",
    tags: ["Cloud", "Infrastructure"],
    parties: [
      { name: "CloudScale AWS", role: "Provider", email: "enterprise@cloudscale.com" },
      { name: "Your Company", role: "Customer", email: "devops@yourcompany.com" },
    ],
    signedDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    reminders: [
      { days: 90, enabled: true },
      { days: 60, enabled: true },
      { days: 30, enabled: true },
    ],
    value: "$8,500/month",
  },
];

export default function Track() {
  const location = useLocation();
  
  // Read navigation state to restore tabs when coming back from signing flow
  const initialMainTab = (location.state as { activeTab?: MainTab })?.activeTab || "transfer";
  const initialSignSubTab = (location.state as { subTab?: SignViewTab })?.subTab || "sent";
  
  const [mainTab, setMainTab] = useState<MainTab>(initialMainTab);
  const [transferSubTab, setTransferSubTab] = useState<TransferSubTab>("sent");
  const [signSubTab, setSignSubTab] = useState<SignViewTab>(initialSignSubTab);
  const [selectedItem, setSelectedItem] = useState<TrackItem | null>(null);
  const [selectedSignItem, setSelectedSignItem] = useState<SignItem | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddContract, setShowAddContract] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [transferItems, setTransferItems] = useState<TrackItem[]>(mockTransferItems);
  const [showRecipientNoPassword, setShowRecipientNoPassword] = useState(false);
  const [showRecipientPasswordProtected, setShowRecipientPasswordProtected] = useState(false);

  // Update tabs when location state changes (e.g., when navigating back)
  useEffect(() => {
    const state = location.state as { activeTab?: MainTab; subTab?: SignViewTab } | null;
    if (state?.activeTab) {
      setMainTab(state.activeTab);
    }
    if (state?.subTab) {
      setSignSubTab(state.subTab);
    }
  }, [location.state]);

  const handleUpdateItem = (updatedItem: TrackItem) => {
    setTransferItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setSelectedItem(updatedItem);
  };
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);

  const getCurrentItems = (): TrackItem[] => {
    if (mainTab === "transfer") {
      return transferSubTab === "sent" ? transferItems : mockReceivedItems;
    }
    // For sign tab, return empty - we'll use SignList component instead
    return [];
  };

  const filteredItems = getCurrentItems().filter(item => {
    // Search filter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipients.some(r => r.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Date range filter
    const matchesDate = !dateRange || isWithinInterval(item.sentAt, { start: dateRange.from, end: dateRange.to });
    
    return matchesSearch && matchesDate;
  });

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Date range filter for contracts (by start date)
    const matchesDate = !dateRange || isWithinInterval(contract.startDate, { start: dateRange.from, end: dateRange.to });
    
    return matchesSearch && matchesDate;
  });

  // Pagination calculations
  const totalItems = mainTab === "contracts" ? filteredContracts.length : filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const paginatedItems = filteredItems.slice(startIndex, endIndex);
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  // Reset page when filters/tabs change
  useEffect(() => {
    setCurrentPage(1);
  }, [mainTab, transferSubTab, searchQuery, dateRange]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    } else if (e.key === "ArrowRight" && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleAddContract = (newContract: Contract) => {
    setContracts(prev => [newContract, ...prev]);
    setShowAddContract(false);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <AppLayout>
      <motion.div 
        className="min-h-screen bg-background"
      >
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8">
          <TrackHeader
            mainTab={mainTab}
            setMainTab={(tab) => {
              setMainTab(tab);
              setSelectedItem(null);
              setSelectedSignItem(null);
              setSelectedContract(null);
            }}
            transferSubTab={transferSubTab}
            setTransferSubTab={setTransferSubTab}
            signSubTab={signSubTab}
            setSignSubTab={setSignSubTab}
            totalItems={mainTab === "sign" ? signMockItems.length : mainTab === "contracts" ? filteredContracts.length : filteredItems.length}
            onAddContract={() => setShowAddContract(true)}
          />
          
          {mainTab === "contracts" && (
            <ContractsSummary contracts={contracts} />
          )}

          {/* Hide TrackFilters for Sign tab - it has built-in filters */}
          {mainTab !== "sign" && (
            <TrackFilters 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isContracts={mainTab === "contracts"}
              isTransferSent={mainTab === "transfer" && transferSubTab === "sent"}
              isTransferReceived={mainTab === "transfer" && transferSubTab === "received"}
              isSign={false}
              onDateRangeChange={setDateRange}
            />
          )}

          <div className="flex gap-6 items-start">
            <motion.div 
              className="flex-1 min-w-0"
              animate={{ width: (selectedItem || selectedContract || selectedSignItem) ? "60%" : "100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {mainTab === "contracts" ? (
                <ContractsList
                  contracts={paginatedContracts}
                  selectedContract={selectedContract}
                  onSelectContract={setSelectedContract}
                />
              ) : mainTab === "sign" ? (
                <SignListRedesign
                  items={signMockItems}
                  selectedItem={selectedSignItem}
                  onSelectItem={setSelectedSignItem}
                  activeTab={signSubTab}
                />
              ) : (
                <>
                  <TrackList
                    items={paginatedItems}
                    selectedItem={selectedItem}
                    onSelectItem={setSelectedItem}
                    mainTab={mainTab}
                    subTab={transferSubTab}
                    emptyState={
                      dateRange
                        ? {
                            title: "No transfers found for this date range.",
                            description: "Try adjusting the date range or clearing the filter.",
                          }
                        : undefined
                    }
                  />
                  
                  {/* Reference-only section for Transfer Received */}
                  {mainTab === "transfer" && transferSubTab === "received" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-12 pt-8 border-t border-border/30"
                    >
                      <div className="bg-muted/20 border border-border/40 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Transfer Recipient Flow (Reference Only)
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          The buttons below are for reference only to illustrate the intended transfer recipient user journey. These are not part of the Track interface and should not be included in production within this section.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                            size="lg"
                            className="flex-1 h-12 text-base"
                            onClick={() => setShowRecipientNoPassword(true)}
                          >
                            Recipient – No Password Protection
                          </Button>
                          <Button
                            size="lg"
                            className="flex-1 h-12 text-base"
                            onClick={() => setShowRecipientPasswordProtected(true)}
                          >
                            Recipient – Password Protected
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* Pagination Controls - only for transfer and contracts */}
              {mainTab !== "sign" && totalPages > 1 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between mt-6 pt-4 border-t border-border/50"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rows per page:</span>
                    <Select 
                      value={itemsPerPage.toString()} 
                      onValueChange={(v) => {
                        setItemsPerPage(Number(v));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px] h-8 bg-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      disabled={currentPage === 1}
                      className="h-8 px-2 hover:bg-muted hover:text-foreground"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="ml-1">Previous</span>
                    </Button>

                    <div className="flex items-center gap-1 mx-2">
                      {getPageNumbers().map((page, i) => (
                        typeof page === "number" ? (
                          <Button
                            key={i}
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`h-8 w-8 p-0 hover:bg-muted hover:text-foreground ${currentPage === page ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : ""}`}
                          >
                            {page}
                          </Button>
                        ) : (
                          <span key={i} className="px-1 text-muted-foreground">...</span>
                        )
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 px-2 hover:bg-muted hover:text-foreground"
                    >
                      <span className="mr-1">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <AnimatePresence>
              {/* Transfer Detail Panel */}
              {selectedItem && mainTab === "transfer" && (
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="w-[40%] min-w-[400px]"
                >
                  {transferSubTab === "received" ? (
                    <ReceivedDetailPanel
                      key={selectedItem.id}
                      item={selectedItem}
                      onClose={() => setSelectedItem(null)}
                    />
                  ) : (
                    <TrackDetailPanel
                      key={selectedItem.id}
                      item={selectedItem}
                      onClose={() => setSelectedItem(null)}
                      mainTab={mainTab}
                      onUpdate={handleUpdateItem}
                    />
                  )}
                </motion.div>
              )}
              {/* Sign Detail Panel */}
              {selectedSignItem && mainTab === "sign" && (
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="w-[40%] min-w-[400px]"
                >
                  <SignDetailPanelRedesign
                    item={selectedSignItem}
                    onClose={() => setSelectedSignItem(null)}
                    onSign={() => {
                      // Handle sign action
                    }}
                    onDecline={() => {
                      // Handle decline action
                    }}
                  />
                </motion.div>
              )}
              {/* Contract Detail Panel */}
              {selectedContract && mainTab === "contracts" && (
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="w-[40%] min-w-[400px]"
                >
                  <ContractDetailPanel
                    contract={selectedContract}
                    onClose={() => setSelectedContract(null)}
                    onUpdate={(updated) => {
                      setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
                      setSelectedContract(updated);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <AddContractModal
        open={showAddContract}
        onOpenChange={setShowAddContract}
        onAdd={handleAddContract}
      />

      {/* Recipient Transfer View - No Password Protection */}
      <AnimatePresence>
        {showRecipientNoPassword && (
          <RecipientTransferView onClose={() => setShowRecipientNoPassword(false)} />
        )}
      </AnimatePresence>

      {/* Recipient Transfer View - Password Protected */}
      <AnimatePresence>
        {showRecipientPasswordProtected && (
          <RecipientPasswordProtectedView onClose={() => setShowRecipientPasswordProtected(false)} />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
