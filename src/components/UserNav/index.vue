<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Settings, Sun, Moon, LogOut } from 'lucide-vue-next'
// import GitHubLogo from '@/icons/Github'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { userStore } from '@/store'
import { confirm } from '@/components/ConfirmDialog'
import { storeToRefs } from 'pinia'
import { cn } from '@/lib/utils'

defineOptions({
  name: 'UserNav',
})

const userStoreRef = userStore()
const router = useRouter()
const { userInfo } = storeToRefs(userStoreRef)
const Icons = computed(() => {
  return !isDark.value ? Sun : Moon
})
const actions = {
  logout() {
    confirm({
      title: '确认退出登录？',
      description: '退出登录不会丢失任何数据，你仍可以登录此账号。',
    })
  },
  develop() {
    router.push('/develop')
  },
  settings() {
    alert('settings')
  },
}
const avatarUrl = 'https://github.com/shadcn.png'
type ActionsType = typeof actions
const selectHandle = (action: keyof ActionsType) => {
  actions[action]()
}
</script>

<template>
  <DropdownMenu v-if="userInfo.userName">
    <DropdownMenuTrigger as-child class="cursor-pointer">
      <Avatar class="h-7 w-7">
        <AvatarImage class="rounded-full object-cover" :src="avatarUrl" alt="@avatar" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent :class="cn('w-56')" align="start" :align-offset="12">
      <DropdownMenuLabel class="font-normal flex">
        <div class="flex flex-col space-y-1">
          <p class="text-sm font-medium leading-none">{{ userInfo.userName || '无名' }}</p>
          <p class="text-xs leading-none text-muted-foreground">{{ userInfo.department || '未知部门' }}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem @select="selectHandle('settings')">
          <Settings class="mr-2 h-4 w-4" />
          设置
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />

      <DropdownMenuItem @select="toggleDark()">
        <component :is="Icons" class="mr-2 w-5 h-5"></component>
        主题
        <DropdownMenuShortcut>Ctrl + K</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem @select="selectHandle('logout')">
        <LogOut class="ml-1 mr-2 h-4 w-4" />
        登出
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <Button v-else size="sm" class="rounded-xl px-4">登录</Button>
</template>
