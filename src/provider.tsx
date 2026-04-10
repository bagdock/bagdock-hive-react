"use client"

import * as React from "react"

import type { ToolResultRenderer } from "./types"

export interface HiveProviderConfig {
  /** Custom renderer for tool results — takes precedence over built-in cards */
  renderToolResult?: ToolResultRenderer
  /** Operator-specific bot name */
  botName?: string
  /** Operator branding color (used for accent in some components) */
  accentColor?: string
}

const HiveContext = React.createContext<HiveProviderConfig>({})

export function HiveProvider({
  children,
  ...config
}: HiveProviderConfig & { children: React.ReactNode }) {
  const value = React.useMemo(
    () => ({
      renderToolResult: config.renderToolResult,
      botName: config.botName,
      accentColor: config.accentColor,
    }),
    [config.renderToolResult, config.botName, config.accentColor],
  )

  return <HiveContext.Provider value={value}>{children}</HiveContext.Provider>
}

export function useHiveConfig(): HiveProviderConfig {
  return React.useContext(HiveContext)
}
