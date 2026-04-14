<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@vueuse/head'

const openVk = () => {
  window.open('https://vk.ru/glazyrina_ag', '_blank')
}

const showDialog = ref(true)
const showDetails = ref(false)

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

    <v-dialog v-model="showDialog" max-width="500" scrim="rgba(0,0,0,0.5)">
      <v-card class="glass-card">
        <v-card-text class="glass-text">
          <div class="vacancies-header">
            <div class="vacancies-stats">
              <div class="vacancies-label">За последний месяц было закрыто</div>
              <div class="vacancies-stat-item" @click="showDetails = true" style="cursor: pointer">
                <span class="vacancies-stat-number" style="cursor: pointer">5</span>
                <span class="vacancies-stat-label" style="position: relative">
                  вакансий
                  <v-icon
                    size="x-small"
                    style="
                      font-size: 18px;
                      position: absolute;
                      top: 0;
                      right: -20px;
                      transform: translateY(-25%);
                      cursor: pointer;
                    "
                    >mdi-open-in-new</v-icon
                  >
                </span>
              </div>
              <div class="vacancies-stat-item">
                <span class="vacancies-stat-number">4</span>
                <span class="vacancies-stat-label">города</span>
              </div>
            </div>
          </div>
          <div class="ad-placeholder" @click="openVk()" style="cursor: pointer">
            Здесь могла быть ваша реклама
          </div>
        </v-card-text>
        <div class="accent-button-container report-dialog-footer" style="padding-bottom: 0">
          <v-btn size="x-large" class="accent-button" @click="showDialog = false"> Хорошо </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDetails" max-width="500" scrim="rgba(0,0,0,0.5)">
      <v-card class="glass-card">
        <v-card-title class="glass-title">
          <v-row align="center" justify="space-between" no-gutters>
            <v-col cols="10">Закрытые вакансии</v-col>
          </v-row>
        </v-card-title>
        <v-card-text class="glass-text">
          <ol class="vacancies-list">
            <li class="vacancies-item">Стоматолог терапевт - стоматология Лана (Пермь)</li>
            <li class="vacancies-item">Стоматолог ортопед - Новая стоматология (ст.Динская)</li>
            <li class="vacancies-item">Стоматолог ортодонт - Клиника ProWhite</li>
            <li class="vacancies-item">Стоматолог терапевт - стоматология Чибис (Пермь)</li>
            <li class="vacancies-item">Администратор и ассистент - Аника Дент (г. Москва)</li>
          </ol>
        </v-card-text>
        <div class="accent-button-container report-dialog-footer" style="padding-bottom: 0">
          <v-btn size="x-large" class="accent-button" @click="showDetails = false"> Закрыть </v-btn>
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

.vacancies-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.vacancies-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  text-align: left;
}

.vacancies-label {
  font-size: clamp(16px, 4vw, 22px);
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 12px;
  font-weight: 500;
}

.vacancies-stat-item {
  display: flex;
  align-items: baseline;
  justify-content: start;
  gap: 10px;
}

.vacancies-stat-number {
  font-size: clamp(28px, 8vw, 42px);
  font-weight: 700;
  color: #1565c0;
  line-height: 1;
}

.vacancies-stat-label {
  font-size: clamp(16px, 4vw, 22px);
  color: rgba(0, 0, 0, 0.75);
  font-weight: 500;
}

.ad-placeholder {
  background: rgba(0, 0, 0, 0.04);
  border: 1px dashed rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
  font-size: clamp(14px, 3vw, 18px);
  font-weight: 500;
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
