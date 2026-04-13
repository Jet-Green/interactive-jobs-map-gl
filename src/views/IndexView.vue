<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-providers'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { clinics } from '../data/vacancies'

const dialog = ref(false)
const showContacts = ref(false)
const showConditions = ref(false)
const selectedClinic = ref<any>(null)
const showFilters = ref(false)
const selectedFilters = ref<any[]>([])

const jobCategories = [
  'Врач стоматолог',
  'Средний медицинский персонал',
  'Младший медицинский персонал',
  'Главврач, управляющий',
]

const hasValidCoords = (c: { lat: unknown; lng: unknown }) =>
  typeof c.lat === 'number' &&
  typeof c.lng === 'number' &&
  Number.isFinite(c.lat) &&
  Number.isFinite(c.lng)

const filteredClinics = computed(() => {
  if (selectedFilters.value.length === 0) return clinics
  return clinics.filter((c) => c.jobName && selectedFilters.value.includes(c.jobName))
})

const clinicsOnMap = computed(() => filteredClinics.value.filter(hasValidCoords))

const getMapCenter = (): [number, number] => {
  const withCoords = clinicsOnMap.value
  if (withCoords.length === 0) return [58.010259, 56.234195]
  const avgLat = withCoords.reduce((sum, c) => sum + c.lat, 0) / withCoords.length
  const avgLng = withCoords.reduce((sum, c) => sum + c.lng, 0) / withCoords.length
  return [avgLat, avgLng]
}

/** На телефоне — более отдалённый стартовый зум, чтобы было видно больше точек. */
const getInitialZoom = (): number => {
  if (typeof window === 'undefined') return 5
  return window.matchMedia('(max-width: 600px)').matches ? 3 : 5
}

watch(clinicsOnMap, () => {
  updateMarkers()
})

const toggleFilter = (category: any) => {
  const index = selectedFilters.value.indexOf(category)
  if (index === -1) {
    selectedFilters.value.push(category)
  } else {
    selectedFilters.value.splice(index, 1)
  }
}

let map: any = null

onMounted(() => {
  // Fix for marker icons in production
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
  }).setView(getMapCenter(), getInitialZoom())

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.tileLayer.provider('CartoDB.Positron').addTo(map)

  L.control
    .attribution({ position: 'bottomright' })
    .addAttribution(
      '<a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    )

  updateMarkers()
})

let markerClusterGroup: any = null

const updateMarkers = () => {
  if (!map) return

  if (markerClusterGroup) {
    map.removeLayer(markerClusterGroup)
  }

  markerClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    iconCreateFunction: (cluster: any) => {
      const count = cluster.getChildCount()
      return L.divIcon({
        html: `<div class="cluster-icon">${count}</div>`,
        className: 'custom-cluster-icon',
        iconSize: L.point(50, 50),
      })
    },
  })

  clinicsOnMap.value.forEach((clinic: any) => {
    if (!hasValidCoords(clinic)) return
    L.marker([clinic.lat, clinic.lng])
      .on('click', () => {
        selectedClinic.value = clinic
        dialog.value = true
      })
      .addTo(markerClusterGroup)
  })

  map.addLayer(markerClusterGroup)
}
</script>

