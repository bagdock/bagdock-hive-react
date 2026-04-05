import { createContext, useContext } from 'react'
import type { BagdockHive } from '@bagdock/hive'
import type { ResolvedTheme } from '../themes/types'

export interface HiveContextValue {
  client: BagdockHive | null
  theme: ResolvedTheme
  operatorId?: string
  embedToken?: string
}

export const HiveContext = createContext<HiveContextValue | null>(null)

export function useHive(): HiveContextValue {
  const ctx = useContext(HiveContext)
  if (!ctx) {
    throw new Error('useHive must be used within a <HiveProvider>')
  }
  return ctx
}

export function useHiveClient(): BagdockHive {
  const { client } = useHive()
  if (!client) {
    throw new Error('Hive client not configured. Provide an apiKey or embedToken to <HiveProvider>.')
  }
  return client
}
