import React from "react"
import { MessageSquare, Search, Copy, Check, GitFork, Plus } from "lucide-react"

interface HeaderProps {
  threadId: string
  backendOnline: boolean
  showWorkflow: boolean
  onToggleWorkflow: () => void
  onNewChat: () => void
  onSearchClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  threadId,
  backendOnline,
  showWorkflow,
  onToggleWorkflow,
  onNewChat,
  onSearchClick,
}) => {
  const [copied, setCopied] = React.useState(false)

  const copyThreadId = () => {
    navigator.clipboard.writeText(threadId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="sticky top-0 z-20 w-full h-14 border-b border-slate-200/90 bg-white/95 backdrop-blur-xs flex items-center justify-between px-4 select-none">
      {/* Left: Brand & Status */}
      <div className="flex items-center gap-3">
        {/* App Logo */}
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
          <MessageSquare className="w-4 h-4 fill-current text-white" />
        </div>

        {/* Title */}
        <span className="font-semibold text-sm tracking-tight text-slate-900">
          Agentic-RAG Support
        </span>

        {/* Backend Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-[11px] font-medium text-slate-600">
          <span
            className={`w-2 h-2 rounded-full ${
              backendOnline ? "bg-emerald-500 ring-2 ring-emerald-100" : "bg-amber-500"
            }`}
          />
          <span>{backendOnline ? "FastAPI Connected" : "FastAPI Offline"}</span>
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Search button */}
        <button
          onClick={onSearchClick}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          title="Search conversation"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Thread ID pill */}
        <div
          onClick={copyThreadId}
          title="Click to copy Session Thread ID"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 cursor-pointer hover:bg-slate-100/80 transition-colors"
        >
          <span className="text-slate-400">thread :</span>
          <span>{threadId.slice(0, 10)}...</span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>

        {/* Workflow Toggle Button */}
        <button
          onClick={onToggleWorkflow}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            showWorkflow
              ? "bg-slate-100 border-slate-300 text-slate-900"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          title="Toggle LangGraph Agent Workflow"
        >
          <GitFork className="w-3.5 h-3.5 text-slate-600" />
          <span>Workflow</span>
        </button>

        {/* + New Chat Button (Vibrant Blue) */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>
    </header>
  )
}
