import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, ZoomIn, ZoomOut, Highlighter, GitBranch, Send, X, AtSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { 
  CollaborationMode, UserRole, Annotation, ThreadedComment, 
  Suggestion, Collaborator, canPerformAction 
} from "./types";

interface DocumentCanvasProps {
  fileName: string;
  fileType: string;
  pageCount: number;
  zoom: number;
  currentPage: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  collaborationMode: CollaborationMode;
  userRole: UserRole;
  annotations: Annotation[];
  comments: ThreadedComment[];
  suggestions: Suggestion[];
  collaborators: Collaborator[];
  activeAnnotationType: string | null;
  annotationColor: string;
  selectedFont: string;
  onAddComment: (selection: { text: string; paragraphId: string }, content: string, mentions: string[]) => void;
  onAddAnnotation: (annotation: Annotation) => void;
  onCommentMarkerClick: (commentId: string) => void;
  onAddSuggestion?: (paragraphId: string, originalText: string, suggestedText: string) => void;
  onContentChange?: () => void;
}

// Editable paragraph content
const initialParagraphs = [
  { id: "p1", text: "Executive Summary: This document outlines the strategic initiatives for Q1 2026, focusing on key growth areas and operational improvements." },
  { id: "p2", text: "Our primary objective is to expand market presence while maintaining operational efficiency. The following sections detail specific action items and responsible parties." },
  { id: "p3", text: "Key Performance Indicators will be tracked monthly, with quarterly reviews to assess progress against established benchmarks." },
  { id: "p4", text: "Budget allocation has been optimized to prioritize high-impact initiatives while ensuring adequate reserves for contingencies." },
  { id: "p5", text: "Team collaboration and cross-functional alignment remain critical success factors for achieving our goals." },
  { id: "p6", text: "The implementation timeline spans 12 weeks, with key milestones at weeks 4, 8, and 12 for progress evaluation." },
  { id: "p7", text: "Resource requirements include dedicated project management support, technical infrastructure upgrades, and stakeholder training programs." },
];

