"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { formatTimeAgo } from "./utils"
import type { RecentThread } from "./types"

export function RecentThreadsDropdown({
  threads,
  onSelect,
  onNewChat,
}: {
  threads: RecentThread[]
  onSelect?: (sessionId: string) => void
  onNewChat?: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
        aria-label="Recent threads"
      >
        <Clock className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Recent
            </span>
            {onNewChat && (
              <button
                onClick={() => {
                  onNewChat()
                  setOpen(false)
                }}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium"
              >
                + New chat
              </button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto">
            {threads.slice(0, 8).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onSelect?.(t.id)
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm text-gray-900 truncate">
                  {t.preview || "Untitled chat"}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {t.agentRole} &middot; {t.messageCount} messages &middot;{" "}
                  {formatTimeAgo(t.createdAt)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
