<template>
  <div class="group flex w-full h-screen" :data-collapsible="isCollapsed ? 'offcanvas' : ''">
    <div class="hidden md:block group">
      <div
        class="translate-[width] duration-200 ease-linear h-full w-0 md:w-[--sidebar-width] group-data-[collapsible=offcanvas]:w-0 relative bg-primary/5"
      >
        <Sidebar />
      </div>
    </div>
    <main class="flex-1 h-full">
      <RouterView />
    </main>
    <SidebarSheet v-if="md" />
  </div>
</template>

<script setup lang="ts">
import { Sidebar, SidebarSheet, type SidebarProviderContext } from '@/components/Sidebar'
import { useResponsive } from '@/composables/useResponsive'
const { isCollapsed } = inject<SidebarProviderContext>('sidebar')!
const { md } = useResponsive()
</script>