export const DocumentCanvas = ({
  fileName,
  fileType,
  pageCount,
  zoom,
  currentPage,
  onZoomIn,
  onZoomOut,
  collaborationMode,
  userRole,
  annotations,
  comments,
  suggestions,
  collaborators,
  activeAnnotationType,
  annotationColor,
  selectedFont,
  onAddComment,
  onAddAnnotation,
  onCommentMarkerClick,
  onAddSuggestion,
  onContentChange,
}: DocumentCanvasProps) => {
  const [paragraphs, setParagraphs] = useState(initialParagraphs);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [hoveredParagraph, setHoveredParagraph] = useState<string | null>(null);
  const [editingParagraph, setEditingParagraph] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<string>("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = useCallback(() => {
    if (collaborationMode === "edit") return;
    
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString());
      const range = selection.getRangeAt(0);
      setSelectionRect(range.getBoundingClientRect());
    } else if (!showCommentInput) {
      setSelectedText(null);
      setSelectionRect(null);
    }
  }, [collaborationMode, showCommentInput]);

  const handleOpenCommentInput = () => {
    setShowCommentInput(true);
    setCommentText("");
    setSelectedMentions([]);
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const handleCloseCommentInput = () => {
    setShowCommentInput(false);
    setCommentText("");
    setSelectedMentions([]);
    setSelectedText(null);
    setSelectionRect(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleSubmitComment = () => {
    if (selectedText && hoveredParagraph && commentText.trim()) {
      onAddComment(
        { text: selectedText, paragraphId: hoveredParagraph },
        commentText.trim(),
        selectedMentions
      );
      handleCloseCommentInput();
    }
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
    if (e.key === "Escape") {
      handleCloseCommentInput();
    }
    if (e.key === "@") {
      setShowMentionDropdown(true);
      setMentionFilter("");
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCommentText(value);
    
    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      const spaceIndex = textAfterAt.indexOf(" ");
      if (spaceIndex === -1) {
        setMentionFilter(textAfterAt.toLowerCase());
        setShowMentionDropdown(true);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  const handleSelectMention = (collaborator: Collaborator) => {
    const lastAtIndex = commentText.lastIndexOf("@");
    const newText = commentText.slice(0, lastAtIndex) + `@${collaborator.name} `;
    setCommentText(newText);
    setSelectedMentions(prev => [...prev, collaborator.id]);
    setShowMentionDropdown(false);
    commentInputRef.current?.focus();
  };

  const filteredCollaborators = collaborators.filter(c => 
    c.id !== "1" && c.name.toLowerCase().includes(mentionFilter)
  );

  const handleAddHighlight = () => {
    if (selectedText && hoveredParagraph) {
      const annotation: Annotation = {
        id: `ann-${Date.now()}`,
        type: "highlight",
        color: annotationColor,
        selection: {
          id: `sel-${Date.now()}`,
          text: selectedText,
          startOffset: 0,
          endOffset: selectedText.length,
          paragraphId: hoveredParagraph,
        },
      };
      onAddAnnotation(annotation);
      toast({ title: "Highlight added" });
      setSelectedText(null);
      setSelectionRect(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleSuggestEdit = () => {
    if (selectedText && hoveredParagraph && onAddSuggestion) {
      const suggestedText = prompt("Enter your suggested replacement text:", selectedText);
      if (suggestedText && suggestedText !== selectedText) {
        onAddSuggestion(hoveredParagraph, selectedText, suggestedText);
        toast({ title: "Suggestion added", description: "Your edit has been submitted for review" });
      }
      setSelectedText(null);
      setSelectionRect(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleParagraphClick = (paragraphId: string, text: string) => {
    if (collaborationMode === "edit") {
      setEditingParagraph(paragraphId);
      setEditBuffer(text);
    }
  };

  const handleParagraphBlur = (paragraphId: string) => {
    if (editingParagraph === paragraphId && editBuffer !== paragraphs.find(p => p.id === paragraphId)?.text) {
      setParagraphs(prev => prev.map(p => 
        p.id === paragraphId ? { ...p, text: editBuffer } : p
      ));
      onContentChange?.();
    }
    setEditingParagraph(null);
    setEditBuffer("");
  };

  const getCommentsForParagraph = (paragraphId: string) => {
    return comments.filter(c => c.selection?.paragraphId === paragraphId);
  };

  const getSuggestionsForParagraph = (paragraphId: string) => {
    return suggestions.filter(s => s.selection.paragraphId === paragraphId && s.status === "pending");
  };

  const getAnnotationsForParagraph = (paragraphId: string) => {
    return annotations.filter(a => a.selection?.paragraphId === paragraphId);
  };

  const activeCollaborators = collaborators.filter(c => c.isOnline && c.id !== "1");

  const getModeColor = () => {
    switch (collaborationMode) {
      case "edit": return "text-primary";
      case "comment": return "text-blue-400";
      case "annotate": return "text-amber-400";
      case "suggest": return "text-purple-400";
      default: return "text-white/60";
    }
  };

  return (
    <div className="h-full overflow-auto p-8" ref={canvasRef}>
      <div className="flex flex-col items-center gap-8 pb-8">
        {/* Floating controls */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-zinc-800/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-xl border border-white/10">
          <button 
            onClick={onZoomOut}
            disabled={zoom <= 50}
            className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          <span className="text-xs text-white/80 font-medium min-w-[40px] text-center">
            {zoom}%
          </span>
          <button 
            onClick={onZoomIn}
            disabled={zoom >= 200}
            className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          
          <Separator orientation="vertical" className="h-4 bg-white/20" />
          
          <span className="text-xs text-white/60">
            Page {currentPage} / {pageCount}
          </span>

          <Separator orientation="vertical" className="h-4 bg-white/20" />
          
          <span className={cn("text-xs font-medium capitalize", getModeColor())}>
            {collaborationMode}
          </span>
        </div>

        {/* Selection bubble with comment input */}
        <AnimatePresence>
          {selectedText && selectionRect && collaborationMode !== "view" && collaborationMode !== "edit" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "fixed z-50 bg-zinc-800 rounded-lg shadow-xl border border-white/20",
                showCommentInput ? "p-3 w-80" : "p-1 flex items-center gap-0.5"
              )}
              style={{
                top: selectionRect.top - (showCommentInput ? 180 : 50) + window.scrollY,
                left: Math.max(20, selectionRect.left + (selectionRect.width / 2) - (showCommentInput ? 160 : 70)),
              }}
            >
              {!showCommentInput ? (
                <>
                  {/* Quick action buttons */}
                  {(collaborationMode === "comment" || collaborationMode === "annotate" || collaborationMode === "suggest") && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleOpenCommentInput}
                          className="p-2 hover:bg-white/10 rounded-md transition-colors"
                        >
                          <MessageSquarePlus className="w-4 h-4 text-blue-400" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Add comment</TooltipContent>
                    </Tooltip>
                  )}

                  {collaborationMode === "annotate" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleAddHighlight}
                          className="p-2 hover:bg-white/10 rounded-md transition-colors"
                        >
                          <Highlighter className="w-4 h-4 text-amber-400" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Add highlight</TooltipContent>
                    </Tooltip>
                  )}

                  {collaborationMode === "suggest" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleSuggestEdit}
                          className="p-2 hover:bg-white/10 rounded-md transition-colors"
                        >
                          <GitBranch className="w-4 h-4 text-purple-400" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Suggest edit</TooltipContent>
                    </Tooltip>
                  )}
                </>
              ) : (
                /* Comment input form */
                <div className="space-y-2">
                  {/* Selected text preview */}
                  <div className="bg-white/5 rounded px-2 py-1.5 border-l-2 border-blue-400">
                    <p className="text-[10px] text-white/50 mb-0.5">Commenting on:</p>
                    <p className="text-xs text-white/80 line-clamp-2">"{selectedText}"</p>
                  </div>

                  {/* Comment textarea */}
                  <div className="relative">
                    <textarea
                      ref={commentInputRef}
                      value={commentText}
                      onChange={handleCommentChange}
                      onKeyDown={handleCommentKeyDown}
                      placeholder="Add a comment... Type @ to mention someone"
                      className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                    
                    {/* @ mention hint */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-white/30">
                      <AtSign className="w-3 h-3" />
                      <span>to mention</span>
                    </div>

                    {/* Mention dropdown */}
                    <AnimatePresence>
                      {showMentionDropdown && filteredCollaborators.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute bottom-full left-0 mb-1 w-full bg-zinc-700 rounded-md border border-white/10 shadow-lg overflow-hidden"
                        >
                          <div className="p-1.5">
                            <p className="text-[10px] text-white/50 px-2 mb-1">Mention someone</p>
                            {filteredCollaborators.map((collab) => (
                              <button
                                key={collab.id}
                                onClick={() => handleSelectMention(collab)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 transition-colors"
                              >
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold"
                                  style={{ backgroundColor: collab.cursorColor + "30", color: collab.cursorColor }}
                                >
                                  {collab.avatar}
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="text-xs text-white font-medium">{collab.name}</p>
                                  <p className="text-[10px] text-white/50">{collab.email}</p>
                                </div>
                                {collab.isOnline && (
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mentioned users pills */}
                  {selectedMentions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedMentions.map((mentionId) => {
                        const collab = collaborators.find(c => c.id === mentionId);
                        if (!collab) return null;
                        return (
                          <span 
                            key={mentionId}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ backgroundColor: collab.cursorColor + "20", color: collab.cursorColor }}
                          >
                            @{collab.name}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleCloseCommentInput}
                      className="text-xs text-white/50 hover:text-white/70"
                    >
                      Cancel
                    </button>
                    <Button
                      size="sm"
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim()}
                      className="h-7 px-3 text-xs gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      Comment
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document pages */}
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
          <div 
            key={pageNum}
            className={cn(
              "bg-white shadow-2xl transition-all origin-top shrink-0 relative",
              collaborationMode === "edit" && "ring-1 ring-primary/30"
            )}
            style={{ 
              transform: `scale(${zoom / 100})`,
              width: '816px',
              minHeight: '1056px',
              fontFamily: selectedFont,
            }}
          >
            {/* Subtle collaborator cursors */}
            {pageNum === 1 && activeCollaborators.map((collab, idx) => (
              <motion.div 
                key={collab.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                className="absolute z-10 pointer-events-none"
                style={{ 
                  top: 120 + (idx * 80), 
                  left: 180 + (idx * 120),
                }}
              >
                <div className="relative">
                  <svg 
                    width="10" 
                    height="14" 
                    viewBox="0 0 12 16" 
                    fill={collab.cursorColor}
                    className="drop-shadow-sm"
                  >
                    <path d="M0 0L12 12L6 12L0 16V0Z" />
                  </svg>
                  <span 
                    className="absolute top-3 left-2 text-[9px] font-medium px-1.5 py-0.5 rounded text-white whitespace-nowrap opacity-90"
                    style={{ backgroundColor: collab.cursorColor }}
                  >
                    {collab.name}
                  </span>
                </div>
              </motion.div>
            ))}

            <div className="p-12 space-y-5" onMouseUp={handleTextSelection}>
              {/* Document title */}
              <div className="text-center mb-10 pb-6 border-b border-zinc-200">
                <h1 className="text-2xl font-semibold text-zinc-900 mb-1">{fileName}</h1>
                <p className="text-xs text-zinc-400">Page {pageNum} of {pageCount}</p>
              </div>
              
              {/* Editable paragraphs */}
              {paragraphs.map((paragraph) => {
                const paragraphComments = getCommentsForParagraph(paragraph.id);
                const paragraphSuggestions = getSuggestionsForParagraph(paragraph.id);
                const paragraphAnnotations = getAnnotationsForParagraph(paragraph.id);
                const hasUnresolvedComments = paragraphComments.some(c => !c.resolved);
                const hasPendingSuggestions = paragraphSuggestions.length > 0;
                const hasHighlights = paragraphAnnotations.some(a => a.type === "highlight");
                const isEditing = editingParagraph === paragraph.id;

                return (
                  <div
                    key={paragraph.id}
                    className={cn(
                      "relative group transition-colors rounded-sm -mx-2 px-2",
                      collaborationMode === "edit" && hoveredParagraph === paragraph.id && !isEditing && "bg-zinc-50",
                    )}
                    onMouseEnter={() => setHoveredParagraph(paragraph.id)}
                    onMouseLeave={() => setHoveredParagraph(null)}
                  >
                    {/* Subtle inline comment markers */}
                    {paragraphComments.length > 0 && (
                      <div className="absolute -right-6 top-0.5 flex flex-col gap-0.5">
                        {paragraphComments.slice(0, 2).map((comment) => (
                          <button
                            key={comment.id}
                            onClick={() => onCommentMarkerClick(comment.id)}
                            className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center text-[8px] transition-all hover:scale-110",
                              comment.resolved 
                                ? "bg-zinc-200 text-zinc-500"
                                : "bg-blue-100 text-blue-600"
                            )}
                          >
                            💬
                          </button>
                        ))}
                        {paragraphComments.length > 2 && (
                          <span className="text-[8px] text-zinc-400 text-center">
                            +{paragraphComments.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Suggestion indicator */}
                    {hasPendingSuggestions && (
                      <div className="absolute -left-5 top-0.5">
                        <div className="w-3 h-3 rounded-full bg-purple-500/80 animate-pulse" />
                      </div>
                    )}

                    {/* Editable text content */}
                    {isEditing ? (
                      <textarea
                        value={editBuffer}
                        onChange={(e) => setEditBuffer(e.target.value)}
                        onBlur={() => handleParagraphBlur(paragraph.id)}
                        autoFocus
                        className={cn(
                          "w-full text-sm text-zinc-800 leading-relaxed resize-none bg-white border border-primary/30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20",
                        )}
                        style={{ minHeight: '60px' }}
                      />
                    ) : (
                      <p
                        onClick={() => handleParagraphClick(paragraph.id, paragraph.text)}
                        className={cn(
                          "text-sm text-zinc-800 leading-relaxed transition-all",
                          collaborationMode === "edit" && "cursor-text hover:bg-zinc-50",
                          collaborationMode !== "view" && collaborationMode !== "edit" && "cursor-text select-text",
                          hasHighlights && "bg-amber-100/50",
                          hasPendingSuggestions && "border-l-2 border-purple-400 pl-3 -ml-3",
                          hasUnresolvedComments && !hasPendingSuggestions && "border-l-2 border-blue-300 pl-3 -ml-3"
                        )}
                      >
                        {paragraph.text}
                      </p>
                    )}

                    {/* Inline suggestion preview */}
                    {hasPendingSuggestions && paragraphSuggestions[0] && (
                      <div className="mt-1 ml-3 flex items-center gap-2 text-[10px]">
                        <span className="text-purple-500 font-medium">Suggestion:</span>
                        <span className="text-red-500 line-through">{paragraphSuggestions[0].originalText}</span>
                        <span className="text-zinc-400">→</span>
                        <span className="text-green-600">{paragraphSuggestions[0].suggestedText}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Additional content sections */}
              {pageNum === 1 && (
                <div className="mt-8 pt-6 border-t border-zinc-100">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-4">Implementation Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-zinc-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-zinc-700 mb-2">Phase 1: Planning</h4>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        Initial assessment and resource allocation for core infrastructure.
                      </p>
                    </div>
                    <div className="bg-zinc-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-zinc-700 mb-2">Phase 2: Execution</h4>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        Implementation of key initiatives with stakeholder coordination.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {pageNum === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-zinc-800">Financial Overview</h3>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200">
                        <th className="text-left py-2 text-zinc-600 font-medium">Category</th>
                        <th className="text-right py-2 text-zinc-600 font-medium">Q1 Budget</th>
                        <th className="text-right py-2 text-zinc-600 font-medium">Allocated</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-zinc-100">
                        <td className="py-2 text-zinc-800">Infrastructure</td>
                        <td className="py-2 text-right text-zinc-600">$250,000</td>
                        <td className="py-2 text-right text-zinc-600">$180,000</td>
                      </tr>
                      <tr className="border-b border-zinc-100">
                        <td className="py-2 text-zinc-800">Personnel</td>
                        <td className="py-2 text-right text-zinc-600">$450,000</td>
                        <td className="py-2 text-right text-zinc-600">$420,000</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-zinc-800">Marketing</td>
                        <td className="py-2 text-right text-zinc-600">$150,000</td>
                        <td className="py-2 text-right text-zinc-600">$95,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Subtle annotation layer */}
            {annotations.filter(a => a.type === "rectangle" && a.position).map((annotation) => (
              <div
                key={annotation.id}
                className="absolute pointer-events-none opacity-60"
                style={{
                  left: annotation.position?.x || 0,
                  top: annotation.position?.y || 0,
                  width: annotation.position?.width || 100,
                  height: annotation.position?.height || 50,
                  border: `1.5px solid ${annotation.color}`,
                  backgroundColor: `${annotation.color}10`,
                  borderRadius: '2px',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
