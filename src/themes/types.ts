export interface HiveAppearance {
  theme?: 'light' | 'dark' | 'auto'
  variables?: HiveThemeVariables
  elements?: Partial<HiveElementStyles>
}

export interface HiveThemeVariables {
  colorPrimary?: string
  colorPrimaryHover?: string
  colorBackground?: string
  colorSurface?: string
  colorSurfaceUser?: string
  colorSurfaceElevated?: string
  colorText?: string
  colorTextUser?: string
  colorTextSecondary?: string
  colorBorder?: string
  colorSuccess?: string
  colorWarning?: string
  colorDanger?: string
  colorChipBg?: string
  colorChipBorder?: string
  colorChipText?: string
  colorCodeBg?: string
  colorCodeText?: string
  fontFamily?: string
  fontFamilyMono?: string
  borderRadius?: string
  borderRadiusLg?: string
  shadow?: string
  shadowLg?: string
}

export interface HiveElementStyles {
  card?: string
  button?: string
  input?: string
  badge?: string
  avatar?: string
  chatBubble?: string
  chatInput?: string
}

export interface ResolvedTheme {
  variables: Required<HiveThemeVariables>
  elements: HiveElementStyles
  isDark: boolean
}

export const DEFAULT_THEME: Required<HiveThemeVariables> = {
  colorPrimary: '#111827',
  colorPrimaryHover: '#1f2937',
  colorBackground: '#ffffff',
  colorSurface: '#f9fafb',
  colorSurfaceUser: '#f3f4f6',
  colorSurfaceElevated: '#f9fafb',
  colorText: '#111827',
  colorTextUser: '#111827',
  colorTextSecondary: '#6b7280',
  colorBorder: '#e5e7eb',
  colorSuccess: '#059669',
  colorWarning: '#d97706',
  colorDanger: '#dc2626',
  colorChipBg: '#ffffff',
  colorChipBorder: '#e5e7eb',
  colorChipText: '#374151',
  colorCodeBg: '#f3f4f6',
  colorCodeText: '#374151',
  fontFamily: 'inherit',
  fontFamilyMono: '"SF Mono", "Fira Code", "Fira Mono", monospace',
  borderRadius: '0.75rem',
  borderRadiusLg: '1rem',
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
}

export const DARK_THEME: Required<HiveThemeVariables> = {
  colorPrimary: '#6366f1',
  colorPrimaryHover: '#4f46e5',
  colorBackground: '#0a0a0f',
  colorSurface: 'rgba(255, 255, 255, 0.04)',
  colorSurfaceUser: '#4f46e5',
  colorSurfaceElevated: 'rgba(255, 255, 255, 0.06)',
  colorText: '#f8fafc',
  colorTextUser: '#ffffff',
  colorTextSecondary: '#9ca3af',
  colorBorder: 'rgba(255, 255, 255, 0.08)',
  colorSuccess: '#059669',
  colorWarning: '#d97706',
  colorDanger: '#f87171',
  colorChipBg: 'rgba(255, 255, 255, 0.04)',
  colorChipBorder: 'rgba(255, 255, 255, 0.1)',
  colorChipText: '#e5e7eb',
  colorCodeBg: 'rgba(255, 255, 255, 0.08)',
  colorCodeText: '#e5e7eb',
  fontFamily: 'inherit',
  fontFamilyMono: '"SF Mono", "Fira Code", "Fira Mono", monospace',
  borderRadius: '0.75rem',
  borderRadiusLg: '1rem',
  shadow: 'none',
  shadowLg: 'none',
}

const VAR_MAP: Record<keyof HiveThemeVariables, string> = {
  colorPrimary: '--hive-color-primary',
  colorPrimaryHover: '--hive-color-primary-hover',
  colorBackground: '--hive-color-bg',
  colorSurface: '--hive-color-surface',
  colorSurfaceUser: '--hive-color-surface-user',
  colorSurfaceElevated: '--hive-color-surface-elevated',
  colorText: '--hive-color-text',
  colorTextUser: '--hive-color-text-user',
  colorTextSecondary: '--hive-color-text-secondary',
  colorBorder: '--hive-color-border',
  colorSuccess: '--hive-color-success',
  colorWarning: '--hive-color-warning',
  colorDanger: '--hive-color-danger',
  colorChipBg: '--hive-color-chip-bg',
  colorChipBorder: '--hive-color-chip-border',
  colorChipText: '--hive-color-chip-text',
  colorCodeBg: '--hive-color-code-bg',
  colorCodeText: '--hive-color-code-text',
  fontFamily: '--hive-font',
  fontFamilyMono: '--hive-font-mono',
  borderRadius: '--hive-radius',
  borderRadiusLg: '--hive-radius-lg',
  shadow: '--hive-shadow',
  shadowLg: '--hive-shadow-lg',
}

export function resolveTheme(appearance?: HiveAppearance, prefersDark?: boolean): ResolvedTheme {
  const isDark = appearance?.theme === 'dark' ||
    (appearance?.theme === 'auto' && (prefersDark ?? false))

  const preset = isDark ? DARK_THEME : DEFAULT_THEME
  const variables: Required<HiveThemeVariables> = { ...preset, ...appearance?.variables }
  const elements: HiveElementStyles = { ...appearance?.elements }

  return { variables, elements, isDark }
}

export function themeToStyle(variables: Required<HiveThemeVariables>): Record<string, string> {
  const style: Record<string, string> = {}
  for (const [key, cssVar] of Object.entries(VAR_MAP)) {
    const value = variables[key as keyof HiveThemeVariables]
    if (value) style[cssVar] = value
  }
  return style
}
