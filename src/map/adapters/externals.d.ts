/**
 * Ambient module declarations for optional map provider SDKs.
 *
 * These are dynamically imported at runtime only when the corresponding
 * adapter is used. Users install only the SDK they need.
 */

declare module "mapbox-gl" {
  export let accessToken: string
  export class Map {
    constructor(opts: Record<string, unknown>)
    on(event: string, cb: () => void): void
    remove(): void
    fitBounds(bounds: LngLatBounds, opts?: Record<string, unknown>): void
  }
  export class Marker {
    constructor(opts?: Record<string, unknown>)
    setLngLat(lngLat: [number, number]): Marker
    addTo(map: Map): Marker
    getElement(): HTMLElement
    remove(): void
  }
  export class LngLatBounds {
    extend(lngLat: [number, number]): LngLatBounds
  }
}

declare module "@maptiler/sdk" {
  export const config: { apiKey: string }
  export const MapStyle: { STREETS: string }
  export class Map {
    constructor(opts: Record<string, unknown>)
    on(event: string, cb: () => void): void
    remove(): void
    fitBounds(bounds: LngLatBounds, opts?: Record<string, unknown>): void
  }
  export class Marker {
    constructor(opts?: Record<string, unknown>)
    setLngLat(lngLat: [number, number]): Marker
    addTo(map: Map): Marker
    getElement(): HTMLElement
    remove(): void
  }
  export class LngLatBounds {
    extend(lngLat: [number, number]): LngLatBounds
  }
}

declare module "maplibre-gl" {
  export class Map {
    constructor(opts: Record<string, unknown>)
    on(event: string, cb: () => void): void
    remove(): void
    fitBounds(bounds: LngLatBounds, opts?: Record<string, unknown>): void
  }
  export class Marker {
    constructor(opts?: Record<string, unknown>)
    setLngLat(lngLat: [number, number]): Marker
    addTo(map: Map): Marker
    getElement(): HTMLElement
    remove(): void
  }
  export class LngLatBounds {
    extend(lngLat: [number, number]): LngLatBounds
  }
}

declare module "radar-sdk-js" {
  const Radar: {
    initialize(key: string): void
    ui: {
      map(opts: Record<string, unknown>): unknown
    }
  }
  export default Radar
}
