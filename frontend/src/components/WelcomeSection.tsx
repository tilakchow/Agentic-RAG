import React from "react"
import { Shield, CreditCard, Package, Wrench, ChevronRight } from "lucide-react"

interface WelcomeSectionProps {
  onSelectQuery: (query: string) => void
}

interface ActionCard {
  title: string
  subtitle: string
  query: string
  icon: React.ElementType
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onSelectQuery }) => {
  const cards: ActionCard[] = [
    {
      title: "Account access",
      subtitle: "I can't log in to my account",
      query: "My account is locked. How can I regain access?",
      icon: Shield,
    },
    {
      title: "Billing help",
      subtitle: "Update billing details",
      query: "How do I update my billing details or payment method?",
      icon: CreditCard,
    },
    {
      title: "Order & refund",
      subtitle: "Cancel an order or get a refund",
      query: "How can I cancel an order or request a refund?",
      icon: Package,
    },
    {
      title: "Technical issue",
      subtitle: "App not working",
      query: "The app is not working properly, how do I troubleshoot?",
      icon: Wrench,
    },
  ]

  return (
    <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6 mb-4 select-none">
      {/* Left: Greeting text */}
      <div className="max-w-xs flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
          Hello <span>👋</span>
        </h1>
        <h2 className="text-base font-semibold tracking-tight text-slate-800 mt-1">
          How can I help you today?
        </h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Get answers from our knowledge base or ask any support question.
        </p>
      </div>

      {/* Right: 2x2 Quick Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:max-w-md">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <button
              key={idx}
              onClick={() => onSelectQuery(card.query)}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 hover:bg-blue-50/20 active:bg-blue-50/40 transition-all text-left shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {card.title}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate mt-0.5">
                    {card.subtitle}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
