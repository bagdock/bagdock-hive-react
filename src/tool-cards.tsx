"use client"

import * as React from "react"
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CreditCard,
  Crown,
  MapPin,
  Package,
  Search,
  Share2,
  Star,
  User,
} from "lucide-react"

import { cn, currencySymbol as getCurrencySymbol } from "./utils"
import type { SearchFacility, FacilityUnit } from "./types"

export function AgentRentalsToolCard({ data }: { data: Record<string, unknown> }) {
  const rentals = (data?.rentals ?? data?.bookings ?? []) as Array<Record<string, unknown>>
  if (rentals.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg text-xs text-gray-500">
        <Package className="w-3.5 h-3.5" />
        No rentals found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {rentals.slice(0, 5).map((b, i) => {
        const listing = b.listing as Record<string, unknown> | null
        const status = String(b.status ?? "unknown")
        const statusColor =
          status === "confirmed"
            ? "bg-green-50 text-green-700"
            : status === "pending"
              ? "bg-amber-50 text-amber-700"
              : status === "cancelled"
                ? "bg-red-50 text-red-700"
                : "bg-gray-50 text-gray-600"

        return (
          <div key={String(b.id ?? i)} className="border border-gray-200 rounded-lg px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {String(
                  listing?.facilityName ??
                    b.rentalReference ??
                    b.bookingReference ??
                    `Rental ${i + 1}`,
                )}
              </p>
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", statusColor)}>
                {status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              {b.agreedPricePence != null && (
                <span className="font-medium text-gray-700">
                  £{(Number(b.agreedPricePence) / 100).toFixed(0)}/
                  {String(b.billingFrequency ?? "mo")}
                </span>
              )}
              {typeof b.moveInDate === "string" && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(b.moveInDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        )
      })}
      {rentals.length > 5 && (
        <p className="text-xs text-gray-400 text-center">+ {rentals.length - 5} more rentals</p>
      )}
    </div>
  )
}

export function PaymentSummaryCard({ data }: { data: Record<string, unknown> }) {
  const nextPayment = data?.nextPayment as Record<string, unknown> | null
  const methods = (data?.methods ?? []) as Array<Record<string, unknown>>

  return (
    <div className="space-y-2">
      {nextPayment && (
        <div className="border border-gray-200 rounded-lg px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Next payment</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              £{(Number(nextPayment.amount ?? 0) / 100).toFixed(2)}
            </span>
            {typeof nextPayment.date === "string" && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(nextPayment.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </div>
        </div>
      )}
      {methods.length > 0 && (
        <div className="border border-gray-200 rounded-lg px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">
            Payment methods
          </p>
          <div className="space-y-1.5">
            {methods.map((m, i) => (
              <div
                key={String(m.id ?? i)}
                className="flex items-center gap-2 text-xs text-gray-700"
              >
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium">
                  {String(m.brand ?? "Card").toUpperCase()}
                </span>
                <span className="text-gray-500">····{String(m.last4 ?? "****")}</span>
                {!!m.isDefault && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {!nextPayment && methods.length === 0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg text-xs text-gray-500">
          <CreditCard className="w-3.5 h-3.5" />
          No payment info available
        </div>
      )}
    </div>
  )
}

export function DashboardSummaryCard({ data }: { data: Record<string, unknown> }) {
  const activeUnits = Number(data?.activeUnits ?? 0)
  const pendingTasks = Number(data?.pendingTasks ?? 0)
  const kycStatus = String(data?.kycStatus ?? "unknown")
  const nextPayment = data?.nextPayment as Record<string, unknown> | null

  return (
    <div className="border border-gray-200 rounded-lg px-3 py-2.5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Active units</p>
          <p className="text-lg font-bold text-gray-900">{activeUnits}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Pending tasks</p>
          <p className="text-lg font-bold text-gray-900">{pendingTasks}</p>
        </div>
        {nextPayment && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Next payment</p>
            <p className="text-sm font-semibold text-gray-900">
              £{(Number(nextPayment.amount ?? 0) / 100).toFixed(0)}
            </p>
          </div>
        )}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Verification</p>
          <span
            className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              kycStatus === "approved" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700",
            )}
          >
            {kycStatus}
          </span>
        </div>
      </div>
    </div>
  )
}

export function LoyaltyCard({ data }: { data: Record<string, unknown> }) {
  const profile = data?.profile as Record<string, unknown> | null
  const points = data?.points as Record<string, unknown> | null
  const tier = String(profile?.tier ?? points?.tier ?? "Member")
  const balance = Number(points?.balance ?? points?.points ?? profile?.points ?? 0)

  return (
    <div className="border border-gray-200 rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-2 mb-2">
        <Crown className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-semibold text-gray-900">{tier}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Points</p>
          <p className="text-base font-bold text-gray-900">{balance.toLocaleString()}</p>
        </div>
        {profile?.totalReferrals != null && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Referrals</p>
            <p className="text-base font-bold text-gray-900 flex items-center gap-1">
              <Share2 className="w-3 h-3 text-gray-400" />
              {String(profile.totalReferrals)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function AccountProfileCard({ data }: { data: Record<string, unknown> }) {
  const user = data?.user as Record<string, unknown> | null
  if (!user) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg text-xs text-gray-500">
        <User className="w-3.5 h-3.5" />
        Profile not available
      </div>
    )
  }

  const email = String(user.email ?? "")
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ")
  const verified = data?.needsEmailVerification === false

  return (
    <div className="border border-gray-200 rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-500" />
        </div>
        <div className="min-w-0 flex-1">
          {name && <p className="text-sm font-medium text-gray-900 truncate">{name}</p>}
          {email && <p className="text-xs text-gray-500 truncate">{email}</p>}
        </div>
        {verified && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 flex-shrink-0">
            Verified
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// FACILITY CHIP (compact name pill)
// ============================================================================

function FacilityChip({
  name,
  onClick,
}: {
  name: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--hive-color-surface,#f3f4f6)] border border-[var(--hive-color-border,#e5e7eb)] hover:border-[var(--hive-color-border-hover,#d1d5db)] text-xs font-medium text-[var(--hive-color-text,#374151)] transition-colors"
    >
      <MapPin className="w-3 h-3 text-[var(--hive-color-text-secondary,#9ca3af)] flex-shrink-0" />
      <span className="truncate max-w-[140px]">{name}</span>
    </button>
  )
}

// ============================================================================
// FACILITY CARD (detailed view for search results)
// ============================================================================

const UNIT_PILL_LIMIT = 3
const INITIAL_CARD_LIMIT = 3

function FacilityCardInline({
  facility,
  currSym,
  onDetails,
  onSelectUnit,
}: {
  facility: SearchFacility
  currSym: string
  onDetails?: (name: string) => void
  onSelectUnit?: (facilityName: string, unit: FacilityUnit) => void
}) {
  const [unitsExpanded, setUnitsExpanded] = React.useState(false)
  const units = facility.units ?? []
  const displayedUnits = unitsExpanded ? units : units.slice(0, UNIT_PILL_LIMIT)
  const hasMoreUnits = units.length > UNIT_PILL_LIMIT
  const price = facility.priceFrom ?? facility.price
  const reviews = facility.totalReviews ?? facility.reviewCount

  return (
    <div className="border border-[var(--hive-color-border,#e5e7eb)] rounded-lg hover:border-[var(--hive-color-border-hover,#d1d5db)] transition-all overflow-hidden">
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--hive-color-text,#111827)] truncate">{facility.name}</p>
            {facility.address && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[var(--hive-color-text-secondary,#9ca3af)] flex-shrink-0" />
                <span className="text-xs text-[var(--hive-color-text-secondary,#6b7280)] truncate">{facility.address}</span>
              </div>
            )}
          </div>
          {price != null && (
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-[var(--hive-color-text,#111827)]">{currSym}{price.toFixed(0)}</p>
              <p className="text-[10px] text-[var(--hive-color-text-secondary,#9ca3af)]">/mo</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          {facility.rating != null && facility.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium text-[var(--hive-color-text,#374151)]">{facility.rating.toFixed(1)}</span>
              {reviews != null && (
                <span className="text-xs text-[var(--hive-color-text-secondary,#9ca3af)]">({reviews})</span>
              )}
            </div>
          )}
          <button
            onClick={() => onDetails?.(facility.name)}
            className="flex items-center gap-0.5 text-xs font-medium text-[var(--hive-color-text-secondary,#6b7280)] hover:text-[var(--hive-color-text,#374151)] transition-colors"
          >
            Full details
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {units.length > 0 && (
        <div className="border-t border-[var(--hive-color-border,#e5e7eb)] px-3 py-2 bg-[var(--hive-color-surface,#f9fafb)]">
          <button
            onClick={() => setUnitsExpanded(!unitsExpanded)}
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--hive-color-text-secondary,#6b7280)] mb-1.5 hover:text-[var(--hive-color-text,#374151)] transition-colors"
          >
            {units.length} unit size{units.length !== 1 ? "s" : ""} available
            {hasMoreUnits && (
              unitsExpanded
                ? <ChevronUp className="w-3 h-3" />
                : <ChevronDown className="w-3 h-3" />
            )}
          </button>
          <div className="flex flex-wrap gap-1.5">
            {displayedUnits.map((unit) => (
              <button
                key={unit.size}
                onClick={() => onSelectUnit?.(facility.name, unit)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--hive-color-surface-user,#ffffff)] border border-[var(--hive-color-border,#e5e7eb)] hover:border-[var(--hive-color-border-hover,#d1d5db)] text-[11px] font-medium text-[var(--hive-color-text,#374151)] transition-colors"
              >
                <span>{unit.size}</span>
                <span className="text-[var(--hive-color-text-secondary,#9ca3af)]">&middot;</span>
                <span className="text-[var(--hive-color-text,#111827)]">{currSym}{unit.price.toFixed(0)}/mo</span>
              </button>
            ))}
            {hasMoreUnits && !unitsExpanded && (
              <button
                onClick={() => setUnitsExpanded(true)}
                className="inline-flex items-center px-2 py-1 rounded-full bg-[var(--hive-color-surface-user,#ffffff)] border border-dashed border-[var(--hive-color-border,#d1d5db)] text-[11px] text-[var(--hive-color-text-secondary,#9ca3af)] hover:text-[var(--hive-color-text,#374151)] transition-colors"
              >
                +{units.length - UNIT_PILL_LIMIT} more
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SEARCH RESULTS CARD (default rendering for searchFacilities)
// ============================================================================

interface SearchResultsOutput {
  facilities?: Array<Record<string, unknown>>
  city?: string
  total?: number
}

function parseFacility(raw: Record<string, unknown>): SearchFacility {
  const units = Array.isArray(raw.units)
    ? (raw.units as Array<Record<string, unknown>>).flatMap((u) => {
        const size = String(u.size ?? u.sizeDescription ?? "").trim()
        const price = Number(u.price ?? u.pricePerMonth)
        if (!size || !Number.isFinite(price)) return []
        return [{ size, sqft: Number(u.sqft ?? u.sizeSqft ?? 0), price }]
      })
    : []

  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    address: typeof raw.address === "string"
      ? raw.address
      : raw.address && typeof raw.address === "object"
        ? [
            (raw.address as Record<string, unknown>).line1 ?? (raw.address as Record<string, unknown>).street,
            (raw.address as Record<string, unknown>).city,
            (raw.address as Record<string, unknown>).postcode,
          ].filter(Boolean).join(", ")
        : undefined,
    city: (typeof raw.address === "object" && raw.address
      ? (raw.address as Record<string, unknown>).city as string | undefined
      : raw.city as string | undefined),
    priceFrom: typeof raw.priceFrom === "number" ? raw.priceFrom : undefined,
    price: typeof raw.price === "number" ? raw.price : undefined,
    currency: (raw.currency as string) ?? "GBP",
    rating: typeof raw.rating === "number" ? raw.rating : undefined,
    totalReviews: typeof raw.totalReviews === "number" ? raw.totalReviews : undefined,
    reviewCount: typeof raw.reviewCount === "number" ? raw.reviewCount : undefined,
    features: raw.features as string[] | undefined,
    units,
    unitCount: typeof raw.unitCount === "number" ? raw.unitCount : units.length,
  }
}

export function SearchResultsCard({
  data,
  onSendMessage,
}: {
  data: Record<string, unknown>
  onSendMessage?: (msg: string) => void
}) {
  const [expanded, setExpanded] = React.useState(false)
  const output = data as SearchResultsOutput
  const rawFacilities = Array.isArray(output.facilities) ? output.facilities : []
  const facilities = rawFacilities.flatMap((f) =>
    f && typeof f === "object" && !Array.isArray(f)
      ? [parseFacility(f as Record<string, unknown>)]
      : [],
  )
  const city = output.city

  if (facilities.length === 0) return null

  const lowestPrice = Math.min(
    ...facilities.map((f) => f.priceFrom ?? f.price ?? Infinity),
  )
  const currSym = getCurrencySymbol(facilities[0]?.currency ?? "GBP")

  const displayed = expanded ? facilities : facilities.slice(0, INITIAL_CARD_LIMIT)
  const hasMore = facilities.length > INITIAL_CARD_LIMIT

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-[var(--hive-color-text-secondary,#6b7280)]">
        <Search className="w-3 h-3" />
        <span>
          <span className="font-medium text-[var(--hive-color-text,#374151)]">{facilities.length}</span>
          {" "}facilit{facilities.length === 1 ? "y" : "ies"}
          {city ? ` in ${city}` : ""}
          {lowestPrice < Infinity && (
            <> from <span className="font-medium text-[var(--hive-color-text,#374151)]">{currSym}{lowestPrice.toFixed(0)}/mo</span></>
          )}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {facilities.slice(0, 5).map((f) => (
          <FacilityChip
            key={f.id}
            name={f.name}
            onClick={() => onSendMessage?.(`Tell me more about ${f.name}`)}
          />
        ))}
      </div>

      <div className="space-y-2">
        {displayed.map((f) => (
          <FacilityCardInline
            key={f.id}
            facility={f}
            currSym={currSym}
            onDetails={(name) => onSendMessage?.(`Tell me more about ${name}`)}
            onSelectUnit={(name, unit) => onSendMessage?.(`I'd like the ${unit.size} unit at ${name}`)}
          />
        ))}
      </div>

      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1 w-full justify-center py-2 text-xs font-medium text-[var(--hive-color-text-secondary,#6b7280)] hover:text-[var(--hive-color-text,#374151)] hover:bg-[var(--hive-color-surface,#f9fafb)] rounded-lg transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Show {facilities.length - INITIAL_CARD_LIMIT} more
        </button>
      )}
    </div>
  )
}

// ============================================================================
// FACILITY DETAIL CARD (default rendering for selectFacility / openPreview)
// ============================================================================

export function FacilityDetailCard({ data }: { data: Record<string, unknown> }) {
  const raw = (data.facility ?? data) as Record<string, unknown> | null
  if (!raw || !raw.name) return null

  const name = String(raw.name)
  const address = typeof raw.address === "string"
    ? raw.address
    : raw.address && typeof raw.address === "object"
      ? [
          (raw.address as Record<string, unknown>).line1 ?? (raw.address as Record<string, unknown>).street,
          (raw.address as Record<string, unknown>).city,
          (raw.address as Record<string, unknown>).postcode,
        ].filter(Boolean).join(", ")
      : undefined
  const price = typeof raw.priceFrom === "number"
    ? raw.priceFrom
    : typeof raw.price === "number"
      ? raw.price
      : typeof raw.base_price === "number"
        ? raw.base_price / 100
        : null
  const currency = (raw.currency as string) ?? "GBP"
  const currSym = getCurrencySymbol(currency)
  const rating = typeof raw.rating === "number" ? raw.rating : null
  const reviews = typeof raw.totalReviews === "number"
    ? raw.totalReviews
    : typeof raw.reviewCount === "number"
      ? raw.reviewCount
      : null
  const features = (raw.features as string[] | undefined) ?? []

  return (
    <div className="border border-[var(--hive-color-border,#e5e7eb)] rounded-lg overflow-hidden">
      <div className="p-3">
        <p className="text-sm font-semibold text-[var(--hive-color-text,#111827)]">{name}</p>
        {address && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-[var(--hive-color-text-secondary,#9ca3af)] flex-shrink-0" />
            <span className="text-xs text-[var(--hive-color-text-secondary,#6b7280)]">{String(address)}</span>
          </div>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          {price != null && (
            <span className="text-sm font-bold text-[var(--hive-color-text,#111827)]">
              {currSym}{price.toFixed(0)}<span className="text-xs font-normal text-[var(--hive-color-text-secondary,#6b7280)]">/mo</span>
            </span>
          )}
          {rating != null && rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium text-[var(--hive-color-text,#374151)]">{rating.toFixed(1)}</span>
              {reviews != null && (
                <span className="text-xs text-[var(--hive-color-text-secondary,#9ca3af)]">({reviews})</span>
              )}
            </div>
          )}
        </div>
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {features.slice(0, 6).map((f) => (
              <span
                key={f}
                className="px-2 py-0.5 rounded-full bg-[var(--hive-color-surface,#f3f4f6)] text-[10px] font-medium text-[var(--hive-color-text-secondary,#6b7280)]"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// DEFAULT TOOL RESULT RENDERER
// ============================================================================

// ============================================================================
// DatePickerCard — Agent tool card for move-in / move-out date selection
// ============================================================================

export function DatePickerCard({
  suggestedMoveIn,
  suggestedMoveOut,
  onConfirm,
}: {
  suggestedMoveIn?: string | null
  suggestedMoveOut?: string | null
  onConfirm?: (dates: { moveIn: string; moveOut?: string | null }) => void
}) {
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]!

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]!

  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().split("T")[0]!

  const thisWeekend = (() => {
    const d = new Date(today)
    const day = d.getDay()
    const daysUntilSat = (6 - day + 7) % 7 || 7
    d.setDate(d.getDate() + daysUntilSat)
    return d.toISOString().split("T")[0]!
  })()

  const [moveIn, setMoveIn] = React.useState<string>(suggestedMoveIn || todayStr)
  const [moveOut, setMoveOut] = React.useState<string | null>(suggestedMoveOut || null)
  const [moveOutMode, setMoveOutMode] = React.useState<"flexible" | "1month" | "3months" | "6months" | "12months" | "custom">(
    suggestedMoveOut ? "custom" : "flexible",
  )
  const [calendarMonth, setCalendarMonth] = React.useState(new Date(suggestedMoveIn || todayStr))
  const [selectingFor, setSelectingFor] = React.useState<"moveIn" | "moveOut">("moveIn")
  const [confirmed, setConfirmed] = React.useState(false)

  const moveInChips = [
    { label: "Today", value: todayStr },
    { label: "Tomorrow", value: tomorrowStr },
    { label: "This wknd", value: thisWeekend },
    { label: "Next week", value: nextWeekStr },
  ]

  const computeMoveOut = React.useCallback(
    (mode: string, fromDate: string): string | null => {
      if (mode === "flexible") return null
      const d = new Date(fromDate)
      if (mode === "1month") d.setMonth(d.getMonth() + 1)
      else if (mode === "3months") d.setMonth(d.getMonth() + 3)
      else if (mode === "6months") d.setMonth(d.getMonth() + 6)
      else if (mode === "12months") d.setMonth(d.getMonth() + 12)
      else return moveOut
      return d.toISOString().split("T")[0]!
    },
    [moveOut],
  )

  const handleMoveOutModeChange = React.useCallback(
    (mode: "flexible" | "1month" | "3months" | "6months" | "12months" | "custom") => {
      setMoveOutMode(mode)
      if (mode === "custom") {
        setSelectingFor("moveOut")
      } else {
        setMoveOut(computeMoveOut(mode, moveIn))
      }
    },
    [moveIn, computeMoveOut],
  )

  const daysInMonth = (yr: number, mo: number) => new Date(yr, mo + 1, 0).getDate()
  const year = calendarMonth.getFullYear()
  const month = calendarMonth.getMonth()
  const monthYear = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const adjustedFirstDay = (firstDayOfMonth + 6) % 7
  const totalDays = daysInMonth(year, month)

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    if (dateStr < todayStr) return
    if (selectingFor === "moveIn") {
      setMoveIn(dateStr)
      if (moveOut && dateStr > moveOut) setMoveOut(null)
    } else {
      if (dateStr >= moveIn) {
        setMoveOut(dateStr)
        setMoveOutMode("custom")
      }
    }
  }

  const formatDate = (d: string) => {
    const date = new Date(d + "T12:00:00")
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const accent = "var(--hive-color-accent,#4f46e5)"
  const accentHover = "var(--hive-color-accent-hover,#4338ca)"
  const surface = "var(--hive-color-surface,#ffffff)"
  const border = "var(--hive-color-border,#e5e7eb)"
  const textPrimary = "var(--hive-color-text,#111827)"
  const textSecondary = "var(--hive-color-text-secondary,#6b7280)"
  const textMuted = "var(--hive-color-text-secondary,#9ca3af)"

  if (confirmed) {
    return (
      <div
        className="max-w-[90%] rounded-2xl overflow-hidden mb-2"
        style={{ border: `1px solid ${border}`, background: surface }}
      >
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" style={{ color: accent }} />
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: textMuted }}>
                  Move-in
                </span>
                <p className="text-sm font-semibold -mt-0.5" style={{ color: textPrimary }}>
                  {formatDate(moveIn)}
                </p>
              </div>
            </div>
            <div className="w-px h-6" style={{ background: border }} />
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" style={{ color: accent }} />
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: textMuted }}>
                  Move-out
                </span>
                <p className="text-sm font-semibold -mt-0.5" style={{ color: textPrimary }}>
                  {moveOut ? formatDate(moveOut) : "Flexible"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setConfirmed(false)
              setSelectingFor("moveIn")
            }}
            className="text-[11px] font-medium transition-colors ml-3 shrink-0"
            style={{ color: accent }}
          >
            Edit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="max-w-[90%] rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${border}`, background: surface }}
    >
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${border}` }}>
        <h4 className="text-sm font-semibold" style={{ color: textPrimary }}>
          When do you need storage?
        </h4>
      </div>
      <div className="px-4 py-3 space-y-4">
        {/* Move-in section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-medium"
              style={{ color: selectingFor === "moveIn" ? accent : textSecondary }}
            >
              Move in{" "}
              {moveIn && (
                <span className="font-normal ml-1" style={{ color: textMuted }}>
                  {formatDate(moveIn)}
                </span>
              )}
            </span>
            <button
              onClick={() => setSelectingFor("moveIn")}
              className="text-[10px] font-medium"
              style={{ color: selectingFor === "moveIn" ? accent : textMuted }}
            >
              {selectingFor === "moveIn" ? "selecting" : "edit"}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {moveInChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => {
                  setMoveIn(chip.value)
                  setSelectingFor("moveIn")
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  moveIn === chip.value
                    ? { background: accent, color: "#fff", border: `1px solid ${accent}` }
                    : { background: surface, color: textSecondary, border: `1px solid ${border}` }
                }
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mini calendar */}
        <div className="rounded-xl p-2" style={{ border: `1px solid ${border}` }}>
          <div className="flex items-center justify-between mb-2 px-1">
            <button
              onClick={() => setCalendarMonth(new Date(year, month - 1))}
              className="p-1 rounded"
            >
              <ChevronDown className="w-3.5 h-3.5 rotate-90" style={{ color: textMuted }} />
            </button>
            <span className="text-xs font-semibold" style={{ color: textPrimary }}>
              {monthYear}
            </span>
            <button
              onClick={() => setCalendarMonth(new Date(year, month + 1))}
              className="p-1 rounded"
            >
              <ChevronDown className="w-3.5 h-3.5 -rotate-90" style={{ color: textMuted }} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0 text-center">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div key={d} className="text-[10px] font-medium py-0.5" style={{ color: textMuted }}>
                {d}
              </div>
            ))}
            {Array.from({ length: adjustedFirstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const isPast = dateStr < todayStr
              const isSelected = dateStr === moveIn || dateStr === moveOut
              const isInRange = moveIn && moveOut && dateStr > moveIn && dateStr < moveOut
              return (
                <button
                  key={day}
                  disabled={isPast}
                  onClick={() => handleDayClick(day)}
                  className="w-7 h-7 mx-auto text-[11px] rounded-full transition-all"
                  style={
                    isPast
                      ? { color: "#d1d5db", cursor: "not-allowed" }
                      : isSelected
                        ? { background: accent, color: "#fff", fontWeight: 600 }
                        : isInRange
                          ? { background: `color-mix(in srgb, ${accent} 10%, transparent)`, color: accent }
                          : { color: textPrimary }
                  }
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {/* Move-out section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-medium"
              style={{ color: selectingFor === "moveOut" ? accent : textSecondary }}
            >
              Move out{" "}
              {moveOut && (
                <span className="font-normal ml-1" style={{ color: textMuted }}>
                  {formatDate(moveOut)}
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { label: "Flexible", mode: "flexible" as const },
                { label: "1 month", mode: "1month" as const },
                { label: "3 months", mode: "3months" as const },
                { label: "6 months", mode: "6months" as const },
                { label: "12 months", mode: "12months" as const },
                { label: "Pick date", mode: "custom" as const },
              ] as const
            ).map((chip) => (
              <button
                key={chip.mode}
                onClick={() => handleMoveOutModeChange(chip.mode)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  moveOutMode === chip.mode
                    ? { background: accent, color: "#fff", border: `1px solid ${accent}` }
                    : { background: surface, color: textSecondary, border: `1px solid ${border}` }
                }
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm */}
        <button
          onClick={() => {
            setConfirmed(true)
            onConfirm?.({ moveIn, moveOut: moveOut || null })
          }}
          className="w-full py-2.5 text-sm font-semibold rounded-xl transition-colors"
          style={{ background: accent, color: "#fff" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = accentHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = accent)}
        >
          Confirm dates
        </button>
      </div>
    </div>
  )
}

export function defaultRenderToolResult(
  toolName: string,
  output: unknown,
  onSendMessage?: (msg: string) => void,
): React.ReactNode | null {
  const data = (output ?? {}) as Record<string, unknown>

  switch (toolName) {
    case "searchFacilities":
      return <SearchResultsCard data={data} onSendMessage={onSendMessage} />
    case "selectFacility":
    case "openPreview":
      return <FacilityDetailCard data={data} />
    case "getMyRentals":
      return <AgentRentalsToolCard data={data} />
    case "getMyPaymentMethods":
    case "getMyNextPayment":
      return <PaymentSummaryCard data={data} />
    case "getDashboardSummary":
      return <DashboardSummaryCard data={data} />
    case "getMyProfile":
      return <AccountProfileCard data={data} />
    case "getMyLoyalty":
      return <LoyaltyCard data={data} />
    case "collectDates":
      return (
        <DatePickerCard
          suggestedMoveIn={data.suggestedMoveIn as string | undefined}
          suggestedMoveOut={data.suggestedMoveOut as string | undefined}
          onConfirm={
            onSendMessage
              ? (dates) =>
                  onSendMessage(
                    `Move-in: ${dates.moveIn}${dates.moveOut ? `, Move-out: ${dates.moveOut}` : ", flexible move-out"}`,
                  )
              : undefined
          }
        />
      )
    default:
      return null
  }
}
