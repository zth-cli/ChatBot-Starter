<script setup lang="ts">
import { SunIcon, MoonIcon } from 'lucide-vue-next'
defineOptions({ name: 'Index' })

const icon = computed(() => (isDark.value ? MoonIcon : SunIcon))
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <Button @click="$router.push('/about')">Go to about</Button>
    <component :is="icon" class="size-6" @click="toggleDark()" />
  </div>
</template>
