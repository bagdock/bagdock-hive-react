import type { HiveMapAdapter, MapInitOptions, MapInstance, MapFacility, MapAppearance } from "../types"

export interface MapboxAdapterOptions {
  accessToken: string
  style?: string
  /** Pass-through options forwarded to the mapboxgl.Map constructor */
  [key: string]: unknown
}

interface MapboxMapInstance extends MapInstance {
  _map: InstanceType<typeof import("mapbox-gl").Map>
  _markers: Array<InstanceType<typeof import("mapbox-gl").Marker> & { _facilityId: string }>
  _listeners: Array<() => void>
  _mapboxgl: typeof import("mapbox-gl")
  _selectCb: ((id: string) => void) | null
}

function createPinElement(
  facility: MapFacility,
  appearance?: MapAppearance,
  selected = false,
): HTMLElement {
  const el = document.createElement("div")
  const pin = appearance?.pin

  Object.assign(el.style, {
    backgroundColor: selected
      ? (pin?.selectedBackgroundColor ?? "#111827")
      : (pin?.backgroundColor ?? "#ffffff"),
    color: selected
      ? (pin?.selectedColor ?? "#ffffff")
      : (pin?.color ?? "#111827"),
    border: `${pin?.borderWidth ?? 2}px solid ${
      selected ? (pin?.selectedBorderColor ?? "#111827") : (pin?.borderColor ?? "#e5e7eb")
    }`,
    borderRadius: typeof pin?.borderRadius === "number"
      ? `${pin.borderRadius}px`
      : (pin?.borderRadius ?? "9999px"),
    padding: pin?.padding ?? "4px 10px",
    fontFamily: pin?.fontFamily ?? "inherit",
    fontSize: typeof pin?.fontSize === "number" ? `${pin.fontSize}px` : (pin?.fontSize ?? "13px"),
    fontWeight: String(pin?.fontWeight ?? 600),
    boxShadow: pin?.shadow ?? "0 2px 6px rgba(0,0,0,0.15)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "transform 0.15s ease, background-color 0.15s ease",
    transform: selected ? `scale(${pin?.selectedScale ?? 1.15})` : "scale(1)",
    zIndex: selected ? "10" : "1",
  })

  const price = facility.priceFrom ?? facility.price
  el.textContent = price != null
    ? `${facility.currency ?? "$"}${price}`
    : facility.name

  return el
}

export function mapboxAdapter(options: MapboxAdapterOptions): HiveMapAdapter<MapboxAdapterOptions> {
  return {
    async init(opts: MapInitOptions & { nativeOptions?: MapboxAdapterOptions }): Promise<MapboxMapInstance> {
      const mapboxgl = await import("mapbox-gl")
      const { accessToken, style, ...rest } = { ...options, ...opts.nativeOptions }

      ;(mapboxgl as unknown as { accessToken: string }).accessToken = accessToken

      const map = new mapboxgl.Map({
        container: opts.container,
        style: style ?? "mapbox://styles/mapbox/light-v11",
        center: opts.center,
        zoom: opts.zoom,
        ...rest,
      })

      await new Promise<void>((resolve) => map.on("load", resolve))

      return {
        _map: map,
        _markers: [],
        _listeners: [],
        _mapboxgl: mapboxgl,
        _selectCb: null,
        getNativeMap: () => map,
        destroy: () => map.remove(),
      } as unknown as MapboxMapInstance
    },

    setFacilities(instance, facilities, appearance) {
      const inst = instance as unknown as MapboxMapInstance

      for (const marker of inst._markers) marker.remove()
      inst._markers = []

      const mapboxgl = inst._mapboxgl

      for (const fac of facilities) {
        if (fac.latitude == null || fac.longitude == null) continue
        const el = createPinElement(fac, appearance)
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([fac.longitude, fac.latitude])
          .addTo(inst._map) as InstanceType<typeof mapboxgl.Marker> & { _facilityId: string }
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
      const inst = instance as unknown as MapboxMapInstance
      const mapboxgl = inst._mapboxgl

      const coords = facilities.filter((f) => f.latitude != null && f.longitude != null)
      if (coords.length === 0) return

      const bounds = new mapboxgl.LngLatBounds()
      for (const f of coords) {
        bounds.extend([f.longitude, f.latitude])
      }
      inst._map.fitBounds(bounds, { padding, maxZoom: 15 })
    },

    setSelected(instance, facilityId) {
      const inst = instance as unknown as MapboxMapInstance
      for (const marker of inst._markers) {
        const el = marker.getElement()
        const isSelected = marker._facilityId === facilityId
        el.style.transform = isSelected ? "scale(1.15)" : "scale(1)"
        el.style.zIndex = isSelected ? "10" : "1"
      }
    },

    onSelect(instance, cb) {
      const inst = instance as unknown as MapboxMapInstance
      inst._selectCb = cb

      const handler = (marker: MapboxMapInstance["_markers"][number]) => {
        const listener = () => cb(marker._facilityId)
        marker.getElement().addEventListener("click", listener)
        inst._listeners.push(() => marker.getElement().removeEventListener("click", listener))
      }

      for (const marker of inst._markers) handler(marker)

      return () => {
        inst._selectCb = null
        for (const unsub of inst._listeners) unsub()
        inst._listeners = []
      }
    },
  }
}
