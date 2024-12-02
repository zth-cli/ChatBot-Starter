import { shallowRef } from 'vue'
import katex from 'katex'
import MarkdownIt from 'markdown-it'
import markdownItTexMath from 'markdown-it-texmath'
import markdownitExternalLink from 'markdown-it-external-link'

// 创建一个单例 MarkdownIt 实例
const createMarkdownInstance = () => {
  const md = new MarkdownIt({ html: true, breaks: true, linkify: true })

  md.use(markdownitExternalLink, {
    target: '_blank',
  })

  md.use(markdownItTexMath, {
    engine: katex,
    delimiters: 'brackets',
    katexOptions: {
      throwOnError: false,
      displayMode: false,
    },
  })

  // 优化 fence 渲染规则
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx]
    return `<div class="vue-code-block" data-code="${encodeURIComponent(token.content)}" data-lang="${token.info.trim()}"></div>`
  }

  return md
}

// 缓存 MarkdownIt 实例
const mdInstance = createMarkdownInstance()

export function useMarkdownRenderer() {
  // 使用 shallowRef 因为我们不需要深层响应性
  const md = shallowRef(mdInstance)

  return { md }
}
