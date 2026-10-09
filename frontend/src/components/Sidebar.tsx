import React from "react"
import { MessageSquare, Database, History, Settings, HelpCircle } from "lucide-react"

export type NavTab = "chat" | "kb" | "history" | "settings"

interface SidebarProps {
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  onHelpClick?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onHelpClick,
}) => {
  const navItems = [
    { id: "chat" as NavTab, label: "Chat", icon: MessageSquare },
    { id: "kb" as NavTab, label: "KB", icon: Database },
    { id: "history" as NavTab, label: "History", icon: History },
    { id: "settings" as NavTab, label: "Settings", icon: Settings },
  ]

  return (
    <aside className="w-16 shrink-0 border-r border-slate-200/90 bg-white flex flex-col items-center justify-between py-4 select-none">
      {/* Top Nav Items */}
      <div className="flex flex-col items-center gap-5 w-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-semibold shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/70"
              }`}
              title={item.label}
            >
              {isActive && (
                <div className="absolute -left-2 top-2.5 bottom-2.5 w-1 bg-blue-600 rounded-r-md" />
              )}
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight tracking-tight">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Bottom Profile/Help Icon */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onHelpClick}
          className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs hover:bg-blue-600 transition-colors cursor-pointer"
          title="Support Info & Help"
        >
          <HelpCircle className="w-5 h-5 text-white" />
        </button>
      </div>
    </aside>
  )
}
