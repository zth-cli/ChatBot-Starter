<script setup lang="ts">
import { PanelLeft } from 'lucide-vue-next'
import type { SidebarProviderContext } from '@/components/Sidebar/SidebarProvider.vue'

defineOptions({ name: 'SidebarToggle' })
const { toggleSidebar } = inject<SidebarProviderContext>('sidebar')!
</script>

<template>
  <Button variant="outline" size="icon" class="md:px-2 size-9" @click="toggleSidebar">
    <PanelLeft class="size-5" />
  </Button>
</template>
