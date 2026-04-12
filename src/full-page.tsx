"use client"

import * as React from "react"
import {
  CreditCard,
  HelpCircle,
  Minimize2,
  MousePointer,
  Package,
  Sparkles,
  X,
} from "lucide-react"

import { cn } from "./utils"
import { ChatMessage, LoadingMessage } from "./chat-message"
import { Composer } from "./composer"
import type { AIMessage, AIAssistantSuggestion, ToolResultRenderer } from "./types"

export interface HiveFullPageProps {
  messages?: AIMessage[]
  onSendMessage?: (message: string) => void
  isLoading?: boolean
  suggestions?: AIAssistantSuggestion[]
  recentThreads?: { id: string; preview: string; agentRole: string; createdAt: string; messageCount: number }[]
  onLoadThread?: (sessionId: string) => void
  onNewChat?: () => void
  onCollapse?: () => void
  onClose?: () => void
  className?: string
  renderToolResult?: ToolResultRenderer
  showBranding?: boolean
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  Package,
  HelpCircle,
  Sparkles,
}

const FULLPAGE_SUGGESTIONS: AIAssistantSuggestion[] = [
  { id: "fp1", type: "action", title: "Check my next payment", description: "See upcoming charges and due dates", icon: "CreditCard", dismissible: false, priority: 1, context: "dashboard" },
  { id: "fp2", type: "action", title: "Find available units", description: "Browse storage options near you", icon: "Package", dismissible: false, priority: 2, context: "dashboard" },
  { id: "fp3", type: "action", title: "Help me move out", description: "Step-by-step guide to vacating", icon: "HelpCircle", dismissible: false, priority: 3, context: "dashboard" },
]

export function HiveFullPage({
  messages = [],
  onSendMessage,
  isLoading = false,
  suggestions = FULLPAGE_SUGGESTIONS,
  onCollapse,
  onClose,
  className,
  renderToolResult,
  showBranding,
}: HiveFullPageProps) {
  const [input, setInput] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  React.useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim())
      setInput("")
      if (inputRef.current) inputRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Ask Cora</span>
        </div>
        <div className="flex items-center gap-0.5">
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Collapse to panel"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Close Cora"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex px-4 md:px-8">
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto px-2 md:px-6 py-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
                  <MousePointer className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1.5">Welcome to Cora</h3>
                <p className="text-sm text-gray-500 text-center mb-8 max-w-md">
                  Ask anything or tell Cora what you need
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
                  {suggestions.map((s) => {
                    const Icon = ICON_MAP[s.icon ?? ""] ?? Sparkles
                    return (
                      <button
                        key={s.id}
                        onClick={() => onSendMessage?.(s.title)}
                        className="flex flex-col gap-1.5 items-start px-4 py-3.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 text-left transition-all"
                      >
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">{s.title}</span>
                        {s.description && (
                          <span className="text-xs text-gray-400 leading-snug">
                            {s.description}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="flex flex-col items-center gap-1.5 text-xs text-gray-400 mt-8">
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono text-[10px]">
                      @
                    </kbd>{" "}
                    to mention any unit, payment, or document
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono text-[10px]">
                      Tab
                    </kbd>{" "}
                    to add current view to context
                  </span>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, i) => (
                  <ChatMessage
                    key={message.id || i}
                    message={message}
                    onSendMessage={onSendMessage}
                    renderToolResult={renderToolResult}
                  />
                ))}
                {isLoading && <LoadingMessage />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="px-6 pb-5 pt-1">
            <Composer
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              isLoading={isLoading}
              inputRef={inputRef}
              showBranding={showBranding}
              className="rounded-2xl border border-gray-200 shadow-sm focus-within:border-gray-300 focus-within:shadow"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/** @deprecated Use HiveFullPage */
export const CoraFullPage = HiveFullPage
