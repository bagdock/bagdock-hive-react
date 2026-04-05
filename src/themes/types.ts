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
  colorText?: string
  colorTextSecondary?: string
  colorBorder?: string
  colorSuccess?: string
  colorWarning?: string
  colorDanger?: string
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
  colorText: '#111827',
  colorTextSecondary: '#6b7280',
  colorBorder: '#e5e7eb',
  colorSuccess: '#059669',
  colorWarning: '#d97706',
  colorDanger: '#dc2626',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMono: '"SF Mono", "Fira Code", "Fira Mono", monospace',
  borderRadius: '0.75rem',
  borderRadiusLg: '1rem',
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
}
