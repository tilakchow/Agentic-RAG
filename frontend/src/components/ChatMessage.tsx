import React, { useState, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Copy,
  Check,
  FileText,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  User,
  Bot,
} from "lucide-react"

export interface MessageItem {
  id: string
  role: "user" | "assistant"
  content: string
  source?: string
  timestamp: string
}

interface ChatMessageProps {
  message: MessageItem
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState<boolean | null>(null)
  const isUser = message.role === "user"

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Preprocess content: convert literal HTML <br>, <br/>, <br /> to newlines
  const formattedContent = useMemo(() => {
    if (!message.content) return ""
    return message.content.replace(/<br\s*\/?>/gi, "\n")
  }, [message.content])

  // Get source citation title & details
  const getSourceDetails = (source?: string) => {
    if (!source) return null
    if (source === "private_kb" || source === "kb") {
      return {
        title: "Pinecone Knowledge Base",
        description: "Verified customer support procedures and policy documentation.",
      }
    }
    if (source === "web_search" || source === "web") {
      return {
        title: "Tavily Real-time Web Search",
        description: "Live search results gathered and validated from web sources.",
      }
    }
    if (source === "direct") {
      return {
        title: "Customer Assistant Guidance",
        description: "Conversational answer formulated directly by the support agent.",
      }
    }
    return {
      title: "Support Knowledge Base",
      description: "Information retrieved from the support records.",
    }
  }

  const sourceDetails = getSourceDetails(message.source)

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-2.5 mb-5">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
          <div className="rounded-2xl rounded-tr-xs bg-blue-50/90 text-slate-800 border border-blue-100/90 px-4 py-2.5 text-[13.5px] leading-relaxed shadow-2xs">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">
            {message.timestamp}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 mb-6 group">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
        <Bot className="w-4 h-4 text-blue-600" />
      </div>

      {/* Assistant Message Container */}
      <div className="flex-1 max-w-[92%] sm:max-w-[85%] flex flex-col">
        <div className="rounded-2xl rounded-tl-xs border border-slate-200/90 bg-white p-4.5 shadow-2xs text-[13.5px] text-slate-800">
          {/* Markdown Content */}
          <div className="leading-relaxed selection:bg-blue-100 overflow-hidden">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-base font-bold text-slate-900 mt-3 mb-2 first:mt-0 tracking-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-semibold text-slate-900 mt-3 mb-1.5 first:mt-0 tracking-tight">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs font-semibold text-slate-900 mt-2.5 mb-1 first:mt-0">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-800">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-900">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-slate-700">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 my-2 space-y-1 text-slate-800">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 my-2 space-y-1 text-slate-800">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed pl-0.5">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-blue-400 pl-3 my-2 text-slate-600 italic">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="my-3 w-full overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full min-w-[340px] text-left text-xs border-collapse">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-slate-50/70 transition-colors">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="px-3.5 py-2 font-semibold text-slate-800 border-r border-slate-200/50 last:border-r-0">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3.5 py-2 text-slate-700 align-top border-r border-slate-100 last:border-r-0">
                    {children}
                  </td>
                ),
                a: ({ href, children }) => {
                  const isSafe =
                    href &&
                    (href.startsWith("http://") ||
                      href.startsWith("https://") ||
                      href.startsWith("mailto:"))
                  return isSafe ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors font-medium cursor-pointer"
                    >
                      {children}
                    </a>
                  ) : (
                    <span>{children}</span>
                  )
                },
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "")
                  const isMultiline = String(children).includes("\n")

                  if (!match && !isMultiline) {
                    return (
                      <code
                        className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[12px] border border-slate-200/70"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  }

                  return (
                    <div className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-[#0d1117] text-slate-100">
                      {match && (
                        <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                          <span>{match[1]}</span>
                        </div>
                      )}
                      <pre className="p-3 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  )
                },
                pre: ({ children }) => <>{children}</>,
              }}
            >
              {formattedContent}
            </ReactMarkdown>
          </div>

          {/* Source Citation Callout Card (matching reference design) */}
          {sourceDetails && (
            <div className="mt-4 rounded-xl border border-blue-200/80 bg-blue-50/60 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-blue-900 truncate">
                    Source: {sourceDetails.title}
                  </span>
                  <span className="text-[11px] text-blue-700/80 truncate">
                    {sourceDetails.description}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            </div>
          )}
        </div>

        {/* Feedback actions & timestamp footer (matching reference design) */}
        <div className="flex items-center justify-between px-2 mt-1.5 text-slate-400">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setLiked((prev) => (prev === true ? null : true))}
              className={`p-1 rounded hover:text-slate-700 transition-colors cursor-pointer ${
                liked === true ? "text-blue-600" : ""
              }`}
              title="Good response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLiked((prev) => (prev === false ? null : false))}
              className={`p-1 rounded hover:text-slate-700 transition-colors cursor-pointer ${
                liked === false ? "text-red-500" : ""
              }`}
              title="Poor response"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:text-slate-700 transition-colors cursor-pointer"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  )
}
