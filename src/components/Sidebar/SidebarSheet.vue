<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import type { SidebarProviderContext } from '@/components/Sidebar/SidebarProvider.vue'

const { isCollapsed } = inject<SidebarProviderContext>('sidebar')!
const isOpen = computed({
  get() {
    return !isCollapsed.value
  },
  set(value) {
    isCollapsed.value = !value
  },
})
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent side="left" class="p-0 w-[--sidebar-width]">
      <Sidebar />
    </SheetContent>
  </Sheet>
</template>
