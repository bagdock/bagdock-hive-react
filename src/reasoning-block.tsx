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
        className="flex items-center gap-1.5 text-xs text-[var(--hive-color-text-secondary,#9ca3af)] hover:text-[var(--hive-color-text,#4b5563)] transition-colors group"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        <Sparkles className="w-3 h-3" />
        <span>
          Routed to <span className="font-medium text-[var(--hive-color-text-secondary,#6b7280)]">{agentLabel}</span>
        </span>
        {typeof routing.confidence === "number" && !Number.isNaN(routing.confidence) && (
          <span className="text-[var(--hive-color-text-secondary,#d1d5db)]">
            ({(routing.confidence * 100).toFixed(0)}%)
          </span>
        )}
      </button>
      {expanded && (
        <div className="mt-1.5 ml-5 px-3 py-2.5 bg-[var(--hive-color-surface-elevated,#f9fafb)] border border-[var(--hive-color-border,#e5e7eb)] rounded-lg text-xs text-[var(--hive-color-text-secondary,#6b7280)] space-y-1.5">
          <p className="italic">&ldquo;{routing.reasoning}&rdquo;</p>
          <div className="flex items-center gap-3 text-[var(--hive-color-text-secondary,#9ca3af)]">
            <span>
              Model: <span className="font-medium text-[var(--hive-color-text-secondary,#6b7280)]">{routing.modelTier}</span>
            </span>
            <span>
              Agent: <span className="font-medium text-[var(--hive-color-text-secondary,#6b7280)]">{agentLabel}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
