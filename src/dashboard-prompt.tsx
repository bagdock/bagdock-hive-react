"use client"

import * as React from "react"
import {
  AlertCircle,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Package,
  Paperclip,
  Sparkles,
  TrendingUp,
  TruckIcon,
  Users,
  Webhook,
  Wrench,
} from "lucide-react"

import { cn } from "./utils"
import type { AIAssistantSuggestion, AgentNotification, DashboardRole } from "./types"

export interface HiveDashboardPromptProps {
  userName: string
  dashboardRole: DashboardRole
  hideGreeting?: boolean
  briefing?: string
  isLoading?: boolean
  context?: {
    operatorName?: string
    facilityName?: string
  }
  suggestions?: AIAssistantSuggestion[]
  agentNotifications?: AgentNotification
  onSendMessage?: (message: string) => void
  onSuggestionClick?: (suggestion: AIAssistantSuggestion) => void
  onNotificationClick?: () => void
  onExpandChat?: () => void
  className?: string
}

const ROLE_PLACEHOLDERS: Record<DashboardRole, string> = {
  customer: "Ask Cora anything...",
  operator_owner: "Ask Cora about your portfolio...",
  facility_manager: "Ask Cora about this facility...",
  admin: "Ask Cora about operators, projects, or anything...",
}

const ROLE_SUGGESTIONS: Record<DashboardRole, AIAssistantSuggestion[]> = {
  customer: [
    { id: "c1", type: "action", title: "Check my next payment", description: "See upcoming charges", icon: "CreditCard", dismissible: false, priority: 1, context: "dashboard" },
    { id: "c2", type: "action", title: "Find a bigger unit", description: "Browse available upgrades", icon: "Package", dismissible: false, priority: 2, context: "dashboard" },
    { id: "c3", type: "action", title: "Download my invoice", description: "Get your latest invoice", icon: "FileText", dismissible: false, priority: 3, context: "dashboard" },
    { id: "c4", type: "action", title: "Help me move out", description: "Step-by-step guide", icon: "TruckIcon", dismissible: false, priority: 4, context: "dashboard" },
  ],
  operator_owner: [
    { id: "o1", type: "action", title: "Show vacancy trends", description: "Portfolio overview", icon: "TrendingUp", dismissible: false, priority: 1, context: "dashboard" },
    { id: "o2", type: "action", title: "Compare facilities", description: "Performance breakdown", icon: "BarChart3", dismissible: false, priority: 2, context: "dashboard" },
    { id: "o3", type: "action", title: "Review pending leads", description: "New enquiries", icon: "Users", dismissible: false, priority: 3, context: "dashboard" },
    { id: "o4", type: "action", title: "Draft a price increase", description: "Rate adjustment tool", icon: "CreditCard", dismissible: false, priority: 4, context: "dashboard" },
  ],
  facility_manager: [
    { id: "f1", type: "action", title: "Today's move-ins", description: "Scheduled arrivals", icon: "Calendar", dismissible: false, priority: 1, context: "dashboard" },
    { id: "f2", type: "action", title: "Units needing attention", description: "Maintenance alerts", icon: "Wrench", dismissible: false, priority: 2, context: "dashboard" },
    { id: "f3", type: "action", title: "Revenue this month", description: "Financial summary", icon: "TrendingUp", dismissible: false, priority: 3, context: "dashboard" },
    { id: "f4", type: "action", title: "Tenant support requests", description: "Open tickets", icon: "Users", dismissible: false, priority: 4, context: "dashboard" },
  ],
  admin: [
    { id: "a1", type: "action", title: "Operator health check", description: "System status", icon: "Building2", dismissible: false, priority: 1, context: "dashboard" },
    { id: "a2", type: "action", title: "Recent provisioning errors", description: "Failed deployments", icon: "AlertCircle", dismissible: false, priority: 2, context: "dashboard" },
    { id: "a3", type: "action", title: "Webhook delivery stats", description: "Delivery success rates", icon: "Webhook", dismissible: false, priority: 3, context: "dashboard" },
    { id: "a4", type: "action", title: "Agent fleet status", description: "Active agents overview", icon: "Sparkles", dismissible: false, priority: 4, context: "dashboard" },
  ],
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard, Package, FileText, TruckIcon, TrendingUp, Building2,
  Users, AlertCircle, Webhook, BarChart3, Calendar, Wrench, Sparkles,
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function HiveDashboardPrompt({
  userName,
  dashboardRole,
  hideGreeting,
  briefing,
  isLoading,
  suggestions,
  agentNotifications,
  onSendMessage,
  onSuggestionClick,
  onNotificationClick,
  onExpandChat,
  className,
}: HiveDashboardPromptProps) {
  const [input, setInput] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const resolvedSuggestions = suggestions ?? ROLE_SUGGESTIONS[dashboardRole] ?? []
  const placeholder = ROLE_PLACEHOLDERS[dashboardRole]
  const greeting = getGreeting()

  const autoResize = React.useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim())
      setInput("")
      if (textareaRef.current) textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSuggestionClick = (suggestion: AIAssistantSuggestion) => {
    if (isLoading) return
    if (onSuggestionClick) {
      onSuggestionClick(suggestion)
    } else if (onSendMessage) {
      onSendMessage(suggestion.title)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {!hideGreeting && (
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {greeting}, {userName}
          </h1>
          {briefing && (
            <p className="text-sm text-gray-500 leading-relaxed mt-1.5 max-w-xl">{briefing}</p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {agentNotifications && agentNotifications.count > 0 && (
          <button
            onClick={onNotificationClick ?? onExpandChat}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5",
              "bg-white rounded-2xl border border-gray-200 shadow-sm",
              "hover:border-gray-300 hover:shadow transition-all",
              "text-left sm:w-64 flex-shrink-0",
            )}
          >
            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {agentNotifications.count} new update
                {agentNotifications.count !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-gray-500 truncate">{agentNotifications.summary}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
        )}

        <form
          onSubmit={handleSubmit}
          className={cn(
            "flex flex-col px-4 py-3",
            "bg-white rounded-2xl border border-gray-200 shadow-sm",
            "focus-within:border-gray-300 focus-within:shadow transition-all",
            "flex-1",
          )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              autoResize()
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={2}
            className={cn(
              "flex-1 text-sm text-gray-900 placeholder:text-gray-400",
              "bg-transparent border-0 focus:outline-none focus:ring-0 focus:border-0 resize-none leading-relaxed",
            )}
          />
          <div className="flex items-center justify-between mt-2">
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-500 transition-colors rounded-lg"
              title="Attach file (coming soon)"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                input.trim() && !isLoading
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-gray-100 text-gray-300",
              )}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {resolvedSuggestions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {resolvedSuggestions.slice(0, 4).map((suggestion) => {
            const Icon = iconMap[suggestion.icon ?? ""] ?? Sparkles
            return (
              <button
                key={suggestion.id}
                disabled={isLoading}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2.5 rounded-xl",
                  "bg-white border border-gray-200",
                  "text-sm font-medium text-gray-700",
                  "transition-all whitespace-nowrap flex-shrink-0",
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-gray-300 hover:bg-gray-50",
                )}
              >
                <Icon className="w-4 h-4 text-gray-400" />
                {suggestion.title}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** @deprecated Use HiveDashboardPrompt */
export const DashboardPromptBox = HiveDashboardPrompt