<template>
  <div>
    <div class="header-overlay">
      <div class="header-title">Медицинский скаут</div>
      <div class="header-subtitle">Для врачей и младшего медперсонала</div>
      <div class="header-stats">Уже 70 организаций нашли своих специалистов</div>
    </div>

    <div id="map" style="height: 100vh"></div>

    <div class="footer-overlay">
      <v-btn size="x-large" class="footer-button" @click="showConditions = true">
        Начать работу
      </v-btn>
      <div class="contacts-link" @click="showContacts = true">О компании</div>
    </div>

    <v-dialog v-model="showContacts" max-width="400" scrim="transparent">
      <v-card class="glass-card">
        <v-card-title class="glass-title">
          <v-row align="center" justify="space-between" no-gutters>
            <v-col cols="10">О компании</v-col>
            <v-col cols="2" class="text-right">
              <v-btn class="close-btn" @click="showContacts = false">
                <v-icon icon="mdi-close" size="large"></v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text class="glass-text">
          <div class="contact-info-item">
            <div class="contact-label">Название организации</div>
            <div class="contact-value">
              ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ ГЛАЗЫРИНА АННА ГЕННАДЬЕВНА
            </div>
          </div>
          <div class="contact-info-item">
            <div class="contact-label">ИНН</div>
            <div class="contact-value">590775289940</div>
          </div>
          <div class="contact-info-item">
            <div class="contact-label">ОГРН/ОГРНИП</div>
            <div class="contact-value">324595800023518</div>
          </div>
          <div class="contact-info-item">
            <div class="contact-label">ВК</div>
            <a href="https://vk.ru/glazyrina_ag" target="_blank" class="contact-link"
              >https://vk.ru/glazyrina_ag</a
            >
          </div>
          <div class="contact-info-item">
            <div class="contact-label">Max</div>
            <div class="contact-value">+7 982 256-45-91</div>
          </div>
          <div class="contact-tile">
            <div class="contact-tile-title">Все права защищены</div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-badge
      v-if="selectedFilters.length > 0"
      :content="selectedFilters.length"
      color="#667eea"
      class="filter-badge"
    >
      <v-btn class="filter-btn" icon size="large" @click="showFilters = !showFilters">
        <v-icon icon="mdi-filter-variant"></v-icon>
      </v-btn>
    </v-badge>
    <v-btn v-else class="filter-btn" icon size="large" @click="showFilters = !showFilters">
      <v-icon icon="mdi-filter-variant"></v-icon>
    </v-btn>

    <transition name="fade">
      <div v-if="showFilters" class="filters-container">
        <div class="filters-panel">
          <div class="filters-title">Фильтры</div>
          <div class="filters-chips">
            <button
              v-for="category in jobCategories"
              :key="category"
              class="glass-chip"
              :class="{ active: selectedFilters.includes(category) }"
              @click="toggleFilter(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <v-dialog v-model="dialog" max-width="500" scrim="transparent">
      <v-card v-if="selectedClinic" class="glass-card vacancy-card">
        <v-card-title class="glass-title">
          <v-row align="center" justify="space-between" no-gutters>
            <v-col cols="10" class="glass-title-stack">
              <div class="glass-title-text">
                {{ selectedClinic.vacancyTitle || selectedClinic.jobName || 'Вакансия' }}
              </div>
              <div
                v-if="selectedClinic.organization || selectedClinic.city"
                class="glass-title-org"
              >
                <template v-if="selectedClinic.organization">{{
                  selectedClinic.organization
                }}</template>
                <template v-if="selectedClinic.organization && selectedClinic.city"> · </template>
                <template v-if="selectedClinic.city">{{ selectedClinic.city }}</template>
              </div>
              <div v-if="selectedClinic.jobName" class="glass-title-cat">
                {{ selectedClinic.jobName }}
              </div>
            </v-col>
            <v-col cols="2" class="text-right">
              <v-btn class="close-btn" @click="dialog = false">
                <v-icon icon="mdi-close" size="large"></v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>

        <div v-if="selectedClinic.videoUrl" class="video-container">
          <iframe
            :src="selectedClinic.videoUrl"
            style="border: none"
            allow="clipboard-write; autoplay"
            webkitAllowFullScreen
            mozallowfullscreen
            allowFullScreen
            allowfullscreen
          ></iframe>
        </div>

        <v-card-text class="glass-text" style="padding-bottom: 0 !important">
          <div class="glass-info-item" v-if="selectedClinic.address">
            <v-icon icon="mdi-map-marker" size="small" class="glass-icon"></v-icon>
            {{ selectedClinic.address }}
          </div>

          <div class="glass-info-item" v-if="selectedClinic.website">
            <v-icon icon="mdi-web" size="small" class="glass-icon"></v-icon>
            <a :href="selectedClinic.website" target="_blank" class="glass-link">{{
              selectedClinic.website
            }}</a>
          </div>

          <div class="glass-info-item" v-if="selectedClinic.vk">
            <img src="/icons/vk-com.png" style="height: 20px; height: 20px" alt="" />
            <!-- <v-icon icon="mdi-vk-box" size="small" class="glass-icon"></v-icon> -->
            <a :href="selectedClinic.vk" target="_blank" class="glass-link">{{
              selectedClinic.vk
            }}</a>
          </div>

          <div class="glass-info-item flex-col" v-if="selectedClinic.description">
            <div class="glass-subtitle">Описание</div>
            {{ selectedClinic.description }}
          </div>

          <div class="glass-info-item" v-if="selectedClinic.percent">
            <v-icon icon="mdi-percent" size="small" class="glass-icon"></v-icon>
            {{ selectedClinic.percent }}
          </div>

          <div class="glass-info-item" v-if="selectedClinic.microscope">
            <v-icon icon="mdi-microscope" size="small" class="glass-icon"></v-icon>
            {{ selectedClinic.microscope }}
          </div>

          <div class="glass-info-item" v-if="selectedClinic.chiefName">
            <v-icon icon="mdi-doctor" size="small" class="glass-icon"></v-icon>
            Главврач: {{ selectedClinic.chiefName }}
          </div>

          <div class="accent-button-container">
            <v-btn size="x-large" class="accent-button" @click="showConditions = true">
              УЗНАТЬ УСЛОВИЯ
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConditions" max-width="400" scrim="transparent">
      <v-card class="glass-card">
        <v-card-title class="glass-title">
          <v-row align="center" justify="space-between" no-gutters>
            <v-col cols="10">Узнать условия</v-col>
            <v-col cols="2" class="text-right">
              <v-btn class="close-btn" @click="showConditions = false">
                <v-icon icon="mdi-close" size="large"></v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text class="glass-text">
          <div class="conditions-buttons">
            <v-btn
              size="x-large"
              class="conditions-vk-btn"
              target="_blank"
              href="https://vk.ru/glazyrina_ag"
              @click="showConditions = false"
            >
              <img src="/icons/vk-com.png" style="height: 24px; margin-right: 10px" alt="" />
              ВКонтакте
            </v-btn>
            <v-btn
              size="x-large"
              class="conditions-max-btn"
              target="_blank"
              href="https://max.ru/join/UUaNuWKJCuqEnHyPsTDzTgnUQJvD4E2oUAQphGXSmoQ"
              @click="showConditions = false"
            >
              <img src="/icons/max_logo.svg" style="height: 24px; margin-right: 10px" alt="" />
              Max
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style>
.header-overlay {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  text-align: center;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(21, 101, 192, 0.2));
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(33, 150, 243, 0.25);
  border-radius: 20px;
  padding: 16px 32px;
  box-shadow: 0 8px 32px rgba(33, 150, 243, 0.15);
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  margin-bottom: 4px;
}

