import React, { useState, useEffect, useCallback } from 'react'
import { useHiveClient } from '../hooks/useHiveContext'
import type { HiveUnit } from '@bagdock/hive'

export interface HiveBookingProps {
  facilityId?: string
  onBookingComplete?: (booking: { id: string; checkoutUrl?: string }) => void
  className?: string
}

export function HiveBooking({
  facilityId,
  onBookingComplete,
  className,
}: HiveBookingProps) {
  const client = useHiveClient()
  const [units, setUnits] = useState<HiveUnit[]>([])
  const [selectedUnit, setSelectedUnit] = useState<HiveUnit | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    moveInDate: '',
  })

  useEffect(() => {
    async function loadUnits() {
      try {
        const result = await client.units.list({ status: 'available', facilityId })
        setUnits(result.data)
      } catch {
        setError('Failed to load available units')
      } finally {
        setLoading(false)
      }
    }
    loadUnits()
  }, [client, facilityId])

  const handleBook = useCallback(async () => {
    if (!selectedUnit || !form.name || !form.email || !form.moveInDate) return

    setBooking(true)
    setError(null)

    try {
      const result = await client.units.book({
        unitId: selectedUnit.id,
        moveInDate: form.moveInDate,
        contactName: form.name,
        contactEmail: form.email,
        contactPhone: form.phone || undefined,
      })
      onBookingComplete?.(result)
    } catch (err) {
      setError('Booking failed. Please try again.')
    } finally {
      setBooking(false)
    }
  }, [client, selectedUnit, form, onBookingComplete])

  const formatPrice = (pence: number, currency: string) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(pence / 100)

  if (loading) {
    return (
      <div className={className} style={{ padding: 24, textAlign: 'center', color: 'var(--hive-color-text-secondary)' }}>
        Loading available units...
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
      {error && (
        <div style={{ padding: '10px 14px', marginBottom: 16, borderRadius: 'var(--hive-radius)', backgroundColor: '#fef2f2', color: 'var(--hive-color-danger)', fontSize: 14 }}>
          {error}
        </div>
      )}

      {!selectedUnit ? (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Available Units</h3>
          {units.length === 0 ? (
            <p style={{ color: 'var(--hive-color-text-secondary)', fontSize: 14 }}>No units available at this time.</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {units.map(unit => (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: 'var(--hive-radius)',
                    border: '1px solid var(--hive-color-border)',
                    backgroundColor: 'var(--hive-color-bg)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--hive-font-family)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{unit.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--hive-color-text-secondary)' }}>
                      {unit.width}x{unit.depth}{unit.height ? `x${unit.height}` : ''} · {unit.type}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {formatPrice(unit.pricePerMonth, unit.currency)}/mo
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedUnit(null)}
            style={{ fontSize: 14, color: 'var(--hive-color-primary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, fontFamily: 'var(--hive-font-family)' }}
          >
            ← Back to units
          </button>

          <div style={{ padding: 16, borderRadius: 'var(--hive-radius)', border: '1px solid var(--hive-color-border)', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{selectedUnit.name}</div>
            <div style={{ fontSize: 14, color: 'var(--hive-color-text-secondary)' }}>
              {selectedUnit.width}x{selectedUnit.depth} · {formatPrice(selectedUnit.pricePerMonth, selectedUnit.currency)}/mo
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {(['name', 'email', 'phone', 'moveInDate'] as const).map(field => (
              <div key={field}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: 'var(--hive-color-text-secondary)' }}>
                  {field === 'moveInDate' ? 'Move-in Date' : field.charAt(0).toUpperCase() + field.slice(1)}
                  {field !== 'phone' && ' *'}
                </label>
                <input
                  type={field === 'email' ? 'email' : field === 'moveInDate' ? 'date' : 'text'}
                  value={form[field]}
                  onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                  required={field !== 'phone'}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--hive-radius)',
                    border: '1px solid var(--hive-color-border)',
                    fontSize: 14,
                    fontFamily: 'var(--hive-font-family)',
                    backgroundColor: 'var(--hive-color-bg)',
                    color: 'var(--hive-color-text)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleBook}
            disabled={booking || !form.name || !form.email || !form.moveInDate}
            style={{
              width: '100%',
              marginTop: 16,
              padding: '12px 20px',
              borderRadius: 'var(--hive-radius)',
              border: 'none',
              backgroundColor: 'var(--hive-color-primary)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: booking ? 'wait' : 'pointer',
              opacity: booking || !form.name || !form.email || !form.moveInDate ? 0.5 : 1,
              fontFamily: 'var(--hive-font-family)',
            }}
          >
            {booking ? 'Processing...' : 'Book Unit'}
          </button>
        </div>
      )}
    </div>
  )
}
