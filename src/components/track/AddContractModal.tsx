import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Upload, FileText, Building2, Calendar, Users, Tag, 
  RefreshCw, Bell, Plus, Trash2
} from "lucide-react";
import { Contract } from "@/pages/Track";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AddContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (contract: Contract) => void;
}

const availableTags = [
  "Vendor", "Services", "Software", "License", "Logistics", 
  "Partnership", "Real Estate", "Lease", "Legal", "NDA", 
  "Cloud", "Infrastructure", "Client", "Supplier"
];

export function AddContractModal({ open, onOpenChange, onAdd }: AddContractModalProps) {
  const [step, setStep] = useState<"upload" | "details">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [renewalType, setRenewalType] = useState<"auto" | "manual" | "unknown">("manual");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [parties, setParties] = useState<{ name: string; role: string; email: string }[]>([
    { name: "", role: "", email: "" }
  ]);
  const [reminders, setReminders] = useState([
    { days: 90, enabled: true },
    { days: 60, enabled: true },
    { days: 30, enabled: true },
  ]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setName(droppedFile.name.replace(/\.[^/.]+$/, ""));
      setStep("details");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      setStep("details");
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addParty = () => {
    setParties([...parties, { name: "", role: "", email: "" }]);
  };

  const removeParty = (index: number) => {
    setParties(parties.filter((_, i) => i !== index));
  };

  const updateParty = (index: number, field: string, value: string) => {
    setParties(parties.map((party, i) => 
      i === index ? { ...party, [field]: value } : party
    ));
  };

  const handleSubmit = () => {
    if (!name || !company || !startDate || !expiryDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newContract: Contract = {
      id: `c-${Date.now()}`,
      name,
      company,
      status: "active",
      startDate: new Date(startDate),
      expiryDate: new Date(expiryDate),
      renewalType,
      tags: selectedTags,
      parties: parties.filter(p => p.name && p.email),
      signedDate: new Date(),
      reminders,
    };

    onAdd(newContract);
    toast.success("Contract added successfully");
    resetForm();
  };

  const resetForm = () => {
    setStep("upload");
    setFile(null);
    setName("");
    setCompany("");
    setStartDate("");
    setExpiryDate("");
    setRenewalType("manual");
    setSelectedTags([]);
    setParties([{ name: "", role: "", email: "" }]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Add Contract
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-4"
            >
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-foreground font-medium mb-1">
                  Drop your contract here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse (PDF, DOC, DOCX)
                </p>
              </div>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep("details")}
              >
                Enter details manually
              </Button>
            </motion.div>
          )}

          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 py-4"
            >
              {file && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium flex-1 truncate">{file.name}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFile(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Contract Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Master Service Agreement"
                    className="mt-1.5"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="company">Company / Counterparty *</Label>
                  <div className="relative mt-1.5">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <div className="relative mt-1.5">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <div className="relative mt-1.5">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="expiryDate"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Renewal Type */}
              <div>
                <Label>Renewal Type</Label>
                <Select value={renewalType} onValueChange={(v: any) => setRenewalType(v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-renewal</SelectItem>
                    <SelectItem value="manual">Manual renewal</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <Label className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer transition-all"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Parties */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Parties
                  </Label>
                  <Button variant="ghost" size="sm" onClick={addParty} className="h-7 gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {parties.map((party, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Input
                        placeholder="Name"
                        value={party.name}
                        onChange={(e) => updateParty(index, "name", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Role"
                        value={party.role}
                        onChange={(e) => updateParty(index, "role", e.target.value)}
                        className="w-28"
                      />
                      <Input
                        placeholder="Email"
                        value={party.email}
                        onChange={(e) => updateParty(index, "email", e.target.value)}
                        className="flex-1"
                      />
                      {parties.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => removeParty(index)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reminders */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4" />
                  Reminders
                </Label>
                <div className="space-y-2">
                  {reminders.map((reminder, index) => (
                    <div
                      key={reminder.days}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                    >
                      <span className="text-sm">{reminder.days} days before expiry</span>
                      <Switch
                        checked={reminder.enabled}
                        onCheckedChange={(checked) => {
                          setReminders(reminders.map((r, i) => 
                            i === index ? { ...r, enabled: checked } : r
                          ));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep("upload")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  Add Contract
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
