import { ChatPluginManifest } from '@rzx/chat-plugin-sdk'
import { defineStore } from 'pinia'

export const useToolStore = defineStore('tool', () => {
  const manifests = ref<ChatPluginManifest[]>([])

  // 初始化时获取插件列表
  onMounted(() => {
    // fetchPlugins()
  })
  // 根据identifier获取插件
  const getToolByIdentifier = (identifier: string) => {
    return manifests.value.find((tool) => tool.identifier === identifier)
  }
  return { manifests, getToolByIdentifier }
})
