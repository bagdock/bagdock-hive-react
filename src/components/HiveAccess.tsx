import React, { useState, useEffect, useCallback } from 'react'
import { useHiveClient } from '../hooks/useHiveContext'
import type { AccessCode } from '@bagdock/hive'

export interface HiveAccessProps {
  unitId: string
  showHistory?: boolean
  className?: string
}

export function HiveAccess({
  unitId,
  showHistory = true,
  className,
}: HiveAccessProps) {
  const client = useHiveClient()
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [history, setHistory] = useState<{ id: string; eventType: string; accessPointName: string; status: string; timestamp: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [codesResult, historyResult] = await Promise.all([
          client.access.getCodes(unitId),
          showHistory ? client.access.getHistory(unitId, { limit: 10 }) : Promise.resolve({ data: [] }),
        ])
        setCodes(codesResult.data)
        setHistory((historyResult as any).data || [])
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [client, unitId, showHistory])

  const handleUnlock = useCallback(async (accessPointId: string) => {
    setUnlocking(accessPointId)
    try {
      await client.access.unlock(accessPointId)
    } catch {
      // handle error
    } finally {
      setUnlocking(null)
    }
  }, [client])

  if (loading) {
    return (
      <div className={className} style={{ padding: 24, textAlign: 'center', color: 'var(--hive-color-text-secondary)' }}>
        Loading access info...
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        fontFamily: 'var(--hive-font-family)',
        color: 'var(--hive-color-text)',
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Access Codes</h3>

      {codes.length === 0 ? (
        <p style={{ color: 'var(--hive-color-text-secondary)', fontSize: 14, marginBottom: 16 }}>
          No access codes available for this unit.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
          {codes.map(code => (
            <div
              key={code.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 'var(--hive-radius)',
                border: '1px solid var(--hive-color-border)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 18, letterSpacing: 2, fontFamily: 'var(--hive-font-mono)' }}>
                  {code.code}
                </div>
                <div style={{ fontSize: 12, color: 'var(--hive-color-text-secondary)', marginTop: 2 }}>
                  {code.type.toUpperCase()} · Valid from {new Date(code.validFrom).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showHistory && history.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Recent Activity</h3>
          <div style={{ display: 'grid', gap: 4 }}>
            {history.map(event => (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  fontSize: 13,
                  borderRadius: 'var(--hive-radius)',
                  backgroundColor: event.status === 'granted'
                    ? 'rgba(5, 150, 105, 0.05)'
                    : event.status === 'denied'
                    ? 'rgba(220, 38, 38, 0.05)'
                    : 'var(--hive-color-surface)',
                }}
              >
                <span>
                  <span style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    marginRight: 8,
                    backgroundColor: event.status === 'granted' ? 'var(--hive-color-success)' : 'var(--hive-color-danger)',
                  }} />
                  {event.accessPointName} — {event.eventType}
                </span>
                <span style={{ color: 'var(--hive-color-text-secondary)' }}>
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
