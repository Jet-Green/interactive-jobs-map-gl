<template>
  <div id="map" style="height: 500px"></div>

  <v-dialog v-model="dialog" max-width="500">
    <v-card v-if="selectedClinic">
      <v-img
        v-if="selectedClinic.videoUrl"
        :src="selectedClinic.videoUrl"
        height="200"
        cover
        class="bg-grey-lighten-2"
      ></v-img>

      <v-card-title class="text-h5 pb-0">
        {{ selectedClinic.name }}
      </v-card-title>

      <v-card-text>
        <div class="mb-2" v-if="selectedClinic.address">
          <v-icon icon="mdi-map-marker" size="small" class="mr-1"></v-icon>
          {{ selectedClinic.address }}
        </div>

        <div class="mb-2" v-if="selectedClinic.website">
          <v-icon icon="mdi-web" size="small" class="mr-1"></v-icon>
          <a :href="selectedClinic.website" target="_blank">{{ selectedClinic.website }}</a>
        </div>

        <div class="mb-2" v-if="selectedClinic.vk">
          <v-icon icon="mdi-vk" size="small" class="mr-1"></v-icon>
          <a :href="selectedClinic.vk" target="_blank">{{ selectedClinic.vk }}</a>
        </div>

        <div class="mb-2" v-if="selectedClinic.description">
          <div class="text-subtitle-2 mt-2">Описание</div>
          {{ selectedClinic.description }}
        </div>

        <div class="mb-2" v-if="selectedClinic.percent">
          <v-icon icon="mdi-percent" size="small" class="mr-1"></v-icon>
          Условия: {{ selectedClinic.percent }}%
        </div>

        <div class="mb-2" v-if="selectedClinic.microscope">
          <v-icon icon="mdi-microscope" size="small" class="mr-1"></v-icon>
          Микроскоп: {{ selectedClinic.microscope }}
        </div>

        <div class="mb-2" v-if="selectedClinic.chiefName">
          <v-icon icon="mdi-doctor" size="small" class="mr-1"></v-icon>
          Главврач: {{ selectedClinic.chiefName }}
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="dialog = false">Закрыть</v-btn>
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
  const map = L.map('map').setView([52.3676, 4.9041], 13)

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
</style>
