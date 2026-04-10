"use client"

import * as React from "react"
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronUp,
  CreditCard,
  FileText,
  Fingerprint,
  Loader2,
  Plus,
  Shield,
  Sparkles,
  X,
} from "lucide-react"

import { cn } from "./utils"
import type { PricingPlan, AddOn, ProtectionPlan } from "./types"

type CheckoutStep = "summary" | "contact" | "identity" | "protection" | "payment" | "complete"
type ReserveStep = "summary" | "contact" | "complete"

export interface HiveCheckoutFlowProps {
  facilityId: string
  facilityName: string
  unitTypeId: string
  unitSize: string
  monthlyPrice: number
  currency?: string
  pinned?: boolean

  userEmail?: string
  userName?: string
  userPhone?: string

  availablePlans?: PricingPlan[]
  selectedPlanId?: string | null
  onPlanChange?: (planId: string) => void

  availableAddOns?: AddOn[]
  selectedAddOnIds?: string[]
  onAddOnsChange?: (ids: string[]) => void

  rentalType?: "rent" | "reserve"
  identityVerified?: boolean

  protectionPlans?: ProtectionPlan[]
  preSelectedProtectionPlanId?: string | null
  preSelectedHasOwnInsurance?: boolean

  initialStep?: CheckoutStep
  initialCompletedSteps?: CheckoutStep[]

  onInitCheckoutSession?: (params: {
    facilityId: string
    unitTypeId: string
    amountPence: number
    currency: string
  }) => Promise<{ success: boolean; sessionId?: string; error?: string }>

  onCreateIdentitySession?: (params: {
    email?: string
    name?: string
  }) => Promise<{ success: boolean; url?: string; sessionRef?: string; error?: string }>

  onCheckVerificationStatus?: (sessionRef?: string) => Promise<{ status: string }>

  onCreatePaymentIntent?: (params: {
    amountPence: number
    currency: string
    checkoutSessionId?: string
    customerEmail?: string
    rentalType?: string
  }) => Promise<{ success: boolean; clientSecret?: string; error?: string }>

  /** Render prop for the payment form (Stripe Elements or custom) */
  renderPaymentForm?: (props: {
    clientSecret: string
    totalLabel: string
    onSuccess: () => void
    onError: (msg: string) => void
  }) => React.ReactNode

  onMinimize?: () => void
  onStepChange?: (step: CheckoutStep, completedSteps: CheckoutStep[]) => void
  onComplete?: () => void
  onCancel?: () => void
  onBackToChat?: () => void
  onSendMessage?: (text: string) => void
}

const RENT_STEPS: { id: CheckoutStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "summary", label: "Confirm unit", icon: FileText },
  { id: "contact", label: "Your details", icon: CreditCard },
  { id: "identity", label: "Identity verification", icon: Fingerprint },
  { id: "protection", label: "Protection", icon: Shield },
  { id: "payment", label: "Payment", icon: CreditCard },
]

const RESERVE_STEPS: { id: ReserveStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "summary", label: "Confirm unit", icon: FileText },
  { id: "contact", label: "Your details", icon: CreditCard },
]

function getDefaultProtectionPlans(currency: string): ProtectionPlan[] {
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "\u20ac" : "\u00a3"
  return [
    { id: "basic", name: "Basic", description: "Essential coverage", coverAmount: 1000, pricePerMonth: 4.99, features: [`Up to ${sym}1,000 coverage`, "Theft protection"] },
    { id: "standard", name: "Standard", description: "Recommended coverage", coverAmount: 5000, pricePerMonth: 9.99, features: [`Up to ${sym}5,000 coverage`, "Theft + water damage"], isRecommended: true },
    { id: "premium", name: "Premium", description: "Full coverage", coverAmount: 10000, pricePerMonth: 14.99, features: [`Up to ${sym}10,000 coverage`, "All risks covered"] },
  ]
}

