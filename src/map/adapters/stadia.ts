import type { HiveMapAdapter, MapInitOptions, MapInstance, MapFacility, MapAppearance } from "../types"

export interface StadiaAdapterOptions {
  apiKey: string
  style?: string
  /** Pass-through options forwarded to the maplibre-gl Map constructor */
  [key: string]: unknown
}

interface StadiaInstance extends MapInstance {
  _map: unknown
  _markers: unknown[]
  _listeners: Array<() => void>
}

const DEFAULT_STADIA_STYLE =
  "https://tiles.stadiamaps.com/styles/alidade_smooth.json"

export function stadiaAdapter(
  options: StadiaAdapterOptions,
): HiveMapAdapter<StadiaAdapterOptions> {
  return {
    async init(
      opts: MapInitOptions & { nativeOptions?: StadiaAdapterOptions },
    ): Promise<StadiaInstance> {
      const maplibregl = await import("maplibre-gl")
      const { apiKey, style, ...rest } = { ...options, ...opts.nativeOptions }

      const styleUrl = style ?? DEFAULT_STADIA_STYLE
      const separator = styleUrl.includes("?") ? "&" : "?"

      const map = new maplibregl.Map({
        container: opts.container,
        style: `${styleUrl}${separator}api_key=${apiKey}`,
        center: opts.center,
        zoom: opts.zoom,
        ...rest,
      })

      await new Promise<void>((resolve) => map.on("load", resolve))

      return {
        _map: map,
        _markers: [],
        _listeners: [],
        getNativeMap: () => map,
        destroy: () => map.remove(),
      }
    },

    setFacilities(instance, facilities, appearance) {
      const inst = instance as StadiaInstance

      for (const marker of inst._markers as Array<{ remove(): void }>) {
        marker.remove()
      }
      inst._markers = []

      void import("maplibre-gl").then((maplibregl) => {
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

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([fac.longitude, fac.latitude])
            .addTo(inst._map as InstanceType<typeof maplibregl.Map>)

          ;(marker as unknown as { _facilityId: string })._facilityId = fac.id
          ;(inst._markers as unknown[]).push(marker)
        }
      })
    },

    fitBounds(instance, facilities, padding = 60) {
      void import("maplibre-gl").then((maplibregl) => {
        const inst = instance as StadiaInstance
        const map = inst._map as InstanceType<typeof maplibregl.Map>

        const coords = facilities.filter((f) => f.latitude != null && f.longitude != null)
        if (coords.length === 0) return

        const bounds = new maplibregl.LngLatBounds()
        for (const f of coords) {
          bounds.extend([f.longitude, f.latitude])
        }
        map.fitBounds(bounds, { padding, maxZoom: 15 })
      })
    },

    setSelected(instance, facilityId) {
      const inst = instance as StadiaInstance
      for (const marker of inst._markers as Array<{
        getElement(): HTMLElement
        _facilityId: string
      }>) {
        const el = marker.getElement()
        const isSelected = marker._facilityId === facilityId
        el.style.transform = isSelected ? "scale(1.15)" : "scale(1)"
        el.style.zIndex = isSelected ? "10" : "1"
      }
    },

    onSelect(instance, cb) {
      const inst = instance as StadiaInstance
      const unsubs: Array<() => void> = []

      for (const marker of inst._markers as Array<{
        _facilityId: string
        getElement(): HTMLElement
      }>) {
        const listener = () => cb(marker._facilityId)
        marker.getElement().addEventListener("click", listener)
        unsubs.push(() => marker.getElement().removeEventListener("click", listener))
      }

      inst._listeners.push(...unsubs)
      return () => {
        for (const u of unsubs) u()
      }
    },
  }
}
