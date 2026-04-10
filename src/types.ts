export type AIAssistantContext = "dashboard" | "payments" | "access" | "help" | "move_out" | "general"

export interface AIAssistantSuggestion {
  id: string
  type: "action" | "info" | "upsell" | "warning"
  title: string
  description: string
  icon?: string
  actionLabel?: string
  actionUrl?: string
  dismissible: boolean
  priority: number
  context: AIAssistantContext
  expiresAt?: string
}

export interface AIMessageSource {
  title: string
  url: string
}

export interface AIMessagePart {
  type: "text" | "tool-invocation"
  text?: string
  state?: "call" | "partial-call" | "result"
  toolCallId?: string
  toolName?: string
  args?: Record<string, unknown>
  output?: unknown
}

export interface AIRoutingMetadata {
  agent: string
  confidence: number
  reasoning: string
  modelTier: string
}

export interface AIMessageMetadata {
  routing?: AIRoutingMetadata
  sessionId?: string
}

export interface AIMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  suggestions?: AIAssistantSuggestion[]
  actions?: AIAction[]
  sources?: AIMessageSource[]
  parts?: AIMessagePart[]
  metadata?: AIMessageMetadata
}

export interface AIAction {
  id: string
  label: string
  type: "navigate" | "action" | "confirm"
  payload: Record<string, unknown>
}

export interface AgentNotification {
  count: number
  summary: string
}

export interface RecentThread {
  id: string
  preview: string
  agentRole: string
  createdAt: string
  messageCount: number
}

export interface HistorySession {
  id: string
  agentRole: string
  status: string
  messageCount: number
  createdAt: string
  preview: string
}

export type DashboardRole =
  | "customer"
  | "operator_owner"
  | "facility_manager"
  | "admin"

export interface SearchFacility {
  id: string
  name: string
  address?: string
  city?: string
  price?: number
  currency?: string
  rating?: number
  reviewCount?: number
  latitude?: number
  longitude?: number
  imageUrl?: string
  features?: string[]
}

export interface PricingPlan {
  id: string
  name: string
  pricePerMonth: number
  badge?: string
}

export interface AddOn {
  id: string
  name: string
  description: string
  pricePerMonth: number
}

export interface ProtectionPlan {
  id: string
  name: string
  description: string
  coverAmount: number
  pricePerMonth: number
  features: string[]
  isRecommended?: boolean
}

export interface AuthResult {
  token: string
  userId: string
  contactId?: string
  displayName?: string
}

export interface SendOtpParams {
  method: "phone" | "email"
  phone?: string
  email?: string
}

export interface SendOtpResult {
  methodId: string
}

export interface VerifyOtpParams {
  methodId: string
  code: string
  method: "phone" | "email"
}

export interface VerifyOtpResult extends AuthResult {}

export interface CountryCode {
  code: string
  flag: string
  name: string
}

export type ToolResultRenderer = (
  toolName: string,
  output: unknown,
  onSendMessage?: (msg: string) => void,
) => React.ReactNode | null
