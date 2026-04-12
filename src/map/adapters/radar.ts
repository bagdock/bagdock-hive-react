import type { HiveMapAdapter, MapInitOptions, MapInstance, MapFacility, MapAppearance } from "../types"

export interface RadarAdapterOptions {
  publishableKey: string
  style?: string
  /** Pass-through options forwarded to the Radar map constructor */
  [key: string]: unknown
}

interface RadarInstance extends MapInstance {
  _map: unknown
  _markers: unknown[]
  _listeners: Array<() => void>
  _selectCb: ((id: string) => void) | null
}

export function radarAdapter(
  options: RadarAdapterOptions,
): HiveMapAdapter<RadarAdapterOptions> {
  let initPromise: Promise<{ Radar: unknown }> | null = null

  function loadSdk(): Promise<{ Radar: unknown }> {
    if (initPromise) return initPromise
    initPromise = import("radar-sdk-js").then((mod) => {
      const Radar = (mod as unknown as { default: { initialize(key: string): void } }).default
      Radar.initialize(options.publishableKey)
      return { Radar }
    })
    return initPromise
  }

  return {
    async init(
      opts: MapInitOptions & { nativeOptions?: RadarAdapterOptions },
    ): Promise<RadarInstance> {
      const { Radar } = await loadSdk()
      const { style, ...rest } = { ...options, ...opts.nativeOptions }

      const map = (
        Radar as { ui: { map(opts: Record<string, unknown>): unknown }
      }).ui.map({
        container: opts.container,
        center: { longitude: opts.center[0], latitude: opts.center[1] },
        zoom: opts.zoom,
        style,
        ...rest,
      })

      return {
        _map: map,
        _markers: [],
        _listeners: [],
        _selectCb: null,
        getNativeMap: () => map,
        destroy: () => {
          try {
            (map as { remove(): void }).remove()
          } catch {
            // Radar may not expose remove()
          }
        },
      }
    },

    setFacilities(instance, facilities, appearance) {
      const inst = instance as RadarInstance
      for (const m of inst._markers as Array<{ remove?(): void }>) {
        m.remove?.()
      }
      inst._markers = []

      for (const fac of facilities) {
        if (fac.latitude == null || fac.longitude == null) continue

        const el = document.createElement("div")
        const pin = appearance?.pin
        const price = fac.priceFrom ?? fac.price
        el.textContent = price != null ? `${fac.currency ?? "$"}${price}` : fac.name
        Object.assign(el.style, {
          background: pin?.backgroundColor ?? "#fff",
          border: `${pin?.borderWidth ?? 2}px solid ${pin?.borderColor ?? "#e5e7eb"}`,
          borderRadius: typeof pin?.borderRadius === "number"
            ? `${pin.borderRadius}px`
            : (pin?.borderRadius ?? "9999px"),
          padding: pin?.padding ?? "4px 10px",
          fontSize: typeof pin?.fontSize === "number" ? `${pin.fontSize}px` : (pin?.fontSize ?? "13px"),
          fontWeight: String(pin?.fontWeight ?? 600),
          cursor: "pointer",
          boxShadow: pin?.shadow ?? "0 2px 6px rgba(0,0,0,0.15)",
        })

        const marker = (
          inst._map as {
            addMarker(opts: {
              element: HTMLElement
              longitude: number
              latitude: number
            }): unknown
          }
        ).addMarker({
          element: el,
          longitude: fac.longitude,
          latitude: fac.latitude,
        })

        ;(marker as { _facilityId?: string })._facilityId = fac.id

        if (inst._selectCb) {
          const id = fac.id
          const cb = inst._selectCb
          el.addEventListener("click", () => cb(id))
        }

        ;(inst._markers as unknown[]).push(marker)
      }
    },

    fitBounds(instance, facilities, padding = 60) {
      const inst = instance as RadarInstance
      const coords = facilities.filter((f) => f.latitude != null && f.longitude != null)
      if (coords.length === 0) return

      const map = inst._map as {
        fitBounds(bounds: [[number, number], [number, number]], opts?: Record<string, unknown>): void
      }

      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
      for (const f of coords) {
        if (f.longitude < minLng) minLng = f.longitude
        if (f.latitude < minLat) minLat = f.latitude
        if (f.longitude > maxLng) maxLng = f.longitude
        if (f.latitude > maxLat) maxLat = f.latitude
      }

      map.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding, maxZoom: 15 },
      )
    },

    setSelected(instance, facilityId) {
      const inst = instance as RadarInstance
      for (const marker of inst._markers as Array<{
        _facilityId?: string
        getElement?(): HTMLElement
      }>) {
        const el = marker.getElement?.()
        if (!el) continue
        const isSelected = marker._facilityId === facilityId
        el.style.transform = isSelected ? "scale(1.15)" : "scale(1)"
        el.style.zIndex = isSelected ? "10" : "1"
      }
    },

    onSelect(instance, cb) {
      const inst = instance as RadarInstance
      inst._selectCb = cb
      const unsubs: Array<() => void> = []

      for (const marker of inst._markers as Array<{
        _facilityId?: string
        getElement?(): HTMLElement
      }>) {
        const el = marker.getElement?.()
        if (!el || !marker._facilityId) continue
        const id = marker._facilityId
        const listener = () => cb(id)
        el.addEventListener("click", listener)
        unsubs.push(() => el.removeEventListener("click", listener))
      }

      inst._listeners.push(...unsubs)
      return () => {
        inst._selectCb = null
        for (const u of unsubs) u()
      }
    },
  }
}
