import { ref, onBeforeUnmount } from 'vue'
import { createApp, h } from 'vue'
import { CodeBlock } from '@/components/ChatCodeBlock'

export function useCodeBlockMount(containerRef: Ref<HTMLElement | null>, className = '.vue-code-block') {
  // 存储所有创建的 Vue 实例，以便清理
  const mountedApps = ref<Array<{ app: any; el: HTMLElement }>>([])

  const mountCodeBlocks = () => {
    if (!containerRef.value) return

    // 清理之前的实例
    cleanupMountedApps()

    const codeBlocks = containerRef.value.querySelectorAll(className)
    codeBlocks.forEach((block) => {
      const code = decodeURIComponent(block.getAttribute('data-code') || '')
      const lang = block.getAttribute('data-lang') || ''

      const app = createApp({
        render() {
          return h(CodeBlock, {
            code,
            language: lang,
          })
        },
      })

      const mountEl = document.createElement('div')
      // 用新创建的挂载元素替换原始的代码块元素
      block.replaceWith(mountEl)
      app.mount(mountEl)

      // 保存实例和挂载元素的引用
      mountedApps.value.push({
        app,
        el: mountEl,
      })
    })
  }

  // 清理已挂载的 Vue 实例
  const cleanupMountedApps = () => {
    mountedApps.value.forEach(({ app, el }) => {
      app.unmount()
      el.remove()
    })
    mountedApps.value = []
  }

  // 组件卸载前清理
  onBeforeUnmount(() => {
    cleanupMountedApps()
  })

  return {
    mountCodeBlocks,
    cleanupMountedApps,
  }
}