.header-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 8px;
}

.header-stats {
  font-size: 14px;
  color: #1565c0;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

@media (max-width: 600px) {
  .header-overlay {
    width: calc(100% - 40px);
    max-width: 400px;
    padding: 12px 20px;
  }

  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }

  .header-stats {
    font-size: 11px;
  }

  .filter-btn {
    top: 110px !important;
  }

  .filters-container {
    top: 160px !important;
  }
}

.footer-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.contacts-link {
  display: inline-block;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.15), rgba(13, 71, 161, 0.15));
  border: 1px solid rgba(25, 118, 210, 0.3);
  border-radius: 16px 16px 0 0;
  color: #1565c0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 12px 40px;
  transition: all 0.3s ease;
}

.contacts-link:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.25), rgba(13, 71, 161, 0.25));
}

.contact-info-item {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.contact-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-value {
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
  word-break: break-word;
}

.contact-link {
  color: #1976d2 !important;
  text-decoration: none;
  font-size: 14px;
}

.contact-link:hover {
  color: #1565c0 !important;
  text-decoration: underline;
}

.contact-tile {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.15), rgba(13, 71, 161, 0.15));
  border: 1px solid rgba(25, 118, 210, 0.3);
  border-radius: 16px 16px 0 0;
  margin: 20px -20px -20px -20px;
  padding: 16px;
  text-align: center;
}

