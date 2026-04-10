"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"

import { cn } from "./utils"

export interface HiveInlineHintProps {
  text?: string
  onAsk?: () => void
  className?: string
}

export function HiveInlineHint({
  text = "Need help with this?",
  onAsk,
  className,
}: HiveInlineHintProps) {
  return (
    <button
      onClick={onAsk}
      className={cn(
        "flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors",
        className,
      )}
    >
      <Sparkles className="w-4 h-4" />
      <span>{text}</span>
    </button>
  )
}

/** @deprecated Use HiveInlineHint */
export const InlineSmartHint = HiveInlineHint
