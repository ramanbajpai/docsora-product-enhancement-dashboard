import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { AddSeatsModal } from "@/components/settings/AddSeatsModal";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CreditCard, 
  Download, 
  Check, 
  ArrowUpRight,
  Users,
  Calendar,
  Zap,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
}

const invoices: Invoice[] = [
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "$29.00", status: "Paid" },
  { id: "INV-2025-012", date: "Dec 1, 2025", amount: "$29.00", status: "Paid" },
  { id: "INV-2025-011", date: "Nov 1, 2025", amount: "$29.00", status: "Paid" },
  { id: "INV-2025-010", date: "Oct 1, 2025", amount: "$29.00", status: "Paid" },
  { id: "INV-2025-009", date: "Sep 1, 2025", amount: "$29.00", status: "Paid" },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: ["5 documents/month", "1 user", "Basic support"],
    current: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: ["Unlimited documents", "5 users", "Priority support", "Advanced features"],
    current: true,
  },
  {
    name: "Teams",
    price: "$49",
    period: "/month",
    features: ["Everything in Pro", "25 users", "Admin controls", "Team analytics"],
    current: false,
  },
];

export default function Billing() {
  const location = useLocation();
  const seatsRef = useRef<HTMLDivElement>(null);
  const [manageSubOpen, setManageSubOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [addSeatsOpen, setAddSeatsOpen] = useState(false);

  // Handle anchor navigation from Workspace page
  useEffect(() => {
    if (location.hash === "#seats" && seatsRef.current) {
      setTimeout(() => {
        seatsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        seatsRef.current?.classList.add("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background");
        setTimeout(() => {
          seatsRef.current?.classList.remove("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background");
        }, 2000);
      }, 100);
    }
  }, [location.hash]);

  const getStatusBadge = (status: Invoice["status"]) => {
    const styles = {
      Paid: "bg-success/10 text-success border-success/20",
      Pending: "bg-warning/10 text-warning border-warning/20",
      Failed: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", styles[status])}>
        {status}
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-foreground">Billing & Subscription</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your plan, payment methods, and billing history
            </p>
          </div>

          {/* Current Plan Card */}
          <div className="bg-card border border-primary/20 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">Pro Plan</h2>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      Current
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">$29/month • Billed monthly</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setManageSubOpen(true)}>
                Manage subscription
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Renewal date</p>
                  <p className="text-sm font-medium text-foreground">Feb 1, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment method</p>
                  <p className="text-sm font-medium text-foreground">•••• 4242</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Capacity / Growth Card */}
          <div 
            ref={seatsRef}
            className={cn(
              "bg-card border border-primary/30 rounded-lg p-6 mt-6 transition-all duration-300",
              "shadow-[0_0_20px_-5px_hsl(var(--primary)/0.15)]",
              "hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.25)] hover:border-primary/50"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Team Capacity</h3>
                    <p className="text-xs text-muted-foreground">Grow your workspace</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Add more team members to Docsora and collaborate together in one secure workspace.
                </p>

                <div className="flex items-baseline gap-4">
                  <div>
                    <span className="text-2xl font-semibold text-foreground">4</span>
                    <span className="text-sm text-muted-foreground ml-1">of 5 seats in use</span>
                  </div>
                  <span className="text-sm font-medium text-amber-500 dark:text-amber-400">
                    1 seat remaining
                  </span>
                </div>
              </div>

              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-6 shadow-md hover:shadow-lg transition-all"
                onClick={() => setAddSeatsOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
                Add seats
              </Button>
            </div>
          </div>

          {/* Plan Options */}
          <div className="mt-6 mb-6">
            <h2 className="text-base font-medium text-foreground mb-4">Available plans</h2>
            <div className="grid grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "border rounded-lg p-5 transition-colors flex flex-col",
                    plan.current 
                      ? "border-primary/30 bg-primary/[0.02]" 
                      : "border-border bg-card hover:border-border/80"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-medium text-foreground">{plan.name}</h3>
                    {plan.current && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-semibold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-muted-foreground/50" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5">
                    {!plan.current ? (
                      <Button 
                        variant={plan.name === "Free" ? "outline" : "default"} 
                        size="sm" 
                        className="w-full"
                      >
                        {plan.name === "Free" ? "Downgrade" : "Upgrade"}
                        <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    ) : (
                      <div className="h-9" /> 
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise Section */}
          <div className="mb-8 border border-border rounded-lg p-5 bg-card flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Enterprise</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                For teams that need custom limits, enterprise security, and dedicated support.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              Contact sales
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-foreground">Payment methods</h2>
              <Button variant="outline" size="sm">
                Add payment method
              </Button>
            </div>
            <div className="border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-muted rounded flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/2027</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                  Default
                </span>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted">Edit</Button>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-4">Billing history</h2>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-medium">Invoice</TableHead>
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="font-medium">Amount</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{invoice.date}</TableCell>
                      <TableCell className="text-sm font-medium">{invoice.amount}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Subscription Dialog */}
      <Dialog open={manageSubOpen} onOpenChange={setManageSubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage subscription</DialogTitle>
            <DialogDescription>
              Choose how you'd like to manage your Pro plan subscription
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Button variant="outline" className="w-full justify-start h-auto py-3">
              <div className="text-left">
                <p className="font-medium">Change plan</p>
                <p className="text-xs text-muted-foreground">Upgrade or downgrade your subscription</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-auto py-3">
              <div className="text-left">
                <p className="font-medium">Update payment method</p>
                <p className="text-xs text-muted-foreground">Change your default payment card</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-auto py-3">
              <div className="text-left">
                <p className="font-medium">Change billing cycle</p>
                <p className="text-xs text-muted-foreground">Switch between monthly and annual billing</p>
              </div>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-auto py-3 text-destructive hover:text-destructive hover:bg-destructive/5"
              onClick={() => {
                setManageSubOpen(false);
                setConfirmCancel(true);
              }}
            >
              <div className="text-left">
                <p className="font-medium">Cancel subscription</p>
                <p className="text-xs opacity-70">Your plan will remain active until Feb 1, 2026</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel subscription?</DialogTitle>
            <DialogDescription>
              Your Pro plan will remain active until February 1, 2026. After that, you'll be downgraded to the Free plan and lose access to:
            </DialogDescription>
          </DialogHeader>
          <ul className="py-4 space-y-2">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
              Unlimited document processing
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
              Team collaboration features
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
              Priority support
            </li>
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)}>
              Keep subscription
            </Button>
            <Button variant="destructive" onClick={() => setConfirmCancel(false)}>
              Cancel subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddSeatsModal 
        open={addSeatsOpen} 
        onOpenChange={setAddSeatsOpen}
        currentSeats={5}
        seatsUsed={4}
        planName="Pro"
        billingCycle="monthly"
        renewalDate="Feb 1, 2026"
        pricePerSeat={12}
      />
    </AppLayout>
  );
}