export function HiveCheckoutFlow({
  facilityId,
  facilityName,
  unitTypeId,
  unitSize,
  monthlyPrice,
  currency = "GBP",
  pinned,
  userEmail,
  userName,
  userPhone,
  availablePlans,
  selectedPlanId,
  onPlanChange,
  availableAddOns,
  selectedAddOnIds = [],
  onAddOnsChange,
  rentalType: rentalTypeProp,
  identityVerified,
  protectionPlans,
  preSelectedProtectionPlanId,
  preSelectedHasOwnInsurance,
  initialStep,
  initialCompletedSteps,
  onInitCheckoutSession,
  onCreateIdentitySession,
  onCheckVerificationStatus,
  onCreatePaymentIntent,
  renderPaymentForm,
  onMinimize,
  onStepChange,
  onComplete,
  onCancel,
  onBackToChat,
  onSendMessage,
}: HiveCheckoutFlowProps) {
  const isReserve = rentalTypeProp === "reserve"
  const STEPS = isReserve ? RESERVE_STEPS : RENT_STEPS

  const [currentStep, setCurrentStep] = React.useState<CheckoutStep>(initialStep ?? "summary")
  const [completedSteps, setCompletedSteps] = React.useState<Set<CheckoutStep>>(
    new Set(initialCompletedSteps ?? []),
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [checkoutSessionId, setCheckoutSessionId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const [contactName, setContactName] = React.useState(userName ?? "")
  const [contactEmail, setContactEmail] = React.useState(userEmail ?? "")
  const [contactPhone, setContactPhone] = React.useState(userPhone ?? "")

  React.useEffect(() => {
    if (!contactName && userName) setContactName(userName)
    if (!contactEmail && userEmail) setContactEmail(userEmail)
    if (!contactPhone && userPhone) setContactPhone(userPhone)
  }, [userName, userEmail, userPhone]) // eslint-disable-line react-hooks/exhaustive-deps

  const [contactAddress, setContactAddress] = React.useState("")
  const [contactCity, setContactCity] = React.useState("")
  const [contactPostcode, setContactPostcode] = React.useState("")

  const [identityState, setIdentityState] = React.useState<
    "idle" | "creating" | "polling" | "approved" | "declined" | "error"
  >("idle")
  const [diditUrl, setDiditUrl] = React.useState<string | null>(null)
  const [diditSessionRef, setDiditSessionRef] = React.useState<string | null>(null)
  const pollActiveRef = React.useRef(false)

  const [selectedProtectionId, setSelectedProtectionId] = React.useState<string | null>(
    preSelectedProtectionPlanId ?? null,
  )
  const [hasOwnInsurance, setHasOwnInsurance] = React.useState(preSelectedHasOwnInsurance ?? false)
  const effectiveProtectionPlans = protectionPlans ?? getDefaultProtectionPlans(currency)

  const [stripeClientSecret, setStripeClientSecret] = React.useState<string | null>(null)
  const [paymentState, setPaymentState] = React.useState<
    "idle" | "loading" | "ready" | "processing" | "succeeded" | "error"
  >("idle")

  const [showPlanPicker, setShowPlanPicker] = React.useState(false)
  const [showAddOns, setShowAddOns] = React.useState(false)

  const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "\u20ac" : "\u00a3"
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)

  const selectedPlan = availablePlans?.find((p) => p.id === selectedPlanId)
  const effectiveMonthlyPrice = selectedPlan?.pricePerMonth ?? monthlyPrice

  const addOnTotal = (availableAddOns ?? [])
    .filter((a) => selectedAddOnIds.includes(a.id))
    .reduce((sum, a) => sum + a.pricePerMonth, 0)
  const protectionCost = hasOwnInsurance
    ? 0
    : (effectiveProtectionPlans.find((p) => p.id === selectedProtectionId)?.pricePerMonth ?? 0)
  const totalMonthly = effectiveMonthlyPrice + addOnTotal + protectionCost

  const [pendingNotify, setPendingNotify] = React.useState<{
    step: string
    completed: CheckoutStep[]
  } | null>(null)

  React.useEffect(() => {
    if (pendingNotify) {
      onStepChange?.(pendingNotify.step as CheckoutStep, pendingNotify.completed)
      setPendingNotify(null)
    }
  }, [pendingNotify, onStepChange])

  const advanceToNextStep = React.useCallback(
    (step: CheckoutStep) => {
      setCompletedSteps((prev) => {
        const next = new Set([...prev, step])
        const nextIndex = STEPS.findIndex((s) => s.id === step) + 1
        const nextStep = nextIndex < STEPS.length ? STEPS[nextIndex]!.id : "complete"
        setCurrentStep(nextStep)
        setPendingNotify({ step: nextStep, completed: [...next] })
        return next
      })
    },
    [STEPS],
  )

  const goBack = React.useCallback(() => {
    if (currentStepIndex === 0) {
      onBackToChat?.()
      return
    }
    const prevStep = STEPS[currentStepIndex - 1]!.id
    setCurrentStep(prevStep)
    setPendingNotify({ step: prevStep, completed: [...completedSteps] })
  }, [STEPS, currentStepIndex, completedSteps, onBackToChat])

  const startIdentityVerification = React.useCallback(async () => {
    if (!onCreateIdentitySession) return
    setIdentityState("creating")
    setError(null)

    if (onCheckVerificationStatus) {
      try {
        const checkData = await onCheckVerificationStatus(diditSessionRef ?? undefined)
        if (checkData.status === "approved" || checkData.status === "verified") {
          setIdentityState("approved")
          advanceToNextStep("identity")
          return
        }
      } catch {
        /* proceed */
      }
    }

    const result = await onCreateIdentitySession({
      email: contactEmail || userEmail,
      name: contactName || userName,
    })

    if (!result.success || !result.url) {
      setIdentityState("error")
      setError(result.error ?? "Failed to start verification")
      return
    }

    setDiditUrl(result.url)
    setDiditSessionRef(result.sessionRef ?? null)
    setIdentityState("polling")
    window.open(result.url, "_blank", "noopener,noreferrer")
  }, [
    onCreateIdentitySession,
    onCheckVerificationStatus,
    diditSessionRef,
    contactEmail,
    userEmail,
    contactName,
    userName,
    advanceToNextStep,
  ])

  const identitySkipped = React.useRef(false)
  React.useEffect(() => {
    if (currentStep === "identity" && identityVerified && !identitySkipped.current) {
      identitySkipped.current = true
      setIdentityState("approved")
      advanceToNextStep("identity")
    }
  }, [currentStep, identityVerified, advanceToNextStep])

  React.useEffect(() => {
    if (identityState !== "polling" || !onCheckVerificationStatus) return
    pollActiveRef.current = true
    let pollCount = 0
    const MAX_POLLS = 30
    let timer: ReturnType<typeof setTimeout>

    const poll = async () => {
      if (!pollActiveRef.current || pollCount >= MAX_POLLS) return
      pollCount++
      try {
        const data = await onCheckVerificationStatus(diditSessionRef ?? undefined)
        if (!pollActiveRef.current) return
        if (data.status === "approved" || data.status === "verified") {
          setIdentityState("approved")
          advanceToNextStep("identity")
          return
        }
        if (data.status === "declined") {
          setIdentityState("declined")
          setError("Verification was declined. Please try again.")
          return
        }
      } catch {
        /* transient */
      }
      if (pollActiveRef.current && pollCount < MAX_POLLS) {
        const delay = pollCount <= 6 ? 5_000 : 15_000
        timer = setTimeout(poll, delay)
      }
    }

    timer = setTimeout(poll, 3_000)
    return () => {
      pollActiveRef.current = false
      clearTimeout(timer)
    }
  }, [identityState, diditSessionRef, onCheckVerificationStatus, advanceToNextStep])

  React.useEffect(() => {
    if (currentStep !== "payment" || paymentState !== "idle" || !onCreatePaymentIntent) return
    setPaymentState("loading")
    const amountPence = Math.round(totalMonthly * 100)

    onCreatePaymentIntent({
      amountPence,
      currency,
      checkoutSessionId: checkoutSessionId ?? undefined,
      customerEmail: contactEmail || userEmail,
      rentalType: isReserve ? "reserve" : "rent",
    }).then((result) => {
      if (result.success && result.clientSecret) {
        setStripeClientSecret(result.clientSecret)
        setPaymentState("ready")
      } else {
        setPaymentState("error")
        setError(result.error ?? "Failed to prepare payment")
      }
    })
  }, [
    currentStep,
    paymentState,
    totalMonthly,
    currency,
    checkoutSessionId,
    contactEmail,
    userEmail,
    isReserve,
    onCreatePaymentIntent,
  ])

  const handleConfirmUnit = React.useCallback(async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      if (onInitCheckoutSession) {
        const result = await onInitCheckoutSession({
          facilityId,
          unitTypeId,
          amountPence: Math.round(effectiveMonthlyPrice * 100),
          currency,
        })
        if (!result.success) {
          setError(result.error ?? "Failed to create session")
          return
        }
        if (result.sessionId) setCheckoutSessionId(result.sessionId)
      }
      advanceToNextStep("summary")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }, [facilityId, unitTypeId, effectiveMonthlyPrice, currency, onInitCheckoutSession, advanceToNextStep])

  const baseContactValid =
    contactName.trim().length > 0 && contactEmail.includes("@") && contactEmail.includes(".")
  const isContactValid = isReserve
    ? baseContactValid && contactPostcode.trim().length > 0
    : baseContactValid &&
      contactPostcode.trim().length > 0 &&
      contactAddress.trim().length > 0 &&
      contactCity.trim().length > 0

  const toggleAddOn = React.useCallback(
    (id: string) => {
      const current = selectedAddOnIds ?? []
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
      onAddOnsChange?.(next)
    },
    [selectedAddOnIds, onAddOnsChange],
  )

  if (currentStep === "complete") {
    const bt = rentalTypeProp ?? "rent"
    const idDone = identityState === "approved" || identityVerified
    const addOnsSkipped = selectedAddOnIds.length === 0
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {bt === "reserve" ? "Reservation confirmed" : "Rental confirmed"}
        </h3>
        <p className="text-sm text-gray-500 mb-1">{facilityName}</p>
        <p className="text-sm text-gray-500">
          {unitSize} &middot; {currencySymbol}
          {totalMonthly.toFixed(2)}/mo
        </p>
        <button
          onClick={() => {
            onSendMessage?.(
              `I've completed the checkout for ${unitSize} at ${facilityName}. ` +
                `Rental type: ${bt}. Identity verified: ${idDone ? "yes" : "no"}. ` +
                `Add-ons: ${addOnsSkipped ? "none" : "selected"}.`,
            )
            onComplete?.()
          }}
          className="mt-4 w-full py-2.5 bg-indigo-800 hover:bg-indigo-900 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-gray-900">Checkout</span>
        </div>
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              title="Minimize checkout"
            >
              <ChevronUp className="w-3.5 h-3.5 text-gray-500 rotate-180" />
            </button>
          )}
          {pinned && onBackToChat && (
            <button
              onClick={onBackToChat}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              Go to chat
            </button>
          )}
          <button
            onClick={() => {
              onSendMessage?.("I've cancelled the checkout.")
              onCancel?.()
            }}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-200">
        <div className="flex items-center gap-1">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  completedSteps.has(step.id)
                    ? "bg-green-100 text-green-600"
                    : step.id === currentStep
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-gray-100 text-gray-400",
                )}
              >
                {completedSteps.has(step.id) ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 rounded-full",
                    completedSteps.has(step.id) ? "bg-green-200" : "bg-gray-200",
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs font-medium text-gray-500 mt-1.5">
          Step {currentStepIndex + 1} of {STEPS.length}: {STEPS[currentStepIndex]?.label}
        </p>
      </div>

      <div className="p-4">
        {currentStep === "summary" && (
          <div className="space-y-3">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors -mt-1 mb-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to chat
            </button>
            <div className="bg-gray-50 rounded-xl p-3.5">
              <p className="text-sm font-semibold text-gray-900">{facilityName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{unitSize}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">
                  {currencySymbol}
                  {effectiveMonthlyPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">/month</span>
              </div>
            </div>

            {availablePlans && availablePlans.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-700">
                      {selectedPlan?.name ?? "Monthly"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {currencySymbol}
                      {effectiveMonthlyPrice.toFixed(2)}/mo
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPlanPicker(!showPlanPicker)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    {showPlanPicker ? "Done" : "Change"}
                  </button>
                </div>
                {showPlanPicker && (
                  <div className="mt-2 space-y-1.5">
                    {availablePlans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => {
                          onPlanChange?.(plan.id)
                          setShowPlanPicker(false)
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors",
                          plan.id === selectedPlanId
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                        )}
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{plan.name}</p>
                          {plan.badge && <p className="text-[10px] text-gray-500">{plan.badge}</p>}
                        </div>
                        <span className="text-xs font-semibold text-gray-900">
                          {currencySymbol}
                          {plan.pricePerMonth}/mo
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedAddOnIds.length > 0 && availableAddOns && (
              <div>
                <button
                  onClick={() => setShowAddOns(!showAddOns)}
                  className="flex items-center justify-between w-full text-xs"
                >
                  <span className="font-medium text-gray-700">
                    {selectedAddOnIds.length} add-on{selectedAddOnIds.length > 1 ? "s" : ""}{" "}
                    selected
                  </span>
                  <ChevronUp
                    className={cn(
                      "w-3.5 h-3.5 text-gray-400 transition-transform",
                      showAddOns ? "" : "rotate-180",
                    )}
                  />
                </button>
                {showAddOns && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {availableAddOns
                      .filter((a) => selectedAddOnIds.includes(a.id))
                      .map((addon) => (
                        <span
                          key={addon.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-[11px] font-medium text-gray-700"
                        >
                          {addon.name}
                          <button
                            onClick={() => toggleAddOn(addon.id)}
                            className="w-3.5 h-3.5 rounded-full hover:bg-gray-200 flex items-center justify-center"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              onClick={handleConfirmUnit}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-800 hover:bg-indigo-900 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating session...
                </>
              ) : (
                <>
                  Confirm & continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {currentStep === "contact" && (
          <div className="space-y-3">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors -mt-1 mb-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>
            <p className="text-sm text-gray-600">
              {isReserve ? "Your details to hold this unit." : "Your contact and billing details."}
            </p>
            <div className="space-y-2">
              <input type="text" placeholder="Full name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300" />
              <input type="email" placeholder="Email address" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300" />
              <input type="tel" placeholder="Phone number" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300" />
              {!isReserve && (
                <>
                  <input type="text" placeholder="Address line 1" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300" />
                  <input type="text" placeholder="City" value={contactCity} onChange={(e) => setContactCity(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300" />
                </>
              )}
              <input type="text" placeholder="Postcode" value={contactPostcode} onChange={(e) => setContactPostcode(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300" />
            </div>
            <button
              onClick={() => {
                if (isReserve) {
                  setCompletedSteps((prev) => {
                    const next = new Set([...prev, "contact" as CheckoutStep])
                    setPendingNotify({ step: "complete", completed: [...next] })
                    return next
                  })
                  setCurrentStep("complete")
                } else {
                  advanceToNextStep("contact")
                }
              }}
              disabled={!isContactValid}
              className="w-full py-2.5 bg-indigo-800 hover:bg-indigo-900 disabled:bg-gray-300 disabled:text-gray-500 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isReserve ? "Reserve unit" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep === "identity" && (
          <div className="space-y-3">
            <button onClick={goBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors -mt-1 mb-1">
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>

            {identityState === "approved" ? (
              <div className="bg-green-50 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Identity verified</p>
                  <p className="text-xs text-gray-500 mt-0.5">Verification complete</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-indigo-50 rounded-xl p-3.5 flex items-start gap-3">
                  <Fingerprint className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Identity verification required</p>
                    <p className="text-xs text-gray-600 mt-0.5">We use Didit to securely verify your identity. This is a one-time process.</p>
                  </div>
                </div>

                {identityState === "polling" && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 rounded-lg border border-amber-200">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-700">Waiting for verification... A new tab has opened.</p>
                  </div>
                )}

                {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

                <button
                  onClick={identityState === "polling" && diditUrl ? () => window.open(diditUrl, "_blank", "noopener,noreferrer") : startIdentityVerification}
                  disabled={identityState === "creating"}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {identityState === "creating" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Starting verification...</>
                  ) : identityState === "polling" ? (
                    <><Fingerprint className="w-4 h-4" /> Re-open verification</>
                  ) : (
                    <><Fingerprint className="w-4 h-4" /> Verify identity</>
                  )}
                </button>

                {identityState === "polling" && (
                  <button onClick={() => advanceToNextStep("identity")} className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                    Skip for now
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {currentStep === "protection" && (
          <div className="space-y-3">
            <button onClick={goBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors -mt-1 mb-1">
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-gray-600" />
                <p className="text-sm font-semibold text-gray-900">Storage protection</p>
              </div>
              <p className="text-xs text-gray-500 mb-2">Protection covers your stored goods against damage and loss.</p>
              <div className="space-y-1.5">
                {effectiveProtectionPlans.map((plan) => (
                  <button
                    key={plan.id}
                    disabled={hasOwnInsurance}
                    onClick={() => setSelectedProtectionId(selectedProtectionId === plan.id ? null : plan.id)}
                    className={cn("w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors", hasOwnInsurance ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed" : selectedProtectionId === plan.id ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")}
                  >
                    <div className="flex items-center gap-2">
                      {selectedProtectionId === plan.id && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {plan.name}
                          {plan.isRecommended && <span className="ml-1.5 text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">Recommended</span>}
                        </p>
                        <p className="text-xs text-gray-500">Up to {currencySymbol}{plan.coverAmount.toLocaleString()} coverage</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{currencySymbol}{plan.pricePerMonth}/mo</span>
                  </button>
                ))}
                {selectedProtectionId && !hasOwnInsurance && (
                  <button onClick={() => setSelectedProtectionId(null)} className="text-xs text-gray-500 hover:text-gray-700 transition-colors">No protection needed</button>
                )}
              </div>

              <button
                onClick={() => { setHasOwnInsurance(!hasOwnInsurance); if (!hasOwnInsurance) setSelectedProtectionId(null) }}
                className={cn("w-full flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-colors", hasOwnInsurance ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50")}
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">I have my own insurance</span>
                {hasOwnInsurance && <Check className="w-3.5 h-3.5 ml-auto text-emerald-600" />}
              </button>
            </div>

            {availableAddOns && availableAddOns.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <button onClick={() => setShowAddOns(!showAddOns)} className="flex items-center justify-between w-full">
                  <p className="text-sm font-semibold text-gray-900">
                    Optional add-ons
                    {selectedAddOnIds.length > 0 && <span className="ml-1.5 text-xs font-normal text-gray-500">({selectedAddOnIds.length} selected)</span>}
                  </p>
                  <ChevronUp className={cn("w-4 h-4 text-gray-400 transition-transform", showAddOns ? "" : "rotate-180")} />
                </button>
                {showAddOns && (
                  <div className="space-y-1.5 mt-2">
                    {availableAddOns.map((addon) => {
                      const isSelected = selectedAddOnIds.includes(addon.id)
                      return (
                        <button key={addon.id} onClick={() => toggleAddOn(addon.id)} className={cn("w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors", isSelected ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>
                          <div className="flex items-center gap-2">
                            {isSelected ? <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" /> : <Plus className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{addon.name}</p>
                              <p className="text-xs text-gray-500">{addon.description}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{currencySymbol}{addon.pricePerMonth}/mo</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <button onClick={() => advanceToNextStep("protection")} className="w-full py-2.5 bg-indigo-800 hover:bg-indigo-900 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep === "payment" && (
          <div className="space-y-3">
            <button onClick={goBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors -mt-1 mb-1">
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>

            <div className="bg-gray-50 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Monthly rent</span>
                <span className="text-sm font-semibold text-gray-900">{currencySymbol}{effectiveMonthlyPrice.toFixed(2)}</span>
              </div>
              {protectionCost > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Protection</span>
                  <span className="text-sm text-gray-700">{currencySymbol}{protectionCost.toFixed(2)}</span>
                </div>
              )}
              {addOnTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Add-ons</span>
                  <span className="text-sm text-gray-700">{currencySymbol}{addOnTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Total due today</span>
                <span className="text-lg font-bold text-gray-900">{currencySymbol}{totalMonthly.toFixed(2)}</span>
              </div>
            </div>

            {paymentState === "loading" && (
              <div className="flex items-center justify-center gap-2 py-6">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-xs text-gray-500">Preparing payment...</span>
              </div>
            )}

            {paymentState === "ready" && stripeClientSecret && renderPaymentForm && (
              renderPaymentForm({
                clientSecret: stripeClientSecret,
                totalLabel: `${currencySymbol}${totalMonthly.toFixed(2)}`,
                onSuccess: () => advanceToNextStep("payment"),
                onError: (msg) => setError(msg),
              })
            )}

            {paymentState === "error" && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error ?? "Payment setup failed. Please try again."}
              </p>
            )}

            {error && paymentState !== "error" && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** @deprecated Use HiveCheckoutFlow */
export const AgentCheckoutFlow = HiveCheckoutFlow
