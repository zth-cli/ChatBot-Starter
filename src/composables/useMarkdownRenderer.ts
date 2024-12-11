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

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const code = token.content.trim()
    const language = token.info.trim()

    return `<CodeBlock-${language}-${encodeURIComponent(code)}>`
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
