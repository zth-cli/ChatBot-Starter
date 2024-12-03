<script setup lang="ts">
defineOptions({ name: 'ChatHeader' })
</script>

<template>
  <header class="flex justify-between sticky top-0 bg-background py-1.5 items-center px-2 md:px-5 gap-2">
    <SidebarToggle />
    <UserNav />
  </header>
</template>
