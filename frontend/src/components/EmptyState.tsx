import React from "react"
import { ShieldCheck, Database, Globe, History, ArrowUpRight } from "lucide-react"

interface EmptyStateProps {
  onSelectQuery: (query: string) => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectQuery }) => {
  const suggestions = [
    {
      title: "Check Order Cancellation",
      query: "I ordered a laptop yesterday and I want to cancel it. Can I get a full refund?",
      source: "KB Route",
    },
    {
      title: "Technical or Account Support",
      query: "How do I update my billing details or reset my password?",
      source: "KB Route",
    },
    {
      title: "Real-time Web Search Fallback",
      query: "What are the latest updates or release notes for Python 3.14?",
      source: "Web Search",
    },
    {
      title: "Conversational Small Talk",
      query: "Hi there! What kind of questions can you help me with?",
      source: "Direct",
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center my-auto px-4 py-8 max-w-2xl mx-auto text-center">
      <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-4 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-zinc-100" />
      </div>

      <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
        Agentic-RAG Assistant
      </h2>
      <p className="mt-1.5 text-xs text-zinc-500 max-w-md leading-relaxed">
        Autonomous router querying your private Pinecone knowledge base, grading evidence quality, and falling back to real-time web retrieval.
      </p>

      {/* Capabilities Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-[11px] text-zinc-600 font-medium">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200">
          <Database className="w-3 h-3 text-zinc-700" />
          Pinecone Index
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200">
          <Globe className="w-3 h-3 text-zinc-700" />
          Tavily Search
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200">
          <History className="w-3 h-3 text-zinc-700" />
          Session Memory
        </span>
      </div>

      {/* Suggested prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-8 w-full text-left">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuery(item.query)}
            className="group flex flex-col justify-between p-3 rounded-lg border border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/50 transition-all text-left cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-medium text-zinc-900 group-hover:text-black">
                {item.title}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
              "{item.query}"
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
