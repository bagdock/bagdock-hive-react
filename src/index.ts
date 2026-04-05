// Provider
export { HiveProvider } from './components/HiveProvider'
export type { HiveProviderProps } from './components/HiveProvider'

// Widgets
export { HiveChat } from './components/HiveChat'
export type { HiveChatProps } from './components/HiveChat'

export { HiveBooking } from './components/HiveBooking'
export type { HiveBookingProps } from './components/HiveBooking'

export { HiveAccess } from './components/HiveAccess'
export type { HiveAccessProps } from './components/HiveAccess'

// Hooks
export { useHive, useHiveClient } from './hooks/useHiveContext'
export type { HiveContextValue } from './hooks/useHiveContext'

// Themes
export type {
  HiveAppearance,
  HiveThemeVariables,
  HiveElementStyles,
  ResolvedTheme,
} from './themes/types'
export { DEFAULT_THEME } from './themes/types'

// Re-export core types consumers need
export type {
  AuthProvider,
  AuthAdapterConfig,
  ChatMessage,
  HiveUnit,
  BookingParams,
  BookingResult,
  AccessCode,
  EmbedScope,
} from '@bagdock/hive'
