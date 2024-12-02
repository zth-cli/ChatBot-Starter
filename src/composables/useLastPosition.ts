import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

interface Position {
  x: number
  y: number
}

export function useLastTextPosition(containerRef: Ref<HTMLElement | null>) {
  const position = ref<Position | null>(null)
  let observer: MutationObserver | null = null

  // 递归查找最后一个文本节点
  const findLastTextNode = (node: Node): Text | null => {
    // 如果是文本节点且有内容，直接返回
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim().length) {
      return node as Text
    }

    // 获取所有子节点
    const children = Array.from(node.childNodes)

    // 从后向前遍历
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i]
      const textNode = findLastTextNode(child)
      if (textNode) {
        return textNode
      }
    }

    return null
  }

  const updatePosition = () => {
    try {
      const div = containerRef.value
      if (!div) return

      const divRect = div.getBoundingClientRect()
      const range = document.createRange()

      // 查找最后一个文本节点
      const lastTextNode = findLastTextNode(div)
      if (!lastTextNode) {
        position.value = null
        return
      }

      // 确保文本节点有内容
      if (lastTextNode.length > 0) {
        // 获取最后一个字符的位置
        range.setStart(lastTextNode, lastTextNode.length - 1)
        range.setEnd(lastTextNode, lastTextNode.length)

        // 获取范围的位置矩形集合
        const rects = range.getClientRects()

        // 确保有位置信息
        if (rects.length > 0) {
          const lastRect = rects[rects.length - 1]
          // 相对于div的坐标
          position.value = {
            x: lastRect.right - divRect.left + div.scrollLeft,
            y: lastRect.top - divRect.top + div.scrollTop,
          }
        } else {
          position.value = null
        }
      } else {
        position.value = null
      }
    } catch (error) {
      console.error('Error updating position:', error)
      position.value = null
    }
  }

  onMounted(() => {
    try {
      updatePosition()

      observer = new MutationObserver(() => {
        requestAnimationFrame(updatePosition)
      })

      if (containerRef.value) {
        observer.observe(containerRef.value, {
          childList: true,
          characterData: true,
          subtree: true,
        })
      }
    } catch (error) {
      console.error('Error in mounted hook:', error)
    }
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return {
    position,
    updatePosition,
  }
}
