<script setup lang="ts">
import { SunIcon, MoonIcon } from 'lucide-vue-next'
defineOptions({ name: 'Index' })

const icon = computed(() => (isDark.value ? MoonIcon : SunIcon))
</script>

<template>
  <ChatHeader />
  <div class="flex items-center">
    <Button @click="$router.push('/about')">Go to about</Button>
    <component :is="icon" class="size-6" @click="toggleDark()" />
  </div>
</template>
