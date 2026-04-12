"use client"

import * as React from "react"
import {
  CreditCard,
  Clock,
  FileText,
  HelpCircle,
  MapPin,
  Maximize2,
  Minus,
  MousePointer,
  Package,
  Share2,
  Sparkles,
  TruckIcon,
  User,
  X,
  Zap,
} from "lucide-react"

import { cn } from "./utils"
import { ChatMessage } from "./chat-message"
import { LoadingMessage } from "./chat-message"
import { Composer } from "./composer"
import { RecentThreadsDropdown } from "./recent-threads"
import type { AIMessage, AIAssistantSuggestion, RecentThread, ToolResultRenderer } from "./types"

export interface HiveChatPanelProps {
  isOpen?: boolean
  onClose?: () => void
  onExpand?: () => void
  messages?: AIMessage[]
  onSendMessage?: (message: string) => void
  isLoading?: boolean
  suggestions?: AIAssistantSuggestion[]
  recentThreads?: RecentThread[]
  onLoadThread?: (sessionId: string) => void
  onNewChat?: () => void
  botName?: string
  botSubtitle?: string
  botAvatarUrl?: string
  className?: string
  renderToolResult?: ToolResultRenderer
  showBranding?: boolean
}

const DEFAULT_SUGGESTIONS: AIAssistantSuggestion[] = [
  { id: "s1", type: "action", title: "Check my next payment", description: "See upcoming charges", icon: "CreditCard", dismissible: false, priority: 1, context: "dashboard" },
  { id: "s2", type: "action", title: "Find a bigger unit", description: "Browse available upgrades", icon: "Package", dismissible: false, priority: 2, context: "dashboard" },
  { id: "s3", type: "action", title: "Help me move out", description: "Step-by-step guide", icon: "HelpCircle", dismissible: false, priority: 3, context: "dashboard" },
]

export function HiveChatPanel({
  isOpen,
  onClose,
  onExpand,
  messages = [],
  onSendMessage,
  isLoading = false,
  suggestions = DEFAULT_SUGGESTIONS,
  recentThreads = [],
  onLoadThread,
  onNewChat,
  className,
  renderToolResult,
  showBranding,
}: HiveChatPanelProps) {
  const [input, setInput] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  React.useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
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

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
        role="button"
        tabIndex={0}
        aria-label="Close"
        onClick={() => onClose?.()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClose?.()
          }
        }}
      />

      <div
        className={cn(
          "fixed z-50",
          "inset-x-0 bottom-0 top-0 md:inset-auto",
          "md:bottom-24 md:right-6 md:w-[420px] md:max-h-[620px] md:rounded-2xl",
          "bg-white shadow-2xl",
          "flex flex-col overflow-hidden",
          "animate-in slide-in-from-bottom duration-300 md:slide-in-from-bottom-0 md:fade-in",
          className,
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {messages.length > 0 ? "Cora" : "New chat"}
            </span>
            {recentThreads.length > 0 && (
              <RecentThreadsDropdown
                threads={recentThreads}
                onSelect={onLoadThread}
                onNewChat={onNewChat}
              />
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Minimize"
            >
              <Minus className="w-4 h-4" />
            </button>
            {onExpand && (
              <button
                onClick={onExpand}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors hidden md:flex"
                aria-label="Expand"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 px-6">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <MousePointer className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Welcome to Cora</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Ask anything or tell Cora what you need
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {suggestions.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    disabled={isLoading}
                    onClick={() => onSendMessage?.(s.title)}
                    className={cn(
                      "px-3.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl transition-colors",
                      isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-gray-300 hover:bg-gray-50",
                    )}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              <div className="flex flex-col items-center gap-1.5 text-[11px] text-gray-400">
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

        <Composer
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          isLoading={isLoading}
          inputRef={inputRef}
          showBranding={showBranding}
        />
      </div>
    </>
  )
}

/** @deprecated Use HiveChatPanel */
export const AIChatPanel = HiveChatPanel