.contact-tile-title {
  color: #1565c0;
  font-size: 13px;
  font-weight: 500;
}

.footer-button {
  background-image: linear-gradient(104deg, #2196f3 39.5%, #1565c0 100%) !important;
  background-size: 200% 100%;
  background-position: 0% 50%;
  color: white !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  padding: 12px 40px !important;
  transition: background-position 0.3s ease !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 32px rgba(33, 150, 243, 0.4) !important;
}

.footer-button:hover {
  background-position: 100% 50%;
  box-shadow: 0 12px 40px rgba(33, 150, 243, 0.5) !important;
}

.leaflet-control-attribution {
  background: rgba(255, 255, 255, 0.8) !important;
  padding: 2px 8px !important;
  font-size: 10px !important;
}

.leaflet-control-attribution a {
  color: #666 !important;
}

.leaflet-bottom.leaflet-right {
  display: block !important;
}

.filter-btn {
  position: fixed !important;
  top: 140px !important;
  right: 20px !important;
  z-index: 1000 !important;
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  color: #333 !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s ease !important;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.95) !important;
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2) !important;
}

.filter-badge {
  position: fixed !important;
  top: 140px !important;
  right: 20px !important;
  z-index: 1000 !important;
}

.filter-badge .v-badge__badge {
  font-size: 12px !important;
  font-weight: 700 !important;
  height: 20px !important;
  min-width: 20px !important;
}

.filters-container {
  position: fixed !important;
  top: 200px !important;
  right: 20px !important;
  z-index: 1000 !important;
}

.filters-panel {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  border-radius: 16px !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8) !important;
  padding: 16px;
  min-width: 280px;
}

.filters-title {
  color: #1a1a2e;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.filters-chips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.glass-chip {
  background: rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 12px 16px;
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.glass-chip:hover {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.15);
  transform: translateX(4px);
}

.glass-chip.active {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.2), rgba(13, 71, 161, 0.2));
  border-color: rgba(25, 118, 210, 0.5);
  color: #1565c0;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.glass-card {
  background: rgba(255, 255, 255, 0.92) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  border-radius: 20px !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8) !important;
  overflow-y: auto !important;
  max-height: 90vh !important;
  display: flex !important;
  flex-direction: column !important;
}

.glass-img {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.7)
  ) !important;
}

.video-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: rgba(0, 0, 0, 0.3);
}

.video-container iframe {
  width: 100%;
  height: 100%;
}

.glass-title {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.9)
  ) !important;
  backdrop-filter: blur(10px);
  padding: 16px 20px !important;
  font-weight: 600 !important;
  color: #1a1a2e !important;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5) !important;
  word-break: break-word;
  white-space: normal;
  display: flex;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
}

.glass-title-stack {
  min-width: 0;
}

.glass-title-text {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.25;
  word-break: break-word;
  white-space: normal;
}

.glass-title-org {
  margin-top: 8px;
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  letter-spacing: 0.02em;
  line-height: 1.3;
  word-break: break-word;
}

.glass-title-cat {
  margin-top: 6px;
  font-size: 12px;
  color: #1565c0;
  font-weight: 500;
}

.glass-title-stack {
  min-width: 0;
}

.glass-title-text {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.25;
  word-break: break-word;
  white-space: normal;
}

@media (max-width: 400px) {
  .glass-title-text {
    font-size: 15px;
  }

  .glass-title-org {
    font-size: 17px;
  }
}

.close-btn {
  flex-shrink: 0;
  padding: 6px !important;
  min-width: 40px !important;
  height: 40px !important;
  background: rgba(0, 0, 0, 0.08) !important;
}

