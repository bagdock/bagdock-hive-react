"use client"

import * as React from "react"
import {
  ArrowLeft,
  ArrowUp,
  MapPin,
  Maximize2,
  Minimize2,
  Paperclip,
  Star,
  X,
} from "lucide-react"

import { cn } from "./utils"
import { ChatMarkdown } from "./chat-markdown"
import { isToolDone, QuickReplyChips, VerificationCard } from "./chat-primitives"
import { ReasoningBlock } from "./reasoning-block"
import type { AIMessage, AIAssistantSuggestion, SearchFacility } from "./types"

export interface HiveSearchViewProps {
  messages?: AIMessage[]
  onSendMessage?: (message: string) => void
  isLoading?: boolean
  suggestions?: AIAssistantSuggestion[]
  facilities?: SearchFacility[]
  selectedFacility?: SearchFacility | null
  onSelectFacility?: (facility: SearchFacility) => void
  onViewDetails?: (facilityId: string) => void
  onRentalWithCora?: (facilityId: string) => void
  onCollapse?: () => void
  onSwitchToFullSearch?: () => void
  renderMap?: (props: {
    facilities: SearchFacility[]
    selectedFacility: SearchFacility | null
    onSelect: (facility: SearchFacility) => void
  }) => React.ReactNode
  className?: string
}

function SearchFacilityCard({
  facility,
  isSelected,
  isLoading,
  onSelect,
  onViewDetails,
  onRentalWithCora,
}: {
  facility: SearchFacility
  isSelected?: boolean
  isLoading?: boolean
  onSelect?: () => void
  onViewDetails?: () => void
  onRentalWithCora?: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={facility.name}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect?.()
        }
      }}
      className={cn(
        "group rounded-xl border bg-white p-3 cursor-pointer transition-all duration-200",
        isSelected
          ? "border-gray-900 shadow-md ring-1 ring-gray-900/5"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
      )}
    >
      <div className="flex items-start gap-3">
        {facility.imageUrl ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img src={facility.imageUrl} alt={facility.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{facility.name}</h4>
          {facility.address && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{facility.address}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            {facility.price != null && (
              <span className="text-sm font-semibold text-gray-900">
                {facility.currency === "USD" ? "$" : "£"}
                {facility.price}
                <span className="text-xs font-normal text-gray-500">/mo</span>
              </span>
            )}
            {facility.rating != null && (
              <span className="flex items-center gap-0.5 text-xs text-gray-500">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {facility.rating}
              </span>
            )}
          </div>
        </div>
      </div>
      {isSelected && (
        <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails?.() }}
            className="flex-1 text-xs font-medium text-gray-600 hover:text-gray-900 py-1.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            View details
          </button>
          <button
            disabled={isLoading}
            onClick={(e) => { e.stopPropagation(); onRentalWithCora?.() }}
            className={cn(
              "flex-1 text-xs font-medium py-1.5 px-3 rounded-lg transition-colors",
              isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "text-white bg-gray-900 hover:bg-gray-800",
            )}
          >
            Book with Cora
          </button>
        </div>
      )}
    </div>
  )
}

function MapPlaceholder({ facilityCount }: { facilityCount: number }) {
  return (
    <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          {facilityCount > 0 ? `${facilityCount} locations on map` : "Map will appear here"}
        </p>
      </div>
    </div>
  )
}

