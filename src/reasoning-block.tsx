"use client"

import { ChevronDown, ChevronRight, Sparkles } from "lucide-react"
import * as React from "react"

import type { AIRoutingMetadata } from "./types"

export const AGENT_LABELS: Record<string, string> = {
  concierge: "Concierge",
  search: "Search",
  booking: "Rental",
  rental: "Rental",
  negotiation: "Negotiation",
  support: "Support",
  sales: "Sales",
  analytics: "Analytics",
  crm: "CRM",
  companies: "Companies",
  tenants: "Tenants",
  collections: "Collections",
  units: "Units",
  tasks: "Tasks",
  conversations: "Conversations",
  access: "Access Control",
  insurance: "Insurance",
  accounting: "Accounting",
}

export function ReasoningBlock({ routing }: { routing: AIRoutingMetadata }) {
  const [expanded, setExpanded] = React.useState(false)
  const agentLabel = AGENT_LABELS[routing.agent] ?? routing.agent

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors group"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        <Sparkles className="w-3 h-3" />
        <span>
          Routed to <span className="font-medium text-gray-500">{agentLabel}</span>
        </span>
        {typeof routing.confidence === "number" && !Number.isNaN(routing.confidence) && (
          <span className="text-gray-300">
            ({(routing.confidence * 100).toFixed(0)}%)
          </span>
        )}
      </button>
      {expanded && (
        <div className="mt-1.5 ml-5 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500 space-y-1.5">
          <p className="italic">&ldquo;{routing.reasoning}&rdquo;</p>
          <div className="flex items-center gap-3 text-gray-400">
            <span>
              Model: <span className="font-medium text-gray-500">{routing.modelTier}</span>
            </span>
            <span>
              Agent: <span className="font-medium text-gray-500">{agentLabel}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
