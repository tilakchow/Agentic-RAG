import React from "react"
import { History, MessageSquare, Trash2, ArrowRight, Plus } from "lucide-react"
import { MessageItem } from "../ChatMessage"

export interface SavedThread {
  threadId: string
  title: string
  preview: string
  updatedAt: string
  messageCount: number
  messages: MessageItem[]
}

interface HistoryViewProps {
  currentThreadId: string
  threads: SavedThread[]
  onResumeThread: (thread: SavedThread) => void
  onDeleteThread: (threadId: string) => void
  onClearAll: () => void
  onNewChat: () => void
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  currentThreadId,
  threads,
  onResumeThread,
  onDeleteThread,
  onClearAll,
  onNewChat,
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-4xl mx-auto w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <History className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Conversation History
            </h2>
            <p className="text-xs text-slate-500">
              Browse, resume, or manage past Agentic-RAG conversation sessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {threads.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium cursor-pointer transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Threads List */}
      {threads.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No saved sessions yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once you chat with the assistant, your conversation threads and LangGraph memory will appear here.
          </p>
          <button
            onClick={onNewChat}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Start a Conversation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((t) => {
            const isCurrent = t.threadId === currentThreadId
            return (
              <div
                key={t.threadId}
                className={`p-4 rounded-xl border bg-white shadow-2xs transition-all flex items-center justify-between gap-4 group ${
                  isCurrent
                    ? "border-blue-400 ring-1 ring-blue-400/20"
                    : "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/40"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {t.title || "Untitled Session"}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10px] font-medium font-mono">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {t.preview || "No messages"}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-mono">
                      <span>thread: {t.threadId.slice(0, 8)}...</span>
                      <span>•</span>
                      <span>{t.messageCount} messages</span>
                      <span>•</span>
                      <span>{t.updatedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onResumeThread(t)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>Resume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteThread(t.threadId)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
