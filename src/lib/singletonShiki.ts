// import Shiki from '@shikijs/markdown-it'
import { getHighlighter, Highlighter } from 'shiki'

let highlighter: Highlighter | null = null

export async function initHighlighter() {
  if (highlighter) {
    return highlighter
  }

  highlighter = await getHighlighter({
    themes: ['github-dark', 'github-light'],
    langs: [
      'javascript',
      'typescript',
      'vue',
      'svelte',
      'astro',
      'jsx',
      'tsx',
      'html',
      'css',
      'json',
      'markdown',
      'python',
      'java',
      'toml',
      'xml',
      'json5',
      'mdx',
      'jsonc',
      'c',
      'cpp',
      'go',
      'rust',
      'shell',
      'bash',
      'sql',
      'yaml',
      'text',
    ],
  })

  return highlighter
}
