import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    map: 'src/map-entry.ts',
    'map/mapbox': 'src/map-mapbox-entry.ts',
    'map/maptiler': 'src/map-maptiler-entry.ts',
    'map/stadia': 'src/map-stadia-entry.ts',
    'map/radar': 'src/map-radar-entry.ts',
    'map/google': 'src/map-google-entry.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: [
    'react', 'react-dom', 'lucide-react',
    'mapbox-gl', '@maptiler/sdk', 'maplibre-gl', 'radar-sdk-js',
  ],
  tsconfig: 'tsconfig.json',
})
