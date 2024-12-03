<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <slot>
        <Ellipsis :size="16" />
      </slot>
    </PopoverTrigger>
    <PopoverContent class="w-[140px] p-0" align="end">
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="framework in options"
              :key="framework.value"
              :class="{ 'hover:!bg-red-200 !text-destructive': framework.variant === 'destructive' }"
              :disabled="framework.disabled"
              :value="framework.value"
              @select="handleSelect(framework, $event)"
            >
              {{ framework.label }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>

  <AlertDialog v-model:open="deleteDialogOpen">
    <AlertDialogTrigger as-child />
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>确定删除吗？</AlertDialogTitle>
        <AlertDialogDescription>此操作将删除当前对话, 请谨慎操作</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction @click="handleDelete">删除</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Ellipsis } from 'lucide-vue-next'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

defineProps({
  options: {
    type: Array as PropType<{ value: string; label: string; disabled?: boolean; variant?: string }[]>,
    default: () => [
      {
        value: 'top',
        label: '置顶',
        disabled: true,
      },
      {
        value: 'edit',
        label: '编辑',
        disabled: true,
      },
      {
        value: 'delete',
        label: '删除',
        variant: 'destructive',
      },
    ],
  },
})

const emit = defineEmits(['select'])

const open = ref(false)
const deleteDialogOpen = ref(false)

const handleSelect = (framework: any, event: any) => {
  const data = event.detail.value
  open.value = false
  if (framework.variant === 'destructive') {
    deleteDialogOpen.value = true
  } else {
    emit('select', data)
  }
}

const handleDelete = () => {
  deleteDialogOpen.value = false
  emit('select', 'delete')
}
</script>
