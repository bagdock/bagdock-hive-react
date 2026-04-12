export interface MapFacility {
  id: string
  name: string
  latitude: number
  longitude: number
  address?: string
  price?: number
  priceFrom?: number
  currency?: string
  rating?: number
  reviewCount?: number
  imageUrl?: string
}

export interface MapInitOptions {
  container: HTMLElement
  center: [lng: number, lat: number]
  zoom: number
}

export interface MapPinStyle {
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number | string
  color?: string
  fontFamily?: string
  fontSize?: string | number
  fontWeight?: string | number
  padding?: string
  shadow?: string
  selectedBackgroundColor?: string
  selectedColor?: string
  selectedBorderColor?: string
  selectedScale?: number
}

export interface MapPopupStyle {
  backgroundColor?: string
  borderRadius?: number | string
  padding?: string
  shadow?: string
  maxWidth?: number
  fontFamily?: string
  color?: string
}

export interface MapClusterStyle {
  backgroundColor?: string
  color?: string
  borderRadius?: string
  size?: number
  fontWeight?: string | number
}

export interface MapAppearance {
  pin?: MapPinStyle
  popup?: MapPopupStyle
  cluster?: MapClusterStyle
  /** CSS border-radius applied to the map container */
  containerBorderRadius?: string
  /** CSS padding around the map container */
  containerPadding?: string
  /** Additional CSS class name for the map container */
  containerClassName?: string
}

export interface MapInstance {
  /** Opaque handle to the underlying native map object (e.g. mapboxgl.Map) */
  getNativeMap(): unknown
  destroy(): void
}

/**
 * Provider-agnostic map adapter contract.
 * `TNativeOptions` is a pass-through type for provider-specific options
 * (e.g. Mapbox style, Google Maps mapId, etc.).
 */
export interface HiveMapAdapter<TNativeOptions = Record<string, unknown>> {
  init(opts: MapInitOptions & { nativeOptions?: TNativeOptions }): Promise<MapInstance>
  setFacilities(instance: MapInstance, facilities: MapFacility[], appearance?: MapAppearance): void
  fitBounds(instance: MapInstance, facilities: MapFacility[], padding?: number): void
  setSelected(instance: MapInstance, facilityId: string | null): void
  onSelect(instance: MapInstance, cb: (facilityId: string) => void): () => void
}

export interface HiveMapViewProps<TNativeOptions = Record<string, unknown>> {
  adapter: HiveMapAdapter<TNativeOptions>
  facilities: MapFacility[]
  selectedId?: string | null
  onSelect?: (facilityId: string) => void
  center?: [lng: number, lat: number]
  zoom?: number
  appearance?: MapAppearance
  nativeOptions?: TNativeOptions
  className?: string
  style?: React.CSSProperties
  /** Auto-fit bounds when facilities change (default true) */
  autoFitBounds?: boolean
  /** Padding in px for fitBounds (default 60) */
  fitBoundsPadding?: number
}
