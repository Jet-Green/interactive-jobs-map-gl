<script setup>
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-providers'

const dialog = ref(false)
const selectedClinic = ref(null)

const clinics = [
  {
    id: 1,
    jobName: 'Стоматолог-терапевт',
    address: 'ул. Примерная, д. 10, Москва',
    website: 'https://example-clinic.ru',
    vk: 'https://vk.com/example',
    description: 'Современная стоматологическая клиника с новейшим оборудованием',
    percent: 'от 40% + индивидуальные условия',
    microscope: 'бинокуляр',
    chiefName: 'Иванов Иван Иванович',
    lat: 52.3676,
    lng: 4.9041,
    videoUrl: 'https://rutube.ru/play/embed/cb7b3c0aad5c8a1e5cf5d22f59cc65b3/',
  },
  {
    id: 2,
    jobName: 'Стоматолог-хирург',
    address: 'ул. Ленина, д. 5, Санкт-Петербург',
    website: 'https://example-clinic2.ru',
    vk: 'https://vk.com/example2',
    description: 'Клиника с 20-летним опытом работы',
    percent: '45% от чека',
    microscope: 'микроскоп',
    chiefName: 'Петров Петр Петрович',
    lat: 59.9343,
    lng: 30.3351,
    videoUrl: 'https://rutube.ru/play/embed/cb7b3c0aad5c8a1e5cf5d22f59cc65b3/',
  },
]

onMounted(() => {
  const map = L.map('map', {
    zoomControl: false,
  }).setView([58.010259, 56.234195], 5)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.tileLayer.provider('CartoDB.DarkMatter').addTo(map)

  clinics.forEach((clinic) => {
    L.marker([clinic.lat, clinic.lng])
      .addTo(map)
      .on('click', () => {
        selectedClinic.value = clinic
        dialog.value = true
      })
  })
})
</script>

<template>
  <div>
    <div id="map" style="height: 100vh"></div>

    <v-dialog v-model="dialog" max-width="500" scrim="transparent">
      <v-card v-if="selectedClinic" class="glass-card">
        <v-card-title class="text-h5 glass-title">
          <div class="d-flex justify-space-between">
            <span class="glass-title-text">{{ selectedClinic.jobName }}</span>
            <v-btn variant="glass-btn" class="close-btn" @click="dialog = false">
              <v-icon icon="mdi-close" size="large"></v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <div v-if="selectedClinic.videoUrl" class="video-container">
          <iframe :src="selectedClinic.videoUrl" style="border: none" allow="clipboard-write; autoplay"
            webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
        </div>

        <v-card-text class="glass-text">
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
            <v-icon icon="mdi-vk-box" size="small" class="glass-icon"></v-icon>
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
            <v-btn size="x-large" class="accent-button" target="_blank" :href="'https://vk.ru/medical_scout'">
              УЗНАТЬ УСЛОВИЯ
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style>
.leaflet-control-attribution {
  display: none;
}

.glass-card {
  background: rgba(255, 255, 255, 0.12) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  border-radius: 20px !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
  overflow: hidden;
}

.glass-img {
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05)) !important;
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
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.1)) !important;
  backdrop-filter: blur(10px);
  padding: 16px 20px !important;
  font-weight: 600 !important;
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
  word-break: break-word;
  white-space: normal;
  display: flex;
  justify-self: space-between !important;
  /* align-items: flex-start; */
  /* gap: 12px; */
  position: sticky;
  top: 0;
  z-index: 1;
}

.glass-title-text {
  flex: 1;
}

.close-btn {
  flex-shrink: 0;
  padding: 6px !important;
  min-width: 40px !important;
  height: 40px !important;
}

.glass-text {
  color: rgba(255, 255, 255, 0.85) !important;
  padding: 16px 20px !important;
}

.glass-info-item {
  display: flex;
  align-items: start;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.glass-info-item:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.glass-icon {
  color: rgba(255, 255, 255, 0.7) !important;
}

.glass-subtitle {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9) !important;
  margin-bottom: 4px;
}

.glass-link {
  color: #64b5f6 !important;
  text-decoration: none;
  transition: color 0.3s ease;
}

.glass-link:hover {
  color: #90caf9 !important;
  text-decoration: underline;
}

.glass-actions {
  padding: 12px 20px 20px !important;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent) !important;
  color: white;
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
  background: linear-gradient(135deg,
      rgba(0, 0, 0, 0.8),
      rgba(0, 0, 0, 0.6) rgba(255, 255, 255, 0.15)) !important;
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
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  padding: 16px 20px;
  margin: 0 -20px -20px -20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
}

.accent-button:hover {
  background-position: 100% 50%;
  box-shadow: 0 4px 20px rgba(33, 150, 243, 0.4);
}

.glass-card::-webkit-scrollbar {
  width: 8px;
}

.glass-card::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.glass-card::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-card::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.glass-card {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}
</style>
