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
  const units = (raw.units as Array<Record<string, unknown>> | undefined)?.map((u) => ({
    size: String(u.size ?? u.sizeDescription ?? ""),
    sqft: Number(u.sqft ?? u.sizeSqft ?? 0),
    price: Number(u.price ?? u.pricePerMonth ?? 0),
  })) ?? []

  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    address: raw.address as string | undefined,
    city: raw.city as string | undefined,
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
  const rawFacilities = output.facilities ?? []
  const facilities = rawFacilities.map((f) => parseFacility(f as Record<string, unknown>))
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
  const address = raw.address as string | undefined
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
    default:
      return null
  }
}
