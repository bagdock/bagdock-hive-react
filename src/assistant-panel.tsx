"use client"

import * as React from "react"
import { Sparkles, X } from "lucide-react"

import { cn } from "./utils"
import { HiveAssistantStrip } from "./assistant-strip"
import type { AIAssistantSuggestion } from "./types"

export interface HiveAssistantPanelProps {
  context?: string
  suggestions?: AIAssistantSuggestion[]
  isExpanded?: boolean
  onExpand?: () => void
  onCollapse?: () => void
  onSuggestionClick?: (suggestion: AIAssistantSuggestion) => void
  className?: string
}

export function HiveAssistantPanel({
  suggestions,
  isExpanded = false,
  onExpand,
  onCollapse,
  onSuggestionClick,
  className,
}: HiveAssistantPanelProps) {
  if (!isExpanded) {
    return (
      <HiveAssistantStrip
        suggestions={suggestions}
        onSuggestionClick={onSuggestionClick}
        onOpenChat={onExpand}
        className={className}
      />
    )
  }

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm", className)}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-medium text-gray-900 text-sm">Cora</span>
        </div>
        <button
          onClick={onCollapse}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-2">
        {(suggestions ?? []).map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick?.(suggestion)}
            className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Sparkles className="w-4 h-4 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{suggestion.title}</p>
              {suggestion.description && (
                <p className="text-xs text-gray-500 truncate">{suggestion.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/** @deprecated Use HiveAssistantPanel */
export const AIAssistantPanel = HiveAssistantPanel
