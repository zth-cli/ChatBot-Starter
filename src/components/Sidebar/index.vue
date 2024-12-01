<template>
  <aside
    :class="
      cn(
        // 基础样式
        'fixed inset-y-0 z-10 h-full',
        'transition-[left,right,width] ease-linear duration-200',
        // 响应式显示
        'hidden md:flex',
        // 宽度控制
        'w-[--sidebar-width] left-0',
        'group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]',
      )
    "
  >
    <div class="flex h-full w-full flex-col">
      <!-- 顶部标题栏 -->
      <div class="flex h-14 items-center border-b px-4">
        <h2 class="flex items-center gap-2 font-semibold">
          <Bot class="h-5 w-5" />
          <span v-show="!isCollapsed">Chatbot</span>
        </h2>
        <Button variant="ghost" size="icon" class="ml-auto" @click="toggleSidebar">
          <PlusIcon class="h-4 w-4" />
        </Button>
      </div>

      <!-- 聊天历史列表 -->
      <div class="flex-1 overflow-auto py-2">
        <div class="space-y-2 px-2">
          <!-- 今天 -->
          <div class="px-2 py-1.5">
            <span class="text-xs text-muted-foreground">Today</span>
          </div>
          <Button variant="ghost" class="w-full justify-start">
            <MessageSquareIcon class="mr-2 h-4 w-4" />
            <span class="truncate">Current Weather in San Francis...</span>
          </Button>

          <!-- 最近7天 -->
          <div class="px-2 py-1.5">
            <span class="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          <Button variant="ghost" class="w-full justify-start">
            <MessageSquareIcon class="mr-2 h-4 w-4" />
            <span class="truncate">Drafting an Essay on Silicon Val...</span>
          </Button>
        </div>
      </div>

      <!-- 底部用户信息 -->
      <div class="border-t p-4">
        <div class="flex items-center gap-2">
          <Avatar class="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span v-show="!isCollapsed" class="text-sm">770304867@qq.com</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Bot, MessageSquareIcon, PlusIcon } from 'lucide-vue-next'
import type { SidebarProviderContext } from '@/components/Sidebar/SidebarProvider.vue'
const { isCollapsed, toggleSidebar } = inject<SidebarProviderContext>('sidebar')!
</script>