function FacilityDetailOverlay({
  facility,
  onClose,
  onViewFullPage,
  onRentalWithCora,
}: {
  facility: SearchFacility
  onClose: () => void
  onViewFullPage: () => void
  onRentalWithCora: () => void
}) {
  return (
    <div className="absolute inset-y-0 right-0 w-[360px] max-w-full z-20 flex items-stretch p-3 animate-in slide-in-from-right duration-300">
      <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-y-auto">
        <div className="relative">
          {facility.imageUrl ? (
            <div className="h-48 w-full">
              <img src={facility.imageUrl} alt={facility.name} className="w-full h-full object-cover rounded-t-2xl" />
            </div>
          ) : (
            <div className="h-48 w-full bg-gray-100 rounded-t-2xl flex items-center justify-center">
              <MapPin className="w-10 h-10 text-gray-300" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
            {facility.address && (
              <p className="text-sm text-gray-500 mt-0.5">{facility.address}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {facility.price != null && (
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  {facility.currency === "USD" ? "$" : "£"}{facility.price}
                </span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
            )}
            {facility.rating != null && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-gray-900">{facility.rating}</span>
                {facility.reviewCount != null && (
                  <span className="text-sm text-gray-500">({facility.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {facility.features && facility.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {facility.features.map((feature) => (
                <span
                  key={feature}
                  className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onViewFullPage}
              className="flex-1 text-sm font-medium text-gray-700 py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              View full page
            </button>
            <button
              onClick={onRentalWithCora}
              className="flex-1 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 py-2.5 px-4 rounded-xl transition-colors"
            >
              Book with Cora
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HiveSearchView({
  messages = [],
  onSendMessage,
  isLoading = false,
  facilities = [],
  selectedFacility = null,
  onSelectFacility,
  onViewDetails,
  onRentalWithCora,
  onCollapse,
  onSwitchToFullSearch,
  renderMap,
  className,
}: HiveSearchViewProps) {
  const [input, setInput] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const [chatExpanded, setChatExpanded] = React.useState(false)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className={cn("flex h-full w-full gap-3 p-3 animate-in fade-in duration-500", className)}>
      <div
        className={cn(
          "flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-500 ease-in-out animate-in slide-in-from-left-4 fade-in duration-500",
          chatExpanded ? "w-[55%]" : "w-[40%]",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {onCollapse && (
              <button
                onClick={onCollapse}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="text-sm font-semibold text-gray-900">Cora Search</span>
            {facilities.length > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {facilities.length} results
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setChatExpanded(!chatExpanded)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title={chatExpanded ? "Shrink chat" : "Expand chat"}
            >
              {chatExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            {onSwitchToFullSearch && (
              <button
                onClick={onSwitchToFullSearch}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Full search
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isUser = msg.role === "user"
            const parts = msg.parts
            const hasParts = parts && parts.length > 0 && parts.some(
              (p) => p.type === "text" || p.type?.startsWith("tool-"),
            )

            if (hasParts) {
              return (
                <div key={msg.id} className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
                  {!isUser && msg.metadata?.routing && (
                    <ReasoningBlock routing={msg.metadata.routing} />
                  )}
                  {parts!.map((part, pi) => {
                    if (part.type === "text" && part.text) {
                      return (
                        <div
                          key={`${msg.id}-t-${pi}`}
                          className={cn(
                            "max-w-[90%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                            isUser
                              ? "bg-gray-100 text-gray-900 rounded-br-md"
                              : "bg-white border border-gray-100 text-gray-900 rounded-bl-md shadow-sm",
                          )}
                        >
                          <ChatMarkdown content={part.text} />
                        </div>
                      )
                    }

                    const toolName = part.toolName || (part.type?.startsWith("tool-") ? part.type.replace(/^tool-/, "") : null)
                    const isDone = isToolDone(part.state)
                    if (toolName === "searchFacilities" && isDone) {
                      const output = part.output as { facilities?: SearchFacility[] } | undefined
                      const facs = output?.facilities ?? []
                      if (facs.length > 0) {
                        return (
                          <div key={`${msg.id}-fac-${pi}`} className="w-full space-y-2 pt-1">
                            {facs.map((f) => (
                              <SearchFacilityCard
                                key={f.id}
                                facility={f}
                                isSelected={selectedFacility?.id === f.id}
                                isLoading={isLoading}
                                onSelect={() => onSelectFacility?.(f)}
                                onViewDetails={() => onViewDetails?.(f.id)}
                                onRentalWithCora={() => onRentalWithCora?.(f.id)}
                              />
                            ))}
                          </div>
                        )
                      }
                    }

                    if (toolName === "offerChoices" && isDone) {
                      const output = part.output as { choices?: { label: string; value: string }[] } | undefined
                      const choices = output?.choices ?? []
                      if (choices.length > 0) {
                        return (
                          <QuickReplyChips
                            key={`${msg.id}-qr-${pi}`}
                            choices={choices}
                            onSelect={(value) => onSendMessage?.(value)}
                          />
                        )
                      }
                    }

                    if (toolName === "startIdentityVerification" && isDone) {
                      const output = part.output as { url?: string | null; sessionRef?: string | null } | undefined
                      if (output?.url) {
                        return (
                          <VerificationCard
                            key={`${msg.id}-verify-${pi}`}
                            url={output.url}
                            sessionRef={output.sessionRef}
                            onVerified={() => onSendMessage?.("My identity is now verified, please continue with the rental")}
                          />
                        )
                      }
                    }

                    return null
                  })}
                </div>
              )
            }

            const content = msg.content?.trim()
            if (!content) return null

            return (
              <div
                key={msg.id}
                className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}
              >
                {!isUser && msg.metadata?.routing && (
                  <ReasoningBlock routing={msg.metadata.routing} />
                )}
                <div
                  className={cn(
                    "inline-block max-w-[90%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                    isUser
                      ? "bg-gray-100 text-gray-900 rounded-br-md"
                      : "bg-white border border-gray-100 text-gray-900 rounded-bl-md shadow-sm",
                  )}
                >
                  <ChatMarkdown content={content} />
                </div>
              </div>
            )
          })}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-100 bg-white">
          <div className="flex items-end gap-2 px-4 py-3">
            <button
              type="button"
              className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors rounded-lg flex-shrink-0 mb-0.5"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Cora..."
              rows={1}
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none leading-relaxed"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0 mb-0.5",
                input.trim() && !isLoading
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-gray-100 text-gray-300",
              )}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      <div
        className={cn(
          "relative flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-sm transition-all duration-500 ease-in-out animate-in slide-in-from-right-4 fade-in duration-500",
          chatExpanded ? "w-[45%]" : "w-[60%]",
        )}
      >
        {renderMap ? (
          renderMap({
            facilities,
            selectedFacility,
            onSelect: (f) => onSelectFacility?.(f),
          })
        ) : (
          <MapPlaceholder facilityCount={facilities.length} />
        )}

        {selectedFacility && (
          <FacilityDetailOverlay
            facility={selectedFacility}
            onClose={() => onSelectFacility?.(null as unknown as SearchFacility)}
            onViewFullPage={() => onViewDetails?.(selectedFacility.id)}
            onRentalWithCora={() => onRentalWithCora?.(selectedFacility.id)}
          />
        )}
      </div>
    </div>
  )
}

/** @deprecated Use HiveSearchView */
export const CoraSearchView = HiveSearchView
