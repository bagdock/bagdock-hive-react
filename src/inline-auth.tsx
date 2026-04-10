"use client"

import * as React from "react"
import { ChevronLeft, Loader2, Lock, Mail } from "lucide-react"

import type { AuthResult, CountryCode, SendOtpParams, SendOtpResult, VerifyOtpParams, VerifyOtpResult } from "./types"

type AuthStep = "phone-input" | "email-input" | "verify-otp"

export interface HiveInlineAuthProps {
  reason?: string
  onAuthSuccess: (data: AuthResult) => void
  onSendOtp: (params: SendOtpParams) => Promise<SendOtpResult>
  onVerifyOtp: (params: VerifyOtpParams) => Promise<VerifyOtpResult>
  defaultCountryCode?: string
  countryCodes?: CountryCode[]
}

const DEFAULT_COUNTRY_CODES: CountryCode[] = [
  { code: "+44", flag: "\ud83c\uddec\ud83c\udde7", name: "United Kingdom" },
  { code: "+1", flag: "\ud83c\uddfa\ud83c\uddf8", name: "United States" },
  { code: "+353", flag: "\ud83c\uddee\ud83c\uddea", name: "Ireland" },
  { code: "+49", flag: "\ud83c\udde9\ud83c\uddea", name: "Germany" },
  { code: "+33", flag: "\ud83c\uddeb\ud83c\uddf7", name: "France" },
  { code: "+34", flag: "\ud83c\uddea\ud83c\uddf8", name: "Spain" },
  { code: "+39", flag: "\ud83c\uddee\ud83c\uddf9", name: "Italy" },
  { code: "+31", flag: "\ud83c\uddf3\ud83c\uddf1", name: "Netherlands" },
  { code: "+61", flag: "\ud83c\udde6\ud83c\uddfa", name: "Australia" },
  { code: "+91", flag: "\ud83c\uddee\ud83c\uddf3", name: "India" },
]

export function HiveInlineAuth({
  reason,
  onAuthSuccess,
  onSendOtp,
  onVerifyOtp,
  defaultCountryCode = "+44",
  countryCodes = DEFAULT_COUNTRY_CODES,
}: HiveInlineAuthProps) {
  const [step, setStep] = React.useState<AuthStep>("phone-input")
  const [countryCode, setCountryCode] = React.useState(defaultCountryCode)
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [otpCode, setOtpCode] = React.useState(["", "", "", "", "", ""])
  const [methodId, setMethodId] = React.useState("")
  const [otpMethod, setOtpMethod] = React.useState<"phone" | "email">("phone")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  React.useEffect(() => {
    if (step === "verify-otp") {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100)
    }
  }, [step])

  const handleSendPhoneOtp = React.useCallback(async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const fullPhone = `${countryCode}${phoneNumber.replace(/\s/g, "")}`
      const result = await onSendOtp({ method: "phone", phone: fullPhone })
      setMethodId(result.methodId)
      setOtpMethod("phone")
      setStep("verify-otp")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send code")
    } finally {
      setIsLoading(false)
    }
  }, [countryCode, phoneNumber, onSendOtp])

  const handleSendEmailOtp = React.useCallback(async () => {
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await onSendOtp({ method: "email", email })
      setMethodId(result.methodId)
      setOtpMethod("email")
      setStep("verify-otp")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send code")
    } finally {
      setIsLoading(false)
    }
  }, [email, onSendOtp])

  const handleVerifyOtp = React.useCallback(async () => {
    const code = otpCode.join("")
    if (code.length !== 6) {
      setError("Please enter the full 6-digit code")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await onVerifyOtp({ methodId, code, method: otpMethod })
      onAuthSuccess(result)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }, [otpCode, methodId, otpMethod, onVerifyOtp, onAuthSuccess])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("")
      const newOtp = [...otpCode]
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d
      })
      setOtpCode(newOtp)
      const nextIndex = Math.min(index + digits.length, 5)
      otpInputRefs.current[nextIndex]?.focus()
      return
    }
    const newOtp = [...otpCode]
    newOtp[index] = value.replace(/\D/g, "")
    setOtpCode(newOtp)
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="max-w-[90%] rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5">
        {step !== "phone-input" && (
          <button
            onClick={() => {
              setError(null)
              setStep(
                step === "verify-otp"
                  ? otpMethod === "phone"
                    ? "phone-input"
                    : "email-input"
                  : "phone-input",
              )
            }}
            className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
          </button>
        )}
        <Lock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Quick sign in</p>
          {reason && <p className="text-xs text-gray-500 mt-0.5">{reason}</p>}
        </div>
      </div>

      <div className="px-4 py-3.5">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</p>
        )}

        {step === "phone-input" && (
          <div className="space-y-2.5">
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
                onKeyDown={(e) => e.key === "Enter" && handleSendPhoneOtp()}
                placeholder="Phone number"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300"
              />
            </div>

            <button
              onClick={handleSendPhoneOtp}
              disabled={isLoading || !phoneNumber.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                </>
              ) : (
                "Send code"
              )}
            </button>

            <button
              onClick={() => {
                setError(null)
                setStep("email-input")
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Mail className="w-3 h-3" />
              Use email instead
            </button>
          </div>
        )}

        {step === "email-input" && (
          <div className="space-y-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendEmailOtp()}
              placeholder="Email address"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300"
            />

            <button
              onClick={handleSendEmailOtp}
              disabled={isLoading || !email.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                </>
              ) : (
                "Send code"
              )}
            </button>

            <button
              onClick={() => {
                setError(null)
                setStep("phone-input")
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Use phone instead
            </button>
          </div>
        )}

        {step === "verify-otp" && (
          <div className="space-y-2.5">
            <p className="text-xs text-gray-500">
              Code sent to{" "}
              <span className="font-medium text-gray-700">
                {otpMethod === "phone" ? `${countryCode} ${phoneNumber}` : email}
              </span>
            </p>

            <div className="flex gap-1.5 justify-center">
              {otpCode.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpInputRefs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-9 h-10 text-center text-base font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={isLoading || otpCode.join("").length !== 6}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>

            <button
              onClick={() => {
                setOtpCode(["", "", "", "", "", ""])
                setError(null)
                if (otpMethod === "phone") handleSendPhoneOtp()
                else handleSendEmailOtp()
              }}
              disabled={isLoading}
              className="w-full text-xs text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              Resend code
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/** @deprecated Use HiveInlineAuth */
export const InlineChatAuth = HiveInlineAuth
