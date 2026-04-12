import type { HiveMapAdapter, MapInitOptions, MapInstance, MapFacility, MapAppearance } from "../types"

export interface GoogleMapsAdapterOptions {
  apiKey: string
  mapId?: string
  /** Pass-through options forwarded to google.maps.MapOptions */
  [key: string]: unknown
}

interface GMapsInstance extends MapInstance {
  _map: unknown
  _markers: unknown[]
  _listeners: Array<() => void>
  _facilityMap: Map<string, unknown>
  _selectCb: ((id: string) => void) | null
}

declare const google: any

export function googleMapsAdapter(
  options: GoogleMapsAdapterOptions,
): HiveMapAdapter<GoogleMapsAdapterOptions> {
  let loaderPromise: Promise<any> | null = null

  function loadApi(): Promise<any> {
    if (loaderPromise) return loaderPromise
    loaderPromise = new Promise((resolve, reject) => {
      if (typeof google !== "undefined" && google.maps) {
        resolve(google.maps)
        return
      }
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${options.apiKey}&libraries=marker&v=weekly`
      script.async = true
      script.onload = () => resolve(google.maps)
      script.onerror = reject
      document.head.appendChild(script)
    })
    return loaderPromise
  }

  return {
    async init(
      opts: MapInitOptions & { nativeOptions?: GoogleMapsAdapterOptions },
    ): Promise<GMapsInstance> {
      const maps = await loadApi()
      const { mapId, ...rest } = { ...options, ...opts.nativeOptions }

      const map = new maps.Map(opts.container, {
        center: { lat: opts.center[1], lng: opts.center[0] },
        zoom: opts.zoom,
        mapId: mapId ?? "HIVE_DEFAULT",
        ...rest,
      })

      return {
        _map: map,
        _markers: [],
        _listeners: [],
        _facilityMap: new Map(),
        _selectCb: null,
        getNativeMap: () => map,
        destroy: () => {
          // Google Maps doesn't have a destroy method; clear markers
        },
      }
    },

    setFacilities(instance, facilities, appearance) {
      const inst = instance as GMapsInstance
      for (const m of inst._markers as Array<{ map: unknown }>) m.map = null
      inst._markers = []
      inst._facilityMap.clear()

      const pin = appearance?.pin

      for (const fac of facilities) {
        if (fac.latitude == null || fac.longitude == null) continue

        const content = document.createElement("div")
        const price = fac.priceFrom ?? fac.price
        content.textContent = price != null ? `${fac.currency ?? "$"}${price}` : fac.name
        Object.assign(content.style, {
          background: pin?.backgroundColor ?? "#fff",
          border: `${pin?.borderWidth ?? 2}px solid ${pin?.borderColor ?? "#e5e7eb"}`,
          borderRadius: typeof pin?.borderRadius === "number"
            ? `${pin.borderRadius}px`
            : (pin?.borderRadius ?? "9999px"),
          padding: pin?.padding ?? "4px 10px",
          fontFamily: pin?.fontFamily ?? "inherit",
          fontSize: typeof pin?.fontSize === "number" ? `${pin.fontSize}px` : (pin?.fontSize ?? "13px"),
          fontWeight: String(pin?.fontWeight ?? 600),
          cursor: "pointer",
          boxShadow: pin?.shadow ?? "0 2px 6px rgba(0,0,0,0.15)",
          whiteSpace: "nowrap",
          transition: "transform 0.15s ease, background-color 0.15s ease",
        })

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: inst._map,
          position: { lat: fac.latitude, lng: fac.longitude },
          content,
        })

        if (inst._selectCb) {
          const id = fac.id
          marker.addListener("click", () => inst._selectCb!(id))
        }

        inst._markers.push(marker)
        inst._facilityMap.set(fac.id, marker)
      }
    },

    fitBounds(instance, facilities, padding = 60) {
      const inst = instance as GMapsInstance
      const bounds = new google.maps.LatLngBounds()
      let count = 0
      for (const f of facilities) {
        if (f.latitude != null && f.longitude != null) {
          bounds.extend({ lat: f.latitude, lng: f.longitude })
          count++
        }
      }
      if (count > 0) (inst._map as any).fitBounds(bounds, padding)
    },

    setSelected(instance, facilityId) {
      const inst = instance as GMapsInstance
      const pin = undefined as MapAppearance["pin"] | undefined
      for (const [id, marker] of inst._facilityMap) {
        const el = (marker as any).content as HTMLElement | null
        if (!el) continue
        const isSelected = id === facilityId
        el.style.transform = isSelected ? `scale(${pin?.selectedScale ?? 1.15})` : "scale(1)"
        el.style.zIndex = isSelected ? "10" : "1"
        el.style.backgroundColor = isSelected
          ? (pin?.selectedBackgroundColor ?? "#111827")
          : (pin?.backgroundColor ?? "#fff")
        el.style.color = isSelected
          ? (pin?.selectedColor ?? "#fff")
          : (pin?.color ?? "#111827")
        el.style.borderColor = isSelected
          ? (pin?.selectedBorderColor ?? "#111827")
          : (pin?.borderColor ?? "#e5e7eb")
      }
    },

    onSelect(instance, cb) {
      const inst = instance as GMapsInstance
      inst._selectCb = cb
      const unsubs: Array<() => void> = []

      for (const [id, marker] of inst._facilityMap) {
        const listener = (marker as any).addListener("click", () => cb(id))
        unsubs.push(() => google.maps.event.removeListener(listener))
      }

      inst._listeners.push(...unsubs)
      return () => {
        inst._selectCb = null
        for (const u of unsubs) u()
      }
    },
  }
}
