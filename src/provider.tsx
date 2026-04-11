"use client"

import * as React from "react"

import type { ToolResultRenderer } from "./types"
import type { HiveAppearance, ResolvedTheme } from "./themes/types"
import { resolveTheme, themeToStyle } from "./themes/types"

export interface HiveProviderConfig {
  /** Clerk/Stripe-style appearance prop for theming all chat primitives */
  appearance?: HiveAppearance
  /** Custom renderer for tool results -- takes precedence over built-in cards */
  renderToolResult?: ToolResultRenderer
  /** Operator-specific bot name */
  botName?: string
  /** @deprecated Use appearance.variables.colorPrimary instead */
  accentColor?: string
}

interface HiveContextValue extends HiveProviderConfig {
  resolvedTheme?: ResolvedTheme
}

const HiveContext = React.createContext<HiveContextValue>({})

export function HiveProvider({
  children,
  ...config
}: HiveProviderConfig & { children: React.ReactNode }) {
  const resolved = React.useMemo(
    () => config.appearance ? resolveTheme(config.appearance) : undefined,
    [config.appearance],
  )

  const style = React.useMemo(
    () => resolved ? themeToStyle(resolved.variables) : undefined,
    [resolved],
  )

  const value = React.useMemo<HiveContextValue>(
    () => ({
      renderToolResult: config.renderToolResult,
      botName: config.botName,
      accentColor: config.accentColor,
      appearance: config.appearance,
      resolvedTheme: resolved,
    }),
    [config.renderToolResult, config.botName, config.accentColor, config.appearance, resolved],
  )

  return (
    <HiveContext.Provider value={value}>
      {style ? (
        <div className="hive-root" style={style}>
          {children}
        </div>
      ) : (
        children
      )}
    </HiveContext.Provider>
  )
}

export function useHiveConfig(): HiveContextValue {
  return React.useContext(HiveContext)
}
