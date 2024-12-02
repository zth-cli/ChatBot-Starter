<template>
  <Button variant="ghost" size="sm" class="ml-auto" @click="newChat">
    <PlusIcon class="h-4 w-4" />
  </Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-vue-next'
import { useChatStore } from '@/store'

const router = useRouter()
const chatStore = useChatStore()
const newChat = () => {
  chatStore.resetChat()
  router.push(`/`)
}
</script>
