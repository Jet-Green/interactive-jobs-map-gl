<script setup lang="ts">
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
      <Footer />
    </v-app>
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
</style>
