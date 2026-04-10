"use client"

import * as React from "react"
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Fingerprint,
  Loader2,
  Lock,
  Phone,
  Shield,
} from "lucide-react"

import { cn } from "./utils"

export const TOOL_STEP_LABELS: Record<string, string> = {
  searchFacilities: "Searching facilities",
  selectFacility: "Loading facility details",
  openPreview: "Opening preview",
  openMapView: "Opening map view",
  startCheckout: "Starting checkout",
  getMyRentals: "Checking your rentals",
  getMyPaymentMethods: "Looking up payment methods",
  getMyNextPayment: "Checking next payment",
  getDashboardSummary: "Loading account overview",
  getMyProfile: "Checking your profile",
  getMyLoyalty: "Loading loyalty status",
  checkVerificationStatus: "Checking identity verification",
  startIdentityVerification: "Starting identity verification",
  requestPriceReduction: "Requesting price reduction",
  escalateToOperator: "Contacting operator",
  checkNegotiationStatus: "Checking negotiation",
  offerChoices: "",

  getRentalHistory: "Loading rental history",
  getRentalDetail: "Loading rental details",
  getPaymentMethods: "Looking up payment methods",
  getMyActivities: "Loading recent activity",
  getMyTasks: "Checking pending tasks",
  getUpcomingMoveIns: "Checking upcoming moves",
  getMyContracts: "Loading your contracts",
  getMyInvoices: "Loading your invoices",
  getMySubscriptions: "Loading your subscriptions",
  getMyMoveEvents: "Loading move events",

  getMyAccessUnits: "Loading your access units",
  unlockUnit: "Unlocking unit",
  getMyAccessCodes: "Loading access codes",

  getOperatorOverview: "Loading operator overview",
  getFacilitySnapshot: "Loading facility data",
  listFacilities: "Loading facilities",

  listTickets: "Loading tickets",
  getTicket: "Fetching ticket details",
  createTicket: "Creating ticket",
  assignTicket: "Assigning ticket",
  closeTicket: "Closing ticket",

  getRevenueAnalytics: "Pulling revenue analytics",
  getOccupancyAnalytics: "Checking occupancy",
  getChurnAnalytics: "Analysing churn",
  getMarketingAnalytics: "Loading marketing metrics",
  getMoveStatistics: "Pulling move statistics",
  createCustomReport: "Generating report",
  exportReport: "Exporting report",

  listGoals: "Loading pipeline goals",
  getGoal: "Fetching goal details",
  createGoal: "Creating goal",
  moveGoalStage: "Updating pipeline stage",
  getPipelineSummary: "Loading pipeline summary",
  getPipelineForecast: "Generating forecast",

  listContacts: "Searching contacts",
  getContact: "Loading contact details",
  createContact: "Creating contact",
  updateContact: "Updating contact",
  convertLead: "Converting lead",
  getContactTenancies: "Loading contact tenancies",

  listCompanies: "Loading companies",
  getCompany: "Fetching company details",
  createCompany: "Creating company",
  listCompanyContacts: "Loading company contacts",
  listCompanyFacilities: "Loading company facilities",
  associateCompanyFacility: "Linking company to facility",
  listCompanyUnits: "Loading company units",
  associateCompanyUnit: "Linking company to unit",
  associateCompanyContact: "Linking contact to company",

  listTenancies: "Loading tenancies",
  getTenancy: "Fetching tenancy details",
  listSubscriptions: "Loading subscriptions",
  pauseSubscription: "Pausing subscription",
  cancelSubscription: "Cancelling subscription",
  listMoveEvents: "Loading move events",
  getMoveEvent: "Fetching move event details",
  scheduleMoveEvent: "Scheduling move event",
  updateMoveEvent: "Updating move event",
  completeMoveEvent: "Completing move event",

  listOverdueInvoices: "Loading overdue invoices",
  getAgingReport: "Generating aging report",
  sendInvoice: "Sending invoice",
  recordPayment: "Recording payment",
  createCreditNote: "Creating credit note",

  listUnits: "Loading units",
  getUnit: "Fetching unit details",
  listUnitTypes: "Loading unit types",
  listPricingPlans: "Loading pricing plans",
  createUnit: "Creating unit",
  updateUnit: "Updating unit",
  deleteUnit: "Deleting unit",
  createUnitType: "Creating unit type",
  updateUnitType: "Updating unit type",
  copyUnitType: "Copying unit type",

  listIssues: "Loading issues",
  createIssue: "Creating issue",
  completeIssue: "Completing issue",
  listProjects: "Loading projects",
  createProject: "Creating project",

  listConversations: "Loading conversations",
  getConversation: "Fetching conversation",
  summariseConversation: "Summarising conversation",
  sendConversationMessage: "Sending message",

  listAccessSystems: "Loading access systems",
  listAccessPoints: "Loading access points",
  getAccessPointHealth: "Checking access point health",
  remoteOpenDoor: "Opening door remotely",
  listAccessGrants: "Loading access grants",
  createAccessGrant: "Creating access grant",

  listInsuranceContracts: "Loading insurance contracts",
  sendInsuranceContract: "Sending insurance contract",
  listProtectionProducts: "Loading protection products",

  getTrialBalance: "Loading trial balance",
  getRevenueSummary: "Loading revenue summary",
  getJournalEntries: "Loading journal entries",
  getVatSummary: "Loading VAT summary",
  getReconciliation: "Running reconciliation",
  getAccountingConnectionStatus: "Checking accounting connections",
  getExternalBalances: "Fetching external balances",
  getExternalProfitAndLoss: "Fetching external P&L",
  compareInternalVsExternal: "Comparing internal vs external",

  listListings: "Loading listings",
  getListing: "Fetching listing details",
  createListing: "Creating listing",
  updateListing: "Updating listing",
  getListingPerformance: "Loading listing performance",
}

