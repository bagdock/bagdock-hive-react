"use client"

import { useEffect, useRef, useCallback } from "react"
import type { HiveMapViewProps, MapInstance, MapFacility, MapAppearance } from "./types"

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

  const facilitiesRef = useRef(facilities)
  facilitiesRef.current = facilities
  const appearanceRef = useRef(appearance)
  appearanceRef.current = appearance
  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId
  const autoFitRef = useRef(autoFitBounds)
  autoFitRef.current = autoFitBounds
  const fitPaddingRef = useRef(fitBoundsPadding)
  fitPaddingRef.current = fitBoundsPadding
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

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

        adapter.setFacilities(inst, facilitiesRef.current, appearanceRef.current)

        if (autoFitRef.current && facilitiesRef.current.length > 1) {
          adapter.fitBounds(inst, facilitiesRef.current, fitPaddingRef.current)
        }

        if (selectedIdRef.current) {
          adapter.setSelected(inst, selectedIdRef.current)
        }

        unsubRef.current = adapter.onSelect(inst, (id) => onSelectRef.current?.(id))
      })

    return () => {
      cancelled = true
      unsubRef.current?.()
      unsubRef.current = null
      instanceRef.current?.destroy()
      instanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter])

  useEffect(() => {
    const inst = instanceRef.current
    if (!inst) return

    adapter.setFacilities(inst, facilities, appearance)

    if (autoFitBounds && facilities.length > 1) {
      adapter.fitBounds(inst, facilities, fitBoundsPadding)
    }

    unsubRef.current?.()
    unsubRef.current = adapter.onSelect(inst, (id) => onSelectRef.current?.(id))
  }, [adapter, facilities, appearance, autoFitBounds, fitBoundsPadding])

  useEffect(() => {
    const inst = instanceRef.current
    if (!inst) return
    adapter.setSelected(inst, selectedId ?? null)
  }, [adapter, selectedId])

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
