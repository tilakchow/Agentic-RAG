import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "kb" | "web" | "direct"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-zinc-900 text-zinc-50 border-transparent",
    secondary: "bg-zinc-100 text-zinc-900 border-zinc-200",
    outline: "text-zinc-800 border-zinc-300",
    kb: "bg-emerald-50 text-emerald-800 border-emerald-200/80 font-medium",
    web: "bg-blue-50 text-blue-800 border-blue-200/80 font-medium",
    direct: "bg-purple-50 text-purple-800 border-purple-200/80 font-medium",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
