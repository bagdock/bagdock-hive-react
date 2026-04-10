// Types
export type {
  AIAssistantContext,
  AIAssistantSuggestion,
  AIMessageSource,
  AIMessagePart,
  AIRoutingMetadata,
  AIMessageMetadata,
  AIMessage,
  AIAction,
  AgentNotification,
  RecentThread,
  HistorySession,
  DashboardRole,
  SearchFacility,
  PricingPlan,
  AddOn,
  ProtectionPlan,
  AuthResult,
  SendOtpParams,
  SendOtpResult,
  VerifyOtpParams,
  VerifyOtpResult,
  CountryCode,
  ToolResultRenderer,
} from "./types"

// Utilities
export { cn, formatTimeAgo, currencySymbol } from "./utils"

// Primitives
export {
  TOOL_STEP_LABELS,
  HIDDEN_TOOL_STEPS,
  isToolDone,
  isToolError,
  ToolExecutionStep,
  QuickReplyChips,
  VerificationCard,
  SecurePhoneInput,
} from "./chat-primitives"

export type { SecurePhoneInputProps } from "./chat-primitives"

export { ChatMarkdown } from "./chat-markdown"
export { AGENT_LABELS, ReasoningBlock } from "./reasoning-block"
export { ChatMessage, LoadingMessage } from "./chat-message"
export type { ChatMessageProps } from "./chat-message"

// Built-in tool result cards
export {
  AgentRentalsToolCard,
  PaymentSummaryCard,
  DashboardSummaryCard,
  LoyaltyCard,
  AccountProfileCard,
  defaultRenderToolResult,
} from "./tool-cards"

// Shared components
export { Composer } from "./composer"
export type { ComposerProps } from "./composer"
export { RecentThreadsDropdown } from "./recent-threads"

// Compositions
export { HiveChatPanel, AIChatPanel } from "./chat-panel"
export type { HiveChatPanelProps } from "./chat-panel"

export { HiveFullPage, CoraFullPage } from "./full-page"
export type { HiveFullPageProps } from "./full-page"

export { HiveFloatingButton, AIFloatingButton } from "./floating-button"
export type { HiveFloatingButtonProps } from "./floating-button"

export { HiveAssistantStrip, AssistantStrip } from "./assistant-strip"
export type { HiveAssistantStripProps } from "./assistant-strip"

export { HiveAssistantPanel, AIAssistantPanel } from "./assistant-panel"
export type { HiveAssistantPanelProps } from "./assistant-panel"

export { HiveInlineHint, InlineSmartHint } from "./inline-hint"
export type { HiveInlineHintProps } from "./inline-hint"

export { HiveBadge, AIBadge } from "./badge"

export { HiveDashboardPrompt, DashboardPromptBox } from "./dashboard-prompt"
export type { HiveDashboardPromptProps } from "./dashboard-prompt"

export { HiveSearchView, CoraSearchView } from "./search-view"
export type { HiveSearchViewProps } from "./search-view"

// Feature components
export { HiveHistoryPanel, AgentHistoryPanel } from "./history-panel"
export type { HiveHistoryPanelProps } from "./history-panel"

export { HiveInlineAuth, InlineChatAuth } from "./inline-auth"
export type { HiveInlineAuthProps } from "./inline-auth"

export { OtpInput, obfuscatePhone, obfuscateEmail } from "./otp-input"
export type { OtpInputProps, OtpStatus } from "./otp-input"

export { HivePostRentalCard, PostRentalCard } from "./post-rental-card"
export type { HivePostRentalCardProps } from "./post-rental-card"

export { HiveCheckoutFlow, AgentCheckoutFlow } from "./checkout-flow"
export type { HiveCheckoutFlowProps } from "./checkout-flow"

// Provider & hooks
export { HiveProvider, useHiveConfig } from "./provider"
export type { HiveProviderConfig } from "./provider"

export { useHiveChat } from "./use-hive-chat"
export type { UseHiveChatConfig, UseHiveChatReturn } from "./use-hive-chat"