.glass-text {
  color: rgba(0, 0, 0, 0.75) !important;
  padding: 16px 20px !important;
  flex: 1 !important;
  overflow-y: auto !important;
}

.vacancy-card .glass-text {
  padding: 16px 20px 28px !important;
}

.glass-info-item {
  display: flex;
  align-items: start;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.glass-info-item:hover {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.12);
  transform: translateX(4px);
}

.glass-icon {
  color: rgba(0, 0, 0, 0.5) !important;
}

.glass-subtitle {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85) !important;
  margin-bottom: 4px;
}

.glass-link {
  color: #1976d2 !important;
  text-decoration: none;
  transition: color 0.3s ease;
}

.glass-link:hover {
  color: #1565c0 !important;
  text-decoration: underline;
}

.glass-actions {
  padding: 12px 20px 20px !important;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8), transparent) !important;
  color: #1a1a2e;
}

.glass-btn {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.04)) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  color: rgba(0, 0, 0, 0.8) !important;
  border-radius: 12px !important;
  padding: 8px 24px !important;
  transition: all 0.3s ease !important;
}

.glass-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.12),
    rgba(0, 0, 0, 0.06) rgba(0, 0, 0, 0.08)
  ) !important;
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.glass-btn {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-radius: 12px !important;
  padding: 8px 24px !important;
  transition: all 0.3s ease !important;
}

.glass-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.8),
    rgba(0, 0, 0, 0.6) rgba(255, 255, 255, 0.15)
  ) !important;
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
}

.accent-button {
  background-image: linear-gradient(104deg, #2196f3 39.5%, #1565c0 100%) !important;
  background-size: 200% 100%;
  background-position: 0% 50%;
  color: white !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  width: 100%;
  transition: background-position 0.3s ease !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.accent-button-container {
  position: sticky;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 16px 20px;
  margin: 0 -20px -20px -20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
}

.vacancy-card .accent-button-container {
  margin: 0 -20px 0 -20px;
  padding: 18px 20px 22px;
}

.accent-button:hover {
  background-position: 100% 50%;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.4);
}

.glass-card::-webkit-scrollbar {
  width: 8px;
}

.glass-card::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.glass-card::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.glass-card::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.glass-card {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
}

.conditions-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.leaflet-bottom.leaflet-right {
  display: block !important;
}

.conditions-vk-btn,
.conditions-max-btn {
  width: 100%;
  justify-content: flex-start;
  padding-left: 20px !important;
  font-weight: 600;
  text-transform: none;
}

.conditions-vk-btn {
  background: #2787f5 !important;
  color: white !important;
}

.conditions-vk-btn:hover {
  background: #1a6fcf !important;
}

.conditions-max-btn {
  background: #000 !important;
  color: white !important;
}

.conditions-max-btn:hover {
  background: #333 !important;
}

.custom-cluster-icon {
  background: transparent !important;
  border: none !important;
}

.cluster-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
  border: 3px solid white;
}

.marker-cluster-small {
  background-color: rgba(110, 204, 57, 0.6) !important;
}

.marker-cluster-small div {
  background-color: rgba(110, 204, 57, 0.8) !important;
}

.marker-cluster-medium {
  background-color: rgba(240, 194, 12, 0.6) !important;
}

.marker-cluster-medium div {
  background-color: rgba(240, 194, 12, 0.8) !important;
}

.marker-cluster-large {
  background-color: rgba(241, 128, 23, 0.6) !important;
}

.marker-cluster-large div {
  background-color: rgba(241, 128, 23, 0.8) !important;
}

.marker-cluster {
  background-clip: padding-box;
  border-radius: 50%;
}

.marker-cluster div {
  width: 30px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;
  text-align: center;
  border-radius: 50%;
  font:
    12px 'Helvetica Neue',
    Arial,
    Helvetica,
    sans-serif;
  color: white;
  font-weight: 600;
}

.marker-cluster span {
  line-height: 30px;
}
</style>
