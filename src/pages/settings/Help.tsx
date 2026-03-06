import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  FileText,
  Shield,
  Users,
  Zap,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    id: "1",
    question: "How do I add team members to my workspace?",
    answer: "Go to Workspace & Team in your settings. Click 'Invite member', enter their email address, select a role, and send the invitation. They'll receive an email to join your workspace.",
  },
  {
    id: "2",
    question: "What document formats are supported?",
    answer: "Docsora supports PDF, Word (DOCX, DOC), Excel (XLSX, XLS), PowerPoint (PPTX, PPT), and image files (PNG, JPG, TIFF). We can convert between these formats as needed.",
  },
  {
    id: "3",
    question: "How secure are my documents?",
    answer: "All documents are encrypted at rest using AES-256 encryption and in transit using TLS 1.3. We're SOC 2 Type II certified and comply with GDPR. You can also enable additional security features like 2FA and audit logging.",
  },
  {
    id: "4",
    question: "Can I use e-signatures for legally binding documents?",
    answer: "Yes, Docsora's e-signatures are legally binding under ESIGN, UETA, and eIDAS regulations. Each signature includes a complete audit trail with timestamps, IP addresses, and identity verification.",
  },
  {
    id: "5",
    question: "How do I upgrade my plan?",
    answer: "Go to Billing & Subscription in your settings. You'll see available plans and can upgrade with one click. Changes take effect immediately, and you'll be charged a prorated amount.",
  },
  {
    id: "6",
    question: "What happens when I reach my storage limit?",
    answer: "You'll receive a notification when you're approaching your limit. Once reached, you can either delete files, upgrade your plan, or purchase additional storage.",
  },
];

const guides = [
  { id: "1", title: "Getting started with Docsora", icon: Zap, category: "Basics" },
  { id: "2", title: "Setting up your team workspace", icon: Users, category: "Teams" },
  { id: "3", title: "Document signing workflow", icon: FileText, category: "Signing" },
  { id: "4", title: "Security best practices", icon: Shield, category: "Security" },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = () => {
    // Simulate sending
    setMessageSent(true);
    setTimeout(() => {
      setContactOpen(false);
      setContactSubject("");
      setContactMessage("");
      setMessageSent(false);
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-foreground">Help & Support</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Find answers, browse guides, or contact our support team
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button 
              onClick={() => setContactOpen(true)}
              className="flex flex-col items-center gap-2 p-5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Contact support</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Book className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">Documentation</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors relative">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">Live chat</span>
              <span className="absolute top-3 right-3 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Soon
              </span>
            </button>
          </div>

          {/* Guides */}
          <div className="mb-8">
            <h2 className="text-base font-medium text-foreground mb-4">Popular guides</h2>
            <div className="grid grid-cols-2 gap-3">
              {guides.map((guide) => (
                <button
                  key={guide.id}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <guide.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{guide.title}</p>
                    <p className="text-xs text-muted-foreground">{guide.category}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 ml-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-4">
              Frequently asked questions
            </h2>
            {filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="border border-border rounded-lg px-4 data-[state=open]:bg-muted/30"
                  >
                    <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No results found for "{searchQuery}"
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Support Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact support</DialogTitle>
            <DialogDescription>
              Send us a message and we'll get back to you within 24 hours
            </DialogDescription>
          </DialogHeader>
          {messageSent ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm font-medium text-foreground">Message sent!</p>
              <p className="text-sm text-muted-foreground mt-1">
                We'll respond to your inquiry shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue or question..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="resize-none"
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setContactOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleContactSubmit}
                  disabled={!contactSubject || !contactMessage}
                >
                  Send message
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
