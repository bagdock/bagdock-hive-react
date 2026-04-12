import type { HiveMapAdapter, MapInitOptions, MapInstance, MapFacility, MapAppearance } from "../types"

export interface MapTilerAdapterOptions {
  apiKey: string
  style?: string
  /** Pass-through options forwarded to maptilersdk.Map constructor */
  [key: string]: unknown
}

interface MapTilerInstance extends MapInstance {
  _map: unknown
  _markers: unknown[]
  _listeners: Array<() => void>
}

export function maptilerAdapter(
  options: MapTilerAdapterOptions,
): HiveMapAdapter<MapTilerAdapterOptions> {
  return {
    async init(
      opts: MapInitOptions & { nativeOptions?: MapTilerAdapterOptions },
    ): Promise<MapTilerInstance> {
      const maptilersdk = await import("@maptiler/sdk")
      const { apiKey, style, ...rest } = { ...options, ...opts.nativeOptions }

      maptilersdk.config.apiKey = apiKey

      const map = new maptilersdk.Map({
        container: opts.container,
        style: style ?? maptilersdk.MapStyle.STREETS,
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
      const inst = instance as MapTilerInstance

      for (const marker of inst._markers as Array<{ remove(): void }>) {
        marker.remove()
      }
      inst._markers = []

      void import("@maptiler/sdk").then((maptilersdk) => {
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

          const marker = new maptilersdk.Marker({ element: el })
            .setLngLat([fac.longitude, fac.latitude])
            .addTo(inst._map as InstanceType<typeof maptilersdk.Map>)

          ;(marker as unknown as { _facilityId: string })._facilityId = fac.id
          ;(inst._markers as unknown[]).push(marker)
        }
      })
    },

    fitBounds(instance, facilities, padding = 60) {
      void import("@maptiler/sdk").then((maptilersdk) => {
        const inst = instance as MapTilerInstance
        const map = inst._map as InstanceType<typeof maptilersdk.Map>

        const coords = facilities.filter((f) => f.latitude != null && f.longitude != null)
        if (coords.length === 0) return

        const bounds = new maptilersdk.LngLatBounds()
        for (const f of coords) {
          bounds.extend([f.longitude, f.latitude])
        }
        map.fitBounds(bounds, { padding, maxZoom: 15 })
      })
    },

    setSelected(instance, facilityId) {
      const inst = instance as MapTilerInstance
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
      const inst = instance as MapTilerInstance
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
