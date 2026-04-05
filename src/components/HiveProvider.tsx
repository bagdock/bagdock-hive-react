import React, { useMemo } from 'react'
import { BagdockHive, createAuthAdapter } from '@bagdock/hive'
import type { AuthAdapterConfig } from '@bagdock/hive'
import type { HiveAppearance, ResolvedTheme } from '../themes/types'
import { DEFAULT_THEME } from '../themes/types'
import { HiveContext, type HiveContextValue } from '../hooks/useHiveContext'

export interface HiveProviderProps {
  apiKey?: string
  embedToken?: string
  baseUrl?: string
  operatorId?: string
  auth?: AuthAdapterConfig
  appearance?: HiveAppearance
  children: React.ReactNode
}

function resolveTheme(appearance?: HiveAppearance): ResolvedTheme {
  const vars = { ...DEFAULT_THEME, ...appearance?.variables }
  return {
    variables: vars,
    elements: appearance?.elements || {},
    isDark: appearance?.theme === 'dark',
  }
}

function themeToCSS(theme: ResolvedTheme): Record<string, string> {
  return {
    '--hive-color-primary': theme.variables.colorPrimary,
    '--hive-color-primary-hover': theme.variables.colorPrimaryHover,
    '--hive-color-bg': theme.variables.colorBackground,
    '--hive-color-surface': theme.variables.colorSurface,
    '--hive-color-text': theme.variables.colorText,
    '--hive-color-text-secondary': theme.variables.colorTextSecondary,
    '--hive-color-border': theme.variables.colorBorder,
    '--hive-color-success': theme.variables.colorSuccess,
    '--hive-color-warning': theme.variables.colorWarning,
    '--hive-color-danger': theme.variables.colorDanger,
    '--hive-font-family': theme.variables.fontFamily,
    '--hive-font-mono': theme.variables.fontFamilyMono,
    '--hive-radius': theme.variables.borderRadius,
    '--hive-radius-lg': theme.variables.borderRadiusLg,
    '--hive-shadow': theme.variables.shadow,
    '--hive-shadow-lg': theme.variables.shadowLg,
  }
}

export function HiveProvider({
  apiKey,
  embedToken,
  baseUrl,
  operatorId,
  auth,
  appearance,
  children,
}: HiveProviderProps) {
  const theme = useMemo(() => resolveTheme(appearance), [appearance])
  const cssVars = useMemo(() => themeToCSS(theme), [theme])

  const client = useMemo(() => {
    const key = apiKey || embedToken
    if (!key) return null

    const config: ConstructorParameters<typeof BagdockHive>[0] = {
      apiKey: key,
      baseUrl,
      auth,
    }

    const hive = new BagdockHive(config)
    return operatorId ? hive.forOperator(operatorId) : hive
  }, [apiKey, embedToken, baseUrl, operatorId, auth])

  const value: HiveContextValue = useMemo(
    () => ({ client, theme, operatorId, embedToken }),
    [client, theme, operatorId, embedToken],
  )

  return (
    <HiveContext.Provider value={value}>
      <div
        className="bagdock-hive"
        style={cssVars as React.CSSProperties}
        data-hive-theme={theme.isDark ? 'dark' : 'light'}
      >
        {children}
      </div>
    </HiveContext.Provider>
  )
}
