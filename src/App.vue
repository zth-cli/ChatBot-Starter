<script setup lang="ts">
import SidebarProvider from '@/components/Sidebar/SidebarProvider.vue'
import { useChatStore } from '@/store'

const chatStore = useChatStore()
chatStore.init()

useHead({
  title: '博闻智星',
  meta: [
    {
      name: 'description',
      content: 'Opinionated Vite Starter Template',
    },
    {
      name: 'theme-color',
      content: () => (isDark.value ? '#00aba9' : '#ffffff'),
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: () => (preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg'),
    },
  ],
})
</script>

<template>
  <SidebarProvider>
    <RouterView />
  </SidebarProvider>
</template>
