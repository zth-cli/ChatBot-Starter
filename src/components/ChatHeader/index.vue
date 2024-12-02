<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next'
defineOptions({ name: 'ChatHeader' })
</script>

<template>
  <header class="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
    <SidebarToggle />
  </header>
</template>

<style lang="scss" scoped></style>
