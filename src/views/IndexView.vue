<template>
  <div id="map" style="height: 100vh"></div>

  <v-dialog v-model="dialog" max-width="500" scrim="transparent">
    <v-card v-if="selectedClinic" class="glass-card">
      <v-img v-if="selectedClinic.videoUrl" :src="selectedClinic.videoUrl" height="200" cover class="glass-img"></v-img>

      <v-card-title class="text-h5 glass-title">
        {{ selectedClinic.name }}
      </v-card-title>

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
          Условия: {{ selectedClinic.percent }}%
        </div>

        <div class="glass-info-item" v-if="selectedClinic.microscope">
          <v-icon icon="mdi-microscope" size="small" class="glass-icon"></v-icon>
          {{ selectedClinic.microscope }}
        </div>

        <div class="glass-info-item" v-if="selectedClinic.chiefName">
          <v-icon icon="mdi-doctor" size="small" class="glass-icon"></v-icon>
          Главврач: {{ selectedClinic.chiefName }}
        </div>
      </v-card-text>

      <v-card-actions class="glass-actions">
        <v-spacer></v-spacer>
        <v-btn variant="glass-btn" @click="dialog = false">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

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
    name: 'Ролик по клинике рабочего места',
    address: 'ул. Примерная, д. 10, Москва',
    website: 'https://example-clinic.ru',
    vk: 'https://vk.com/example',
    description: 'Современная стоматологическая клиника с новейшим оборудованием',
    percent: 50,
    microscope: 'бинокуляр',
    chiefName: 'Иванов Иван Иванович',
    lat: 52.3676,
    lng: 4.9041,
    videoUrl: '',
  },
  {
    id: 2,
    name: 'Ролик по клинике рабочего места 2',
    address: 'ул. Ленина, д. 5, Санкт-Петербург',
    website: 'https://example-clinic2.ru',
    vk: 'https://vk.com/example2',
    description: 'Клиника с 20-летним опытом работы',
    percent: 45,
    microscope: 'микроскоп',
    chiefName: 'Петров Петр Петрович',
    lat: 59.9343,
    lng: 30.3351,
    videoUrl: '',
  },
]

onMounted(() => {
  const map = L.map('map', {
    zoomControl: false,
  }).setView([52.3676, 4.9041], 13)

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

.glass-title {
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.15),
      rgba(255, 255, 255, 0.05)) !important;
  padding: 20px 20px 10px !important;
  font-weight: 600 !important;
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
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
</style>
