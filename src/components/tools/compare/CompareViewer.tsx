import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, Sparkles, X, ChevronDown, AlertTriangle, DollarSign, Scale, FileCheck } from "lucide-react";
import { DocumentPanel } from "./DocumentPanel";
import { Difference } from "./types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CompareSuccess } from "./CompareSuccess";

interface CompareViewerProps {
  files: File[];
  onBack: () => void;
}

// Mock differences data - in production this would come from actual document comparison
const MOCK_DIFFERENCES: Difference[] = [
  { id: 'diff-1', type: 'changed', page: 1, section: '2.3', textA: 'Payment terms: Net 30 days', textB: 'Payment terms: Net 45 days', position: { x: 0, y: 60 } },
  { id: 'diff-2', type: 'changed', page: 1, section: '4.1', textA: 'Liability cap: $50,000', textB: 'Liability cap: $100,000', position: { x: 0, y: 150 } },
  { id: 'diff-3', type: 'added', page: 2, section: '5.2', textA: '', textB: 'New confidentiality clause added with 5-year term', position: { x: 0, y: 30 } },
  { id: 'diff-4', type: 'removed', page: 2, section: '6.1', textA: 'Previous arbitration terms removed', textB: '', position: { x: 0, y: 90 } },
  { id: 'diff-5', type: 'changed', page: 3, section: '8.1', textA: 'Base rate: $150/hour', textB: 'Base rate: $175/hour', position: { x: 0, y: 60 } },
];

// AI Summary data grouped by section
const AI_SUMMARY_SECTIONS = [
  {
    id: 'section-1',
    title: 'Page 1 – Commercial Terms',
    icon: DollarSign,
    items: [
      {
        diffId: 'diff-1',
        summary: 'Payment terms extended from 30 to 45 days',
        impact: 'Affects cash flow timing. Extended terms benefit the payer but delay revenue collection.',
        category: 'pricing' as const,
      },
      {
        diffId: 'diff-2',
        summary: 'Liability cap doubled to $100,000',
        impact: 'Significant increase in potential exposure. Legal review recommended before acceptance.',
        category: 'risk' as const,
      },
    ],
  },
  {
    id: 'section-2',
    title: 'Page 2 – Legal Provisions',
    icon: Scale,
    items: [
      {
        diffId: 'diff-3',
        summary: 'New 5-year confidentiality clause added',
        impact: 'Creates long-term obligation restricting information sharing. Consider operational implications.',
        category: 'legal' as const,
      },
      {
        diffId: 'diff-4',
        summary: 'Arbitration terms removed',
        impact: 'Disputes may now require standard litigation. Potentially longer and more expensive resolution process.',
        category: 'legal' as const,
      },
    ],
  },
  {
    id: 'section-3',
    title: 'Page 3 – Pricing',
    icon: DollarSign,
    items: [
      {
        diffId: 'diff-5',
        summary: 'Base rate increased 16.7% to $175/hour',
        impact: 'Direct cost increase. Calculate total budget impact based on projected hours.',
        category: 'pricing' as const,
      },
    ],
  },
];

