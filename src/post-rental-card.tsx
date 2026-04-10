"use client"

import * as React from "react"
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Fingerprint,
  LayoutDashboard,
  ShoppingBag,
} from "lucide-react"

export interface HivePostRentalCardProps {
  facilityName: string
  unitSize: string
  monthlyPrice: number
  currency: string
  identityVerified: boolean
  rentalFlowType: "rent" | "reserve"
  addOnsDeclined: boolean
  dashboardUrl: string
  onVerifyIdentity?: () => void
  onManageUnit?: () => void
}

export function HivePostRentalCard({
  facilityName,
  unitSize,
  monthlyPrice,
  currency,
  identityVerified,
  rentalFlowType,
  addOnsDeclined,
  dashboardUrl,
  onVerifyIdentity,
  onManageUnit,
}: HivePostRentalCardProps) {
  const sym = currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">
              {rentalFlowType === "reserve" ? "Reservation confirmed" : "Rental confirmed"}
            </p>
            <p className="text-indigo-200 text-xs">{facilityName}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{unitSize}</span>
          <span className="font-semibold text-gray-900">
            {sym}
            {monthlyPrice.toFixed(2)}/mo
          </span>
        </div>

        {identityVerified ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-xs text-green-700 font-medium">Identity verified</p>
          </div>
        ) : (
          <div className="px-3 py-2.5 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">Verify identity before move-in</p>
            </div>
            {onVerifyIdentity && (
              <button
                onClick={onVerifyIdentity}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                Verify now
              </button>
            )}
          </div>
        )}

        {rentalFlowType === "reserve" && (
          <p className="text-xs text-gray-500">
            Your reservation is held for 48 hours. Confirm it from your dashboard.
          </p>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <a
            href={dashboardUrl}
            onClick={(e) => {
              if (onManageUnit) {
                e.preventDefault()
                onManageUnit()
              }
            }}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Manage your unit
            <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
          </a>

          {addOnsDeclined && (
            <a
              href={`${dashboardUrl}?tab=extras`}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add insurance or extras
              <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/** @deprecated Use HivePostRentalCard */
export const PostRentalCard = HivePostRentalCard
