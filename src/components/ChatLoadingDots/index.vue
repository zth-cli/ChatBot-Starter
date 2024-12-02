<template>
  <div class="flex items-center gap-2">
    <div
      v-for="i in 3"
      :key="i"
      class="w-2 h-2 rounded-full bg-black/50 dark:bg-foreground animate-fade"
      :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
    ></div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'LoadingDots',
})
</script>
<style>
@keyframes fade {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
}

.animate-fade {
  animation: fade 1s infinite;
}
</style>
