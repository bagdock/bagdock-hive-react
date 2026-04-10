"use client"

import * as React from "react"
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Search as SearchIcon,
  Sparkles,
} from "lucide-react"

import { formatTimeAgo } from "./utils"
import type { HistorySession } from "./types"

export interface HiveHistoryPanelProps {
  sessions: HistorySession[]
  onBack: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession?: (sessionId: string) => void
}

const ROLE_LABELS: Record<string, string> = {
  concierge: "Cora",
  search: "Search",
  rental: "Rental",
  negotiation: "Negotiation",
  support: "Support",
  sales: "Sales",
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700">
        <CheckCircle2 className="w-2.5 h-2.5" />
        Done
      </span>
    )
  }
  if (status === "errored" || status === "abandoned") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600">
        <AlertCircle className="w-2.5 h-2.5" />
        {status === "errored" ? "Error" : "Ended"}
      </span>
    )
  }
  return null
}

export function HiveHistoryPanel({ sessions, onBack, onSelectSession }: HiveHistoryPanelProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="px-4 pt-4 lg:pt-10 pb-2.5 lg:pb-3 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Chat History</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No conversations yet</p>
            <p className="text-xs text-gray-400">Your chat history will appear here</p>
          </div>
        ) : (
          <div className="py-2">
            {sessions.map((session) => {
              const isCheckoutExpired =
                session.status === "completed" && session.agentRole === "rental"
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {session.agentRole === "search" ? (
                        <SearchIcon className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-gray-500">
                          {ROLE_LABELS[session.agentRole] ?? "Cora"}
                        </span>
                        <StatusBadge status={session.status} />
                        {isCheckoutExpired && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700">
                            Restart
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 truncate">
                        {session.preview || "New conversation"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-gray-400">
                          {formatTimeAgo(session.createdAt)}
                        </span>
                        <span className="text-[11px] text-gray-300">&middot;</span>
                        <span className="text-[11px] text-gray-400">
                          {session.messageCount} message{session.messageCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/** @deprecated Use HiveHistoryPanel */
export const AgentHistoryPanel = HiveHistoryPanel
