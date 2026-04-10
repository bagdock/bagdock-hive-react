"use client"

import * as React from "react"
import {
  CreditCard,
  HelpCircle,
  Sparkles,
  Zap,
} from "lucide-react"

import { cn } from "./utils"
import type { AIAssistantSuggestion } from "./types"

export interface HiveAssistantStripProps {
  suggestions?: AIAssistantSuggestion[]
  onSuggestionClick?: (suggestion: AIAssistantSuggestion) => void
  onOpenChat?: () => void
  className?: string
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  HelpCircle,
  Sparkles,
  Zap,
}

const defaultStripSuggestions: AIAssistantSuggestion[] = [
  { id: "1", type: "action", title: "Explain my bill", description: "Understand your latest charges", icon: "CreditCard", dismissible: true, priority: 1, context: "dashboard" },
  { id: "2", type: "action", title: "Unit suggestions", description: "Find a better fit", icon: "Zap", dismissible: true, priority: 2, context: "dashboard" },
  { id: "3", type: "action", title: "Help me move out", description: "Step-by-step guide", icon: "HelpCircle", dismissible: true, priority: 3, context: "dashboard" },
]

export function HiveAssistantStrip({
  suggestions = defaultStripSuggestions,
  onSuggestionClick,
  onOpenChat,
  className,
}: HiveAssistantStripProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-medium text-gray-900 text-sm">Cora</span>
        </div>
        {onOpenChat && (
          <button
            onClick={onOpenChat}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Open chat
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {suggestions.slice(0, 3).map((suggestion) => {
          const Icon = ICON_MAP[suggestion.icon as keyof typeof ICON_MAP] || Sparkles
          return (
            <button
              key={suggestion.id}
              onClick={() => onSuggestionClick?.(suggestion)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 font-medium transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Icon className="w-3.5 h-3.5 text-gray-400" />
              {suggestion.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** @deprecated Use HiveAssistantStrip */
export const AssistantStrip = HiveAssistantStrip
