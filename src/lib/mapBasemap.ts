import L from 'leaflet'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'

const osmAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
const vectorAttribution =
  '<a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap</a> &copy; <a href="https://openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a>'
const fullVectorAttribution = `${vectorAttribution} | ${osmAttribution}`

/** Leaflet keeps handling gestures, clusters and markers over the vector basemap. */
export function addBasemap(map: L.Map): () => void {
  let disposed = false
  let failed = false
  let loaded = false
  let vector: L.Layer | undefined
  let fallback: L.TileLayer | undefined
  let timer: ReturnType<typeof setTimeout> | undefined

  const useFallback = () => {
    if (disposed || failed) return
    failed = true
    clearTimeout(timer)
    if (vector && map.hasLayer(vector)) map.removeLayer(vector)
    map.attributionControl?.removeAttribution(fullVectorAttribution)
    fallback = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'map-fallback-tile',
      attribution: osmAttribution,
    }).addTo(map)
  }

  const loadVector = async () => {
    try {
      const probe = document.createElement('canvas').getContext('webgl2')
      if (!probe) return useFallback()
      probe.getExtension('WEBGL_lose_context')?.loseContext()
      const [{ maplibreGL }, { setWorkerUrl }] = await Promise.all([
        import('@maplibre/maplibre-gl-leaflet'),
        import('maplibre-gl'),
      ])
      if (disposed) return
      setWorkerUrl(workerUrl)
      timer = setTimeout(useFallback, 12000)
      const layer = maplibreGL({
        style: 'https://tiles.openfreemap.org/styles/positron',
        attributionControl: false,
        // Prefer Russian names where supplied by OpenMapTiles, then local names.
        transformStyle: (_previous, next) => {
          for (const layer of next.layers) {
            if (
              layer.type === 'symbol' &&
              layer.layout?.['text-field'] &&
              JSON.stringify(layer.layout['text-field']).includes('name')
            ) {
              layer.layout['text-field'] = [
                'coalesce', ['get', 'name:ru'], ['get', 'name_ru'],
                ['get', 'name'], ['get', 'name:latin'],
              ]
            }
          }
          return next
        },
      }) as unknown as L.Layer & {
        getMaplibreMap(): import('maplibre-gl').Map | undefined
        getContainer(): HTMLDivElement | undefined
      }
      // The adapter can be registered with Leaflet before GL construction fails.
      // Its normal onRemove assumes GL exists, so also handle that partial state.
      const onRemove = layer.onRemove
      layer.onRemove = function (leafletMap) {
        if (this.getMaplibreMap()) return onRemove.call(this, leafletMap)
        this.getContainer()?.remove()
        return this
      }
      vector = layer
      layer.addTo(map)
      const glMap = layer.getMaplibreMap()
      if (!glMap) return useFallback()
      // A transient tile error after startup should not replace a working style.
      glMap.on('error', () => {
        if (!loaded) useFallback()
      })
      glMap.on('webglcontextlost', useFallback)
      glMap.once('load', () => {
        if (disposed || failed) return
        loaded = true
        clearTimeout(timer)
        map.attributionControl?.addAttribution(fullVectorAttribution)
      })
    } catch {
      useFallback()
    }
  }
  void loadVector()

  return () => {
    disposed = true
    clearTimeout(timer)
    if (vector && map.hasLayer(vector)) map.removeLayer(vector)
    if (fallback && map.hasLayer(fallback)) map.removeLayer(fallback)
  }
}