export const HIDDEN_TOOL_STEPS = new Set(["offerChoices"])

export function isToolDone(state?: string): boolean {
  return state === "result" || state === "output-available" || !state
}

export function isToolError(state?: string): boolean {
  return state === "error" || state === "output-error"
}

export function ToolExecutionStep({
  toolName,
  state,
  children,
}: {
  toolName: string
  state?: string
  children?: React.ReactNode
}) {
  const label = TOOL_STEP_LABELS[toolName] ?? toolName
  const done = isToolDone(state)
  const error = isToolError(state)

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 py-1">
        {done ? (
          <div
            className={cn(
              "w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0",
              error ? "bg-red-50" : "bg-gray-100",
            )}
          >
            {error ? (
              <AlertCircle className="w-3 h-3 text-red-400" />
            ) : (
              <Check className="w-3 h-3 text-gray-500" />
            )}
          </div>
        ) : (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />
        )}
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-[10px] text-gray-400 ml-auto">
          {done ? (error ? "Failed" : "Done") : "Working\u2026"}
        </span>
      </div>
      {done && children && <div className="pl-6 mt-1">{children}</div>}
    </div>
  )
}

export function QuickReplyChips({
  choices,
  onSelect,
  disabled: externalDisabled,
}: {
  choices: { label: string; value: string }[]
  onSelect?: (value: string) => void
  disabled?: boolean
}) {
  const [picked, setPicked] = React.useState<string | null>(null)
  const isDisabled = externalDisabled || picked !== null

  return (
    <div className="flex flex-wrap gap-1.5 max-w-[90%]">
      {choices.map((c) => (
        <button
          key={c.value}
          disabled={isDisabled}
          onClick={() => {
            setPicked(c.value)
            onSelect?.(c.value)
          }}
          className={cn(
            "text-sm px-3.5 py-1.5 rounded-full border transition-all duration-200",
            picked === c.value
              ? "bg-gray-900 text-white border-gray-900"
              : isDisabled
                ? "bg-white text-gray-300 border-gray-100 cursor-default"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer",
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}

export function VerificationCard({
  url,
  sessionRef,
  onVerified,
  pollingUrl = "/api/agent/verification-status",
}: {
  url?: string | null
  sessionRef?: string | null
  onVerified?: () => void
  pollingUrl?: string
}) {
  const [verificationState, setVerificationState] = React.useState<
    "pending" | "approved" | "declined" | "error"
  >("pending")
  const onVerifiedRef = React.useRef(onVerified)
  onVerifiedRef.current = onVerified

  const resolvedPollingUrl = React.useMemo(() => {
    if (!sessionRef) return pollingUrl
    const sep = pollingUrl.includes("?") ? "&" : "?"
    return `${pollingUrl}${sep}sessionRef=${encodeURIComponent(sessionRef)}`
  }, [pollingUrl, sessionRef])

  React.useEffect(() => {
    if (!url || verificationState !== "pending") return
    let active = true
    let pollCount = 0
    const MAX_POLLS = 30

    const poll = async () => {
      if (!active || pollCount >= MAX_POLLS) return
      pollCount++
      try {
        const res = await fetch(resolvedPollingUrl)
        if (!res.ok) return
        const data = (await res.json()) as { status?: string }
        if (!active) return
        if (data.status === "approved" || data.status === "verified") {
          setVerificationState("approved")
          onVerifiedRef.current?.()
          return
        }
        if (data.status === "declined") {
          setVerificationState("declined")
          return
        }
      } catch {
        /* transient */
      }

      if (!active || pollCount >= MAX_POLLS) return
      const delay = pollCount <= 6 ? 5_000 : 15_000
      setTimeout(poll, delay)
    }

    const timer = setTimeout(poll, 3_000)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [url, verificationState, resolvedPollingUrl])

  if (!url) return null

  if (verificationState === "approved") {
    return (
      <div className="max-w-[90%] rounded-2xl border border-green-200 bg-white overflow-hidden shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Identity verified</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Verification complete &mdash; you&apos;re all set
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[90%] rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="px-4 pt-4 pb-3.5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Fingerprint className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Identity verification required</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Quick and secure via Didit. This is a one-time process.
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Shield className="w-4 h-4" />
          Verify identity
          <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
        </a>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SecurePhoneInput — trust-signal card for collecting phone numbers in chat
// ---------------------------------------------------------------------------

const DEFAULT_PHONE_COUNTRY_CODES = [
  { code: "+44", flag: "\ud83c\uddec\ud83c\udde7", name: "UK" },
  { code: "+1", flag: "\ud83c\uddfa\ud83c\uddf8", name: "US" },
  { code: "+353", flag: "\ud83c\uddee\ud83c\uddea", name: "IE" },
  { code: "+49", flag: "\ud83c\udde9\ud83c\uddea", name: "DE" },
  { code: "+33", flag: "\ud83c\uddeb\ud83c\uddf7", name: "FR" },
  { code: "+61", flag: "\ud83c\udde6\ud83c\uddfa", name: "AU" },
  { code: "+91", flag: "\ud83c\uddee\ud83c\uddf3", name: "IN" },
]

export interface SecurePhoneInputProps {
  reason?: string
  onSubmit: (phone: string) => void
  defaultCountryCode?: string
  countryCodes?: { code: string; flag: string; name: string }[]
}

export function SecurePhoneInput({
  reason,
  onSubmit,
  defaultCountryCode = "+44",
  countryCodes = DEFAULT_PHONE_COUNTRY_CODES,
}: SecurePhoneInputProps) {
  const [countryCode, setCountryCode] = React.useState(defaultCountryCode)
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = () => {
    if (!phoneNumber.trim()) return
    const full = `${countryCode}${phoneNumber.replace(/\s/g, "")}`
    setSubmitted(true)
    onSubmit(full)
  }

  if (submitted) {
    return (
      <div className="max-w-[90%] rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-4 flex items-center gap-2.5">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-gray-700">Phone number submitted</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[90%] rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5">
        <Lock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Secure callback</p>
          {reason && (
            <p className="text-xs text-gray-500 mt-0.5">{reason}</p>
          )}
        </div>
      </div>

      <div className="px-4 py-3.5 space-y-2.5">
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-20 px-2 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-gray-300 bg-white"
          >
            {countryCodes.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Phone number"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!phoneNumber.trim()}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Phone className="w-3.5 h-3.5" />
          Confirm number
        </button>

        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          Your number is shared only with the operator for this callback.
        </p>
      </div>
    </div>
  )
}
