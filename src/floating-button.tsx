"use client"

import * as React from "react"
import { Sparkles, X } from "lucide-react"

import { cn } from "./utils"

export interface HiveFloatingButtonProps {
  onClick?: () => void
  isOpen?: boolean
  hasUnread?: boolean
  className?: string
}

export function HiveFloatingButton({
  onClick,
  isOpen,
  hasUnread = false,
  className,
}: HiveFloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-50",
        "w-12 h-12 rounded-full",
        "flex items-center justify-center",
        "transition-all duration-200",
        "shadow-lg hover:shadow-xl",
        "bottom-6 right-6",
        isOpen ? "bg-gray-800 text-white" : "bg-gray-900 text-white hover:bg-gray-800",
        className,
      )}
      aria-label={isOpen ? "Close Cora" : "Ask Cora"}
    >
      {isOpen ? (
        <X className="w-5 h-5" />
      ) : (
        <>
          <Sparkles className="w-5 h-5" />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </>
      )}
    </button>
  )
}

/** @deprecated Use HiveFloatingButton */
export const AIFloatingButton = HiveFloatingButton
