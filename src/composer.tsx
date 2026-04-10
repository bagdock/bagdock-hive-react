"use client"

import * as React from "react"
import { ArrowUp, Paperclip } from "lucide-react"

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
}: ComposerProps) {
  const internalRef = React.useRef<HTMLTextAreaElement>(null)

  const autoResize = React.useCallback(() => {
    const ta = internalRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }, [])

  return (
    <form onSubmit={onSubmit} className={cn("border-t border-gray-100 bg-white", className)}>
      <div className="flex items-end gap-2 px-4 py-3">
        <button
          type="button"
          className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors rounded-lg flex-shrink-0 mb-0.5"
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
          className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none leading-relaxed"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0 mb-0.5",
            value.trim()
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-gray-100 text-gray-300",
          )}
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  )
}
