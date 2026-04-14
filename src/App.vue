<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@vueuse/head'

const showDialog = ref(true)

useHead({
  title: 'Медицинский скаут - вакансии для врачей и медперсонала',
  meta: [
    {
      name: 'description',
      content:
        'Поиск вакансий для врачей стоматологов, среднего и младшего медицинского персонала. 70+ организаций нашли своих специалистов.',
    },
    {
      name: 'keywords',
      content: 'вакансии, врачи, стоматолог, медицинский персонал, работа, найти работу',
    },
    { property: 'og:title', content: 'Медицинский скаут - вакансии для врачей и медперсонала' },
    {
      property: 'og:description',
      content: 'Поиск вакансий для врачей стоматологов, среднего и младшего медицинского персонала',
    },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: 'https://dental-job.ru' }],
})
</script>

<template>
  <v-responsive>
    <v-app>
      <v-main>
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </v-main>
    </v-app>

    <v-dialog v-model="showDialog" max-width="500" scrim="transparent">
      <v-card class="glass-card">
        <v-card-title class="glass-title">
          <v-row align="center" justify="space-between" no-gutters>
            <v-col cols="10">Отчет за март</v-col>
          </v-row>
        </v-card-title>
        <v-card-text class="glass-text">
          <div class="vacancies-subtitle">ВАКАНСИИ ЗАКРЫТЫ:</div>
          <ol class="vacancies-list">
            <li class="vacancies-item">Стоматолог терапевт - стоматология Лана (Пермь)</li>
            <li class="vacancies-item">Стоматолог ортопед - Новая стоматология (ст.Динская)</li>
            <li class="vacancies-item">Стоматолог ортодонт - Клиника ProWhite</li>
            <li class="vacancies-item">Стоматолог терапевт - стоматология Чибис (Пермь)</li>
            <li class="vacancies-item">Администратор и ассистент - Аника Дент (г. Москва)</li>
          </ol>
        </v-card-text>
        <div class="accent-button-container report-dialog-footer" style="padding-bottom: 0">
          <v-btn size="x-large" class="accent-button" @click="showDialog = false"> Хорошо </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-responsive>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.vacancies-subtitle {
  font-weight: 600;
  color: #1565c0;
  font-size: 16px;
  margin-bottom: 16px;
}

.vacancies-list {
  padding-left: 20px;
  margin: 0;
}

.vacancies-item {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.75);
  font-size: 14px;
  line-height: 1.4;
}

.report-dialog-footer {
  margin: 0 -20px -20px -20px;
  padding: 18px 20px 22px;
}
</style>
