"use client"

import * as React from "react"
import {
  Calendar,
  CreditCard,
  Crown,
  Package,
  Share2,
  User,
} from "lucide-react"

import { cn } from "./utils"

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

export function defaultRenderToolResult(toolName: string, output: unknown): React.ReactNode | null {
  const data = (output ?? {}) as Record<string, unknown>

  switch (toolName) {
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
