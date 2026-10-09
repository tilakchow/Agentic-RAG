import React from "react"
import { Layers } from "lucide-react"

export interface WorkflowCardProps {
  activeNode?: string
  visitedNodes?: string[]
  className?: string
}

interface StepItem {
  id: number
  label: string
  nodes: string[]
}

const STEPS: StepItem[] = [
  { id: 1, label: "Route question", nodes: ["route_question"] },
  { id: 2, label: "Retrieve private KB", nodes: ["retrieve_kb"] },
  { id: 3, label: "Grade evidence", nodes: ["grade_kb_evidence"] },
  { id: 4, label: "Web fallback if weak", nodes: ["search_web", "grade_web_evidence"] },
  { id: 5, label: "Rewrite & retry", nodes: ["rewrite_query"] },
  { id: 6, label: "Grounded answer", nodes: ["generate_from_kb", "generate_from_web", "direct_answer", "answer_insufficient"] },
]

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  activeNode,
  visitedNodes = [],
  className = "",
}) => {
  const isStepActive = (step: StepItem) => {
    return activeNode ? step.nodes.includes(activeNode) : false
  }

  const isStepVisited = (step: StepItem) => {
    return step.nodes.some((node) => visitedNodes.includes(node))
  }

  return (
    <div
      className={`w-64 shrink-0 rounded-2xl border border-slate-800/80 bg-[#0d1117] p-5 shadow-xl text-slate-100 select-none ${className}`}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          LangGraph Workflow
        </h3>
        {activeNode && (
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        )}
      </div>

      {/* Step list with vertical connecting line matching reference picture */}
      <div className="relative pl-3 space-y-4">
        {/* Continuous vertical timeline border */}
        <div className="absolute left-3 top-2 bottom-3 w-[1.5px] bg-slate-700/60" />

        {STEPS.map((step) => {
          const active = isStepActive(step)
          const visited = isStepVisited(step)

          return (
            <div key={step.id} className="relative flex items-center pl-4 group">
              {/* Timeline Indicator dot */}
              <div
                className={`absolute -left-[5.5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                  active
                    ? "bg-emerald-400 border-emerald-200 ring-4 ring-emerald-500/20 scale-125"
                    : visited
                    ? "bg-slate-400 border-slate-300"
                    : "bg-[#0d1117] border-slate-600 group-hover:border-slate-400"
                }`}
              />

              <span
                className={`text-xs transition-colors duration-200 ${
                  active
                    ? "text-white font-semibold drop-shadow-xs"
                    : visited
                    ? "text-slate-300 font-medium"
                    : "text-slate-400 group-hover:text-slate-300"
                }`}
              >
                {step.id}. {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