export function CompareViewer({ files, onBack }: CompareViewerProps) {
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showAISummary, setShowAISummary] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(AI_SUMMARY_SECTIONS.map(s => s.id));
  const [showSuccess, setShowSuccess] = useState(false);

  const differences = MOCK_DIFFERENCES;
  const currentDiff = differences[currentDiffIndex] || null;

  const handlePreviousDiff = useCallback(() => {
    setCurrentDiffIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextDiff = useCallback(() => {
    setCurrentDiffIndex((prev) => Math.min(differences.length - 1, prev + 1));
  }, [differences.length]);

  const handleScroll = useCallback((position: number) => {
    setScrollPosition(position);
  }, []);

  const handleDiffSelect = useCallback((diff: Difference) => {
    const index = differences.findIndex(d => d.id === diff.id);
    if (index !== -1) {
      setCurrentDiffIndex(index);
    }
  }, [differences]);

  const navigateToDiff = useCallback((diffId: string) => {
    const index = differences.findIndex(d => d.id === diffId);
    if (index !== -1) {
      setCurrentDiffIndex(index);
    }
  }, [differences]);

  const handleGenerateSummary = useCallback(() => {
    setShowSuccess(true);
  }, []);

  const handleReset = useCallback(() => {
    setShowSuccess(false);
    onBack();
  }, [onBack]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Show success page when summary is generated
  if (showSuccess) {
    return <CompareSuccess files={files} onReset={handleReset} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top Bar - Clean Apple-style */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-background/95 backdrop-blur-sm"
      >
        {/* Left: Subtle back button */}
        <button 
          onClick={onBack} 
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Center: Navigation - Minimal chevrons with difference counter */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={handlePreviousDiff}
            disabled={currentDiffIndex <= 0}
            className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous difference"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-muted-foreground">
            Difference <span className="text-foreground font-medium">{currentDiffIndex + 1}</span> of {differences.length}
          </span>
          
          <button
            onClick={handleNextDiff}
            disabled={currentDiffIndex >= differences.length - 1}
            className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next difference"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: AI Summary toggle + Primary CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAISummary(!showAISummary)} 
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md transition-colors ${
              showAISummary 
                ? 'text-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Summary
          </button>
          <Button 
            onClick={handleGenerateSummary} 
            size="sm" 
            className="h-8 gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            Generate Summary Report
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Panels Container */}
        <motion.div 
          className="flex-1 flex overflow-hidden"
          animate={{ width: showAISummary ? 'calc(100% - 340px)' : '100%' }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          {/* Document A */}
          <div className="flex-1 border-r border-border/20">
            <DocumentPanel
              label="A"
              fileName={files[0]?.name || "Document A"}
              variant="a"
              differences={differences.filter(d => d.type === 'removed' || d.type === 'changed')}
              currentDiffId={currentDiff?.id || null}
              scrollPosition={scrollPosition}
              onScroll={handleScroll}
              onDiffSelect={handleDiffSelect}
            />
          </div>

          {/* Document B */}
          <div className="flex-1">
            <DocumentPanel
              label="B"
              fileName={files[1]?.name || "Document B"}
              variant="b"
              differences={differences.filter(d => d.type === 'added' || d.type === 'changed')}
              currentDiffId={currentDiff?.id || null}
              scrollPosition={scrollPosition}
              onScroll={handleScroll}
              onDiffSelect={handleDiffSelect}
            />
          </div>
        </motion.div>

        {/* AI Summary Panel - Slides in from right, doesn't overlap */}
        <AnimatePresence>
          {showAISummary && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="border-l border-border/20 bg-background flex flex-col overflow-hidden"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">AI Summary</span>
                </div>
                <button 
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors" 
                  onClick={() => setShowAISummary(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Panel Content - Scrollable independently */}
              <div className="flex-1 overflow-y-auto glassmorphic-scrollbar p-4 space-y-1">
                {AI_SUMMARY_SECTIONS.map((section, sectionIndex) => (
                  <Collapsible 
                    key={section.id}
                    open={expandedSections.includes(section.id)}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    {/* Section Header */}
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between py-2.5 group">
                        <div className="flex items-center gap-2">
                          <section.icon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {section.title}
                          </span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/50 transition-transform ${
                          expandedSections.includes(section.id) ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </CollapsibleTrigger>

                    {/* Section Items */}
                    <CollapsibleContent>
                      <div className="space-y-2 pb-3">
                        {section.items.map((item) => {
                          const CategoryIcon = item.category === 'risk' ? AlertTriangle : 
                                               item.category === 'legal' ? Scale : 
                                               item.category === 'pricing' ? DollarSign : FileCheck;
                          
                          return (
                            <button
                              key={item.diffId}
                              onClick={() => navigateToDiff(item.diffId)}
                              className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${
                                currentDiff?.id === item.diffId 
                                  ? 'border-primary/20 bg-primary/5' 
                                  : 'border-transparent bg-muted/30 hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-start gap-2 mb-1.5">
                                <CategoryIcon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                                  item.category === 'risk' ? 'text-amber-500/70' :
                                  item.category === 'legal' ? 'text-primary/70' :
                                  'text-muted-foreground'
                                }`} />
                                <span className="text-sm text-foreground leading-tight">
                                  {item.summary}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                                {item.impact}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleContent>

                    {/* Soft divider between sections */}
                    {sectionIndex < AI_SUMMARY_SECTIONS.length - 1 && (
                      <div className="border-t border-border/10" />
                    )}
                  </Collapsible>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}