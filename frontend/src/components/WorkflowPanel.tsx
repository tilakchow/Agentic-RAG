import React from "react"
import { Layers, X, CheckCircle2, Circle, Loader2 } from "lucide-react"

export interface WorkflowPanelProps {
  activeNode?: string
  visitedNodes?: string[]
  onClose: () => void
  className?: string
}

interface WorkflowStep {
  id: number
  title: string
  defaultSubtitle: string
  activeSubtitle: string
  completedSubtitle: string
  nodes: string[]
}

const STEPS: WorkflowStep[] = [
  {
    id: 1,
    title: "Route question",
    defaultSubtitle: "Classifying inquiry",
    activeSubtitle: "Analyzing intent...",
    completedSubtitle: "Routed successfully",
    nodes: ["route_question"],
  },
  {
    id: 2,
    title: "Retrieve private KB",
    defaultSubtitle: "Pinecone index",
    activeSubtitle: "Retrieving chunks...",
    completedSubtitle: "4 chunks retrieved",
    nodes: ["retrieve_kb"],
  },
  {
    id: 3,
    title: "Grade evidence",
    defaultSubtitle: "Relevance check",
    activeSubtitle: "Grading evidence...",
    completedSubtitle: "High relevance",
    nodes: ["grade_kb_evidence"],
  },
  {
    id: 4,
    title: "Web fallback if weak",
    defaultSubtitle: "Tavily web search",
    activeSubtitle: "Searching web...",
    completedSubtitle: "Fallback evaluated",
    nodes: ["search_web", "grade_web_evidence"],
  },
  {
    id: 5,
    title: "Rewrite & retry",
    defaultSubtitle: "Self-correcting query",
    activeSubtitle: "Refining query...",
    completedSubtitle: "Query optimized",
    nodes: ["rewrite_query"],
  },
  {
    id: 6,
    title: "Generate answer",
    defaultSubtitle: "Grounded response",
    activeSubtitle: "Synthesizing answer...",
    completedSubtitle: "Completed",
    nodes: ["generate_from_kb", "generate_from_web", "direct_answer", "answer_insufficient"],
  },
]

export const WorkflowPanel: React.FC<WorkflowPanelProps> = ({
  activeNode,
  visitedNodes = [],
  onClose,
  className = "",
}) => {
  return (
    <div
      className={`w-72 shrink-0 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col select-none ${className}`}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold tracking-tight text-slate-900">
            Agent Workflow
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close Workflow Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Steps List matching reference design */}
      <div className="space-y-4">
        {STEPS.map((step) => {
          const isActive = activeNode ? step.nodes.includes(activeNode) : false
          const isVisited = step.nodes.some((n) => visitedNodes.includes(n))

          // Subtitle text calculation
          let subtitle = step.defaultSubtitle
          if (isActive) {
            subtitle = step.activeSubtitle
          } else if (isVisited) {
            subtitle = step.completedSubtitle
          }

          return (
            <div key={step.id} className="flex items-start gap-3 group">
              {/* Status Icon */}
              <div className="mt-0.5 shrink-0">
                {isActive ? (
                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center animate-spin">
                    <Loader2 className="w-2.5 h-2.5 text-blue-600" />
                  </div>
                ) : isVisited ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 stroke-[1.5]" />
                )}
              </div>

              {/* Text: Title + Subtitle */}
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-xs font-semibold leading-tight ${
                    isActive
                      ? "text-blue-600"
                      : isVisited
                      ? "text-slate-900"
                      : "text-slate-700"
                  }`}
                >
                  {step.title}
                </span>
                <span
                  className={`text-[11px] leading-tight mt-0.5 ${
                    isActive
                      ? "text-blue-500 font-medium"
                      : isVisited
                      ? "text-emerald-600/90 font-medium"
                      : "text-slate-400"
                  }`}
                >
                  {subtitle}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
