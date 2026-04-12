import type { HiveMapAdapter, MapInitOptions, MapInstance, MapFacility, MapAppearance } from "../types"

export interface MapTilerAdapterOptions {
  apiKey: string
  style?: string
  /** Pass-through options forwarded to maptilersdk.Map constructor */
  [key: string]: unknown
}

interface MapTilerInstance extends MapInstance {
  _map: InstanceType<typeof import("@maptiler/sdk").Map>
  _markers: Array<InstanceType<typeof import("@maptiler/sdk").Marker> & { _facilityId: string }>
  _listeners: Array<() => void>
  _sdk: typeof import("@maptiler/sdk")
  _selectCb: ((id: string) => void) | null
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
        _sdk: maptilersdk,
        _selectCb: null,
        getNativeMap: () => map,
        destroy: () => map.remove(),
      } as unknown as MapTilerInstance
    },

    setFacilities(instance, facilities, appearance) {
      const inst = instance as unknown as MapTilerInstance
      const maptilersdk = inst._sdk

      for (const marker of inst._markers) marker.remove()
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
          whiteSpace: "nowrap",
          transition: "transform 0.15s ease, background-color 0.15s ease",
        })

        const marker = new maptilersdk.Marker({ element: el })
          .setLngLat([fac.longitude, fac.latitude])
          .addTo(inst._map) as InstanceType<typeof maptilersdk.Marker> & { _facilityId: string }
        marker._facilityId = fac.id

        if (inst._selectCb) {
          const id = fac.id
          const cb = inst._selectCb
          el.addEventListener("click", () => cb(id))
        }

        inst._markers.push(marker)
      }
    },

    fitBounds(instance, facilities, padding = 60) {
      const inst = instance as unknown as MapTilerInstance
      const maptilersdk = inst._sdk

      const coords = facilities.filter((f) => f.latitude != null && f.longitude != null)
      if (coords.length === 0) return

      const bounds = new maptilersdk.LngLatBounds()
      for (const f of coords) {
        bounds.extend([f.longitude, f.latitude])
      }
      inst._map.fitBounds(bounds, { padding, maxZoom: 15 })
    },

    setSelected(instance, facilityId) {
      const inst = instance as unknown as MapTilerInstance
      for (const marker of inst._markers) {
        const el = marker.getElement()
        const isSelected = marker._facilityId === facilityId
        el.style.transform = isSelected ? "scale(1.15)" : "scale(1)"
        el.style.zIndex = isSelected ? "10" : "1"
      }
    },

    onSelect(instance, cb) {
      const inst = instance as unknown as MapTilerInstance
      inst._selectCb = cb
      const unsubs: Array<() => void> = []

      for (const marker of inst._markers) {
        const listener = () => cb(marker._facilityId)
        marker.getElement().addEventListener("click", listener)
        unsubs.push(() => marker.getElement().removeEventListener("click", listener))
      }

      inst._listeners.push(...unsubs)
      return () => {
        inst._selectCb = null
        for (const u of unsubs) u()
      }
    },
  }
}
