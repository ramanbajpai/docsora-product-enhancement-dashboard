import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, GitBranch, Sparkles, History, X, 
  Check, Reply, MoreHorizontal, ChevronDown, ChevronRight,
  Wand2, FileText, Lightbulb, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { 
  ThreadedComment, Suggestion, VersionHistoryItem, 
  UserRole, CollaborationMode, canPerformAction 
} from "./types";

type RailTab = "comments" | "suggestions" | "ai" | "history";

interface CollaborationRailProps {
  isOpen: boolean;
  activeTab: RailTab;
  onTabChange: (tab: RailTab) => void;
  onClose: () => void;
  comments: ThreadedComment[];
  suggestions: Suggestion[];
  versions: VersionHistoryItem[];
  userRole: UserRole;
  currentMode: CollaborationMode;
  onResolveComment: (id: string) => void;
  onAcceptSuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
  onAIAction: (action: string) => void;
}

const tabs: { id: RailTab; icon: typeof MessageSquare; label: string }[] = [
  { id: "comments", icon: MessageSquare, label: "Comments" },
  { id: "suggestions", icon: GitBranch, label: "Suggestions" },
  { id: "ai", icon: Sparkles, label: "AI Assist" },
  { id: "history", icon: History, label: "History" },
];

export const CollaborationRail = ({
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  comments,
  suggestions,
  versions,
  userRole,
  currentMode,
  onResolveComment,
  onAcceptSuggestion,
  onRejectSuggestion,
  onAIAction,
}: CollaborationRailProps) => {
  const [expandedComment, setExpandedComment] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  const unresolvedCount = comments.filter(c => !c.resolved).length;
  const pendingSuggestions = suggestions.filter(s => s.status === "pending").length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed right-0 top-12 bottom-0 bg-zinc-900 border-l border-white/10 overflow-hidden z-20 flex flex-col"
        >
          {/* Tab bar */}
          <div className="shrink-0 flex items-center justify-between border-b border-white/10">
            <div className="flex">
              {tabs.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors relative",
                    activeTab === id 
                      ? "text-white" 
                      : "text-white/50 hover:text-white/70"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{label}</span>
                  {id === "comments" && unresolvedCount > 0 && (
                    <Badge className="h-4 px-1 text-[9px] bg-primary">
                      {unresolvedCount}
                    </Badge>
                  )}
                  {id === "suggestions" && pendingSuggestions > 0 && (
                    <Badge className="h-4 px-1 text-[9px] bg-amber-500">
                      {pendingSuggestions}
                    </Badge>
                  )}
                  {activeTab === id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div className="p-3 space-y-3">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-white/40 text-xs">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No comments yet</p>
                    <p className="text-[10px] mt-1">Select text to add a comment</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className={cn(
                        "rounded-lg overflow-hidden transition-colors",
                        comment.resolved ? "bg-white/5" : "bg-white/8"
                      )}
                    >
                      {/* Comment highlight indicator */}
                      {comment.selection && (
                        <div 
                          className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 cursor-pointer hover:bg-amber-500/15"
                          onClick={() => toast({ title: "Navigate", description: "Jumping to selection..." })}
                        >
                          <p className="text-[10px] text-amber-400/80 line-clamp-1">
                            "{comment.selection.text}"
                          </p>
                        </div>
                      )}
                      
                      <div className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                            {comment.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-white">{comment.author}</span>
                                <span className="text-[10px] text-white/40">{comment.timestamp}</span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-3.5 h-3.5 text-white/50" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onResolveComment(comment.id)}>
                                    <Check className="w-3.5 h-3.5 mr-2" />
                                    {comment.resolved ? "Unresolve" : "Resolve"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-xs text-white/70 mt-1">{comment.content}</p>
                            
                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-3 space-y-2 pl-3 border-l border-white/10">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-semibold text-white/70 shrink-0">
                                      {reply.avatar}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-medium text-white/80">{reply.author}</span>
                                        <span className="text-[9px] text-white/40">{reply.timestamp}</span>
                                      </div>
                                      <p className="text-[10px] text-white/60">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply input */}
                            {expandedComment === comment.id ? (
                              <div className="mt-2 flex gap-2">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Reply..."
                                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                                  autoFocus
                                />
                                <Button 
                                  size="sm" 
                                  className="h-6 px-2 text-[10px]"
                                  onClick={() => {
                                    toast({ title: "Reply sent" });
                                    setReplyText("");
                                    setExpandedComment(null);
                                  }}
                                >
                                  Send
                                </Button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setExpandedComment(comment.id)}
                                className="mt-2 flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60"
                              >
                                <Reply className="w-3 h-3" />
                                Reply
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {comment.resolved && (
                        <div className="px-3 py-1.5 bg-emerald-500/10 border-t border-emerald-500/20">
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Resolved
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === "suggestions" && (
              <div className="p-3 space-y-3">
                {suggestions.length === 0 ? (
                  <div className="text-center py-8 text-white/40 text-xs">
                    <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No suggestions yet</p>
                    <p className="text-[10px] mt-1">Use Suggest mode to propose edits</p>
                  </div>
                ) : (
                  suggestions.map((suggestion) => (
                    <div 
                      key={suggestion.id}
                      className="bg-white/8 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[9px] font-semibold text-amber-400 shrink-0">
                          {suggestion.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white">{suggestion.author}</span>
                            <span className="text-[10px] text-white/40">{suggestion.timestamp}</span>
                          </div>
                        </div>
                        <Badge 
                          className={cn(
                            "text-[9px] h-4",
                            suggestion.status === "pending" && "bg-amber-500/20 text-amber-400",
                            suggestion.status === "accepted" && "bg-emerald-500/20 text-emerald-400",
                            suggestion.status === "rejected" && "bg-red-500/20 text-red-400"
                          )}
                        >
                          {suggestion.status}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-start gap-2">
                          <span className="text-[9px] text-red-400 shrink-0 mt-0.5">−</span>
                          <p className="text-[11px] text-red-400/80 line-through">{suggestion.originalText}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[9px] text-emerald-400 shrink-0 mt-0.5">+</span>
                          <p className="text-[11px] text-emerald-400/80">{suggestion.suggestedText}</p>
                        </div>
                      </div>

                      {suggestion.status === "pending" && canPerformAction(userRole, currentMode, "edit") && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            onClick={() => onAcceptSuggestion(suggestion.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => onRejectSuggestion(suggestion.id)}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* AI Assist Tab */}
            {activeTab === "ai" && (
              <div className="p-3 space-y-4">
                <div className="text-xs text-white/60 mb-4">
                  AI-powered tools to enhance your collaboration
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => onAIAction("summarize_comments")}
                    className="w-full flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Summarize Comments</p>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        Get an AI summary of all unresolved comments and discussions
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => onAIAction("suggest_from_comments")}
                    className="w-full flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Suggest from Comments</p>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        Generate edit suggestions based on comment feedback
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => onAIAction("rewrite_selection")}
                    className="w-full flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Wand2 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Rewrite Selection</p>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        Select text and let AI improve clarity, tone, or style
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => onAIAction("explain_changes")}
                    className="w-full flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Explain Changes</p>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        Get a clear explanation of recent document changes
                      </p>
                    </div>
                  </button>
                </div>

                <Separator className="bg-white/10" />

                <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg p-3 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-white">AI Summary</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    Select text in the document or choose an action above to get AI assistance.
                  </p>
                </div>
              </div>
            )}

            {/* Version History Tab */}
            {activeTab === "history" && (
              <div className="p-3 space-y-1">
                {versions.map((version, index) => (
                  <button
                    key={version.id}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group"
                    onClick={() => toast({ title: "Version preview", description: `Viewing version from ${version.timestamp}` })}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      index === 0 ? "bg-primary" : "bg-white/30"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80">{version.timestamp}</p>
                      <p className="text-[10px] text-white/50 mt-0.5">{version.author}</p>
                      <p className="text-[10px] text-white/40 mt-1 line-clamp-2">{version.changes}</p>
                    </div>
                    {index === 0 && (
                      <Badge className="text-[9px] h-4 bg-primary/20 text-primary shrink-0">
                        Current
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Bottom action bar for comments */}
          {activeTab === "comments" && (
            <div className="shrink-0 p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button 
                  size="sm" 
                  className="h-8"
                  disabled={!newCommentText.trim()}
                  onClick={() => {
                    toast({ title: "Comment added" });
                    setNewCommentText("");
                  }}
                >
                  Post
                </Button>
              </div>
              <p className="text-[10px] text-white/40 mt-2">
                💡 Tip: Select text in the document to comment on specific sections
              </p>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
