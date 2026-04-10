"use client"

/**
 * OTP Input primitive for hive-react SDK.
 * Mirrored from @bagdock/ui packages/ui/src/auth/OtpInput.tsx —
 * kept as a local copy to avoid depending on internal UI packages.
 */

import * as React from "react"
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react"

export type OtpStatus = "idle" | "verifying" | "verified" | "error"

export interface OtpInputProps {
  length?: number
  onComplete: (code: string) => void
  onResend: () => void
  status: OtpStatus
  error?: string | null
  cooldownSeconds?: number
  startCooldownOnMount?: boolean
  contactDisplay?: string
  disabled?: boolean
  size?: "sm" | "md"
  verifiedLabel?: string
  onVerifiedComplete?: () => void
}

export function OtpInput({
  length = 6,
  onComplete,
  onResend,
  status,
  error,
  cooldownSeconds = 60,
  startCooldownOnMount = true,
  contactDisplay,
  disabled = false,
  size = "md",
  verifiedLabel = "Verified",
  onVerifiedComplete,
}: OtpInputProps) {
  const [otpCode, setOtpCode] = React.useState<string[]>(() =>
    Array(length).fill("")
  )
  const [cooldown, setCooldown] = React.useState(
    startCooldownOnMount ? cooldownSeconds : 0
  )
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const submitGuardRef = React.useRef(false)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  React.useEffect(() => {
    if (status === "error") {
      setOtpCode(Array(length).fill(""))
      submitGuardRef.current = false
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
    if (status === "idle") {
      submitGuardRef.current = false
    }
  }, [status, length])

  React.useEffect(() => {
    if (status === "verified" && onVerifiedComplete) {
      const timer = setTimeout(onVerifiedComplete, 1200)
      return () => clearTimeout(timer)
    }
  }, [status, onVerifiedComplete])

  React.useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }, [])

  const triggerComplete = React.useCallback(
    (code: string) => {
      if (submitGuardRef.current) return
      submitGuardRef.current = true
      onComplete(code)
    },
    [onComplete]
  )

  const handleChange = React.useCallback(
    (index: number, value: string) => {
      if (value.length > 1) {
        const digits = value.replace(/\D/g, "").slice(0, length).split("")
        const newOtp = [...otpCode]
        digits.forEach((d, i) => {
          if (index + i < length) newOtp[index + i] = d
        })
        setOtpCode(newOtp)
        const nextIndex = Math.min(index + digits.length, length - 1)
        inputRefs.current[nextIndex]?.focus()
        if (newOtp.every((d) => d !== "")) {
          triggerComplete(newOtp.join(""))
        }
        return
      }
      const newOtp = [...otpCode]
      newOtp[index] = value.replace(/\D/g, "")
      setOtpCode(newOtp)
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
      if (newOtp.every((d) => d !== "")) {
        triggerComplete(newOtp.join(""))
      }
    },
    [otpCode, length, triggerComplete]
  )

  const handleKeyDown = React.useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !otpCode[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [otpCode]
  )

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, length)
      if (pasted) handleChange(0, pasted)
    },
    [handleChange, length]
  )

  const handleResend = React.useCallback(() => {
    if (cooldown > 0) return
    setOtpCode(Array(length).fill(""))
    submitGuardRef.current = false
    setCooldown(cooldownSeconds)
    onResend()
  }, [cooldown, cooldownSeconds, length, onResend])

  const isSmall = size === "sm"
  const boxClass = isSmall
    ? "w-9 h-10 text-base border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
    : "w-12 h-14 text-xl border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"

  if (status === "verified") {
    return (
      <div
        className={`flex flex-col items-center gap-2 ${isSmall ? "py-3" : "py-4"}`}
      >
        <div
          className={`${isSmall ? "w-10 h-10" : "w-16 h-16"} rounded-full bg-green-50 flex items-center justify-center`}
        >
          <CheckCircle2
            className={`${isSmall ? "w-5 h-5" : "w-8 h-8"} text-green-600`}
          />
        </div>
        <p
          className={`${isSmall ? "text-sm" : "text-base"} font-semibold text-gray-900`}
        >
          {verifiedLabel}
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-${isSmall ? "2.5" : "4"}`}>
      {contactDisplay && (
        <p className={`${isSmall ? "text-xs" : "text-sm"} text-gray-500`}>
          {contactDisplay}
        </p>
      )}

      {error && status === "error" && (
        <div
          className={`${isSmall ? "text-xs px-3 py-2 rounded-lg" : "text-sm p-3 rounded-xl border border-red-200"} text-red-600 bg-red-50`}
        >
          {error}
        </div>
      )}

      <div
        className={`flex ${isSmall ? "gap-1.5" : "gap-2"} justify-center`}
      >
        {otpCode.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={length}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            disabled={disabled || status === "verifying"}
            className={`text-center font-semibold border focus:outline-none transition-all disabled:opacity-50 ${boxClass}`}
          />
        ))}
      </div>

      {status === "verifying" && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Verifying...
        </div>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || disabled || status === "verifying"}
          className={`${isSmall ? "text-xs text-gray-500 hover:text-gray-700" : "text-sm font-medium text-indigo-600 hover:text-indigo-800"} disabled:text-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  )
}

export function obfuscatePhone(countryCode: string, number: string): string {
  const digits = number.replace(/\s/g, "")
  if (digits.length <= 4) return `${countryCode} ${digits}`
  return `${countryCode} ${"*".repeat(digits.length - 4)}${digits.slice(-4)}`
}

export function obfuscateEmail(email: string): string {
  const atIdx = email.indexOf("@")
  if (atIdx < 0) return email
  const local = email.slice(0, atIdx)
  const domain = email.slice(atIdx)
  if (local.length <= 2) return email
  return `${local[0]}${"*".repeat(Math.min(local.length - 2, 6))}${local.slice(-1)}${domain}`
}
