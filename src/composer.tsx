"use client"

import * as React from "react"
import { ArrowUp, Paperclip, Sparkles } from "lucide-react"

import { cn } from "./utils"

export interface ComposerProps {
  value: string
  onChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  isLoading?: boolean
  placeholder?: string
  inputRef?: React.Ref<HTMLTextAreaElement>
  className?: string
  showBranding?: boolean
}

export function Composer({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  isLoading,
  placeholder = "Ask Cora...",
  inputRef,
  className,
  showBranding,
}: ComposerProps) {
  const internalRef = React.useRef<HTMLTextAreaElement>(null)

  const autoResize = React.useCallback(() => {
    const ta = internalRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }, [])

  return (
    <div className={cn("border-t border-[var(--hive-color-border,#f3f4f6)]", className)}>
      <form onSubmit={onSubmit} className="bg-[var(--hive-color-surface-user,#ffffff)]">
        <div className="flex items-end gap-2 px-4 py-3">
          <button
            type="button"
            className="p-1.5 text-[var(--hive-color-text-secondary,#d1d5db)] hover:text-[var(--hive-color-text,#6b7280)] transition-colors rounded-lg flex-shrink-0 mb-0.5"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <textarea
            ref={(el) => {
              (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el
              if (typeof inputRef === "function") inputRef(el)
              else if (inputRef && typeof inputRef === "object") (inputRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el
            }}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              autoResize()
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 text-sm text-[var(--hive-color-text,#111827)] placeholder:text-[var(--hive-color-text-secondary,#9ca3af)] bg-transparent border-0 focus:outline-none focus:ring-0 resize-none leading-relaxed"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0 mb-0.5",
              value.trim()
                ? "bg-[var(--hive-color-primary,#111827)] text-white hover:opacity-90"
                : "bg-[var(--hive-color-surface,#f3f4f6)] text-[var(--hive-color-text-secondary,#d1d5db)]",
            )}
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
      {showBranding && (
        <div className="flex items-center justify-center gap-1.5 pb-2.5 pt-0.5">
          <Sparkles className="w-3 h-3 text-[var(--hive-color-primary,#6366f1)]" />
          <span className="text-[11px] text-[var(--hive-color-text-secondary,#9ca3af)]">
            powered by <span className="font-semibold text-[var(--hive-color-text,#374151)]">Bagdock</span>
          </span>
        </div>
      )}
    </div>
  )
}
