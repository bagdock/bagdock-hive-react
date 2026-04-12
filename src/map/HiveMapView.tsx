"use client"

import { useEffect, useRef, useCallback } from "react"
import type { HiveMapViewProps, MapInstance } from "./types"

const DEFAULT_CENTER: [number, number] = [-73.985, 40.748]
const DEFAULT_ZOOM = 12
const DEFAULT_FIT_PADDING = 60

export function HiveMapView<TNativeOptions = Record<string, unknown>>({
  adapter,
  facilities,
  selectedId,
  onSelect,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  appearance,
  nativeOptions,
  className,
  style,
  autoFitBounds = true,
  fitBoundsPadding = DEFAULT_FIT_PADDING,
}: HiveMapViewProps<TNativeOptions>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<MapInstance | null>(null)
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let cancelled = false

    adapter
      .init({ container: el, center, zoom, nativeOptions })
      .then((inst) => {
        if (cancelled) {
          inst.destroy()
          return
        }
        instanceRef.current = inst

        adapter.setFacilities(inst, facilities, appearance)

        if (autoFitBounds && facilities.length > 1) {
          adapter.fitBounds(inst, facilities, fitBoundsPadding)
        }

        if (selectedId) {
          adapter.setSelected(inst, selectedId)
        }

        unsubRef.current = adapter.onSelect(inst, (id) => onSelect?.(id))
      })

    return () => {
      cancelled = true
      unsubRef.current?.()
      unsubRef.current = null
      instanceRef.current?.destroy()
      instanceRef.current = null
    }
    // Only re-init when adapter or container-level options change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter])

  useEffect(() => {
    const inst = instanceRef.current
    if (!inst) return
    adapter.setFacilities(inst, facilities, appearance)
    if (autoFitBounds && facilities.length > 1) {
      adapter.fitBounds(inst, facilities, fitBoundsPadding)
    }
  }, [adapter, facilities, appearance, autoFitBounds, fitBoundsPadding])

  useEffect(() => {
    const inst = instanceRef.current
    if (!inst) return
    adapter.setSelected(inst, selectedId ?? null)
  }, [adapter, selectedId])

  const handleSelect = useCallback(
    (id: string) => onSelect?.(id),
    [onSelect],
  )

  useEffect(() => {
    const inst = instanceRef.current
    if (!inst) return
    unsubRef.current?.()
    unsubRef.current = adapter.onSelect(inst, handleSelect)
  }, [adapter, handleSelect])

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderRadius: appearance?.containerBorderRadius,
    padding: appearance?.containerPadding,
    overflow: "hidden",
    ...style,
  }

  return (
    <div
      ref={containerRef}
      className={[appearance?.containerClassName, className]
        .filter(Boolean)
        .join(" ") || undefined}
      style={containerStyle}
    />
  )
}
