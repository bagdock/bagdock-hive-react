"use client"

import * as React from "react"

import { cn } from "./utils"

export function HiveBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium",
        "bg-gray-100 text-gray-600 rounded-md",
        className,
      )}
    >
      <span className="text-[10px] font-semibold">AI</span>
      Answer
    </span>
  )
}

/** @deprecated Use HiveBadge */
export const AIBadge = HiveBadge
