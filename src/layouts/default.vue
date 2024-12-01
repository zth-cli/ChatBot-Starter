<template>
  <div class="group flex w-full h-screen" :data-collapsible="isCollapsed ? 'offcanvas' : ''">
    <div class="hidden md:block group">
      <div
        class="translate-[width] duration-200 ease-linear h-full w-0 md:w-[--sidebar-width] group-data-[collapsible=offcanvas]:w-0 relative bg-gray-50"
      >
        <Sidebar />
      </div>
    </div>
    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar/index.vue'
import type { SidebarProviderContext } from '@/components/Sidebar/SidebarProvider.vue'
const { isCollapsed } = inject<SidebarProviderContext>('sidebar')!
</script>
