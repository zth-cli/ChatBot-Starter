<script setup lang="ts">
defineOptions({ name: 'SidebarProvider' })

export interface SidebarProviderContext {
  isCollapsed: Ref<boolean>
  toggleSidebar: () => void
}

const isCollapsed = ref(false)
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
provide<SidebarProviderContext>('sidebar', { isCollapsed, toggleSidebar })
</script>

<template>
  <slot />
</template>

<style lang="scss" scoped></style>
