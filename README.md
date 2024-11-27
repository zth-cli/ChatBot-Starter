# AI 对话应用启动模板

## ✨ 特性

### 🤖 AI 对话能力
- **🎯 开箱即用**：预置 OpenAI 和 Ollama 风格的对话界面
- **🧩 无头组件**：提供可复用的无头对话组件，轻松构建自定义界面
- **🔄 流式响应**：支持 AI 回复的流式输出
- **💾 历史记录**：内置对话历史管理
- **🎨 主题切换**：支持多种对话界面主题

### 🛠️ 技术栈
- **⚡️ 极致性能**：基于 Vue 3、Vite、pnpm、esbuild 构建，开发体验快如闪电
- **🗂 文件路由**：基于文件系统的路由，自动生成路由配置
- **📦 组件自动导入**：自动按需导入组件，无需手动注册
- **🎨 UI 组件库**：集成 shadcn-vue，可重用、可定制的高质量组件
- **🍍 状态管理**：集成 Pinia，简单高效的状态管理方案
- **📑 布局系统**：灵活的布局系统，轻松处理复杂页面结构
- **📲 PWA 支持**：支持渐进式 Web 应用，提供离线访问能力
- **🔥 组合式 API**：使用 `<script setup>` 语法，更简洁的组件编写方式
- **📥 API 自动导入**：自动导入 Composition API，告别繁琐的 import
- **🦾 TypeScript**：全面的 TypeScript 支持，提供完整的类型提示

## 🤖 AI 对话功能

### OpenAI 风格对话

预置了类似 ChatGPT 的对话界面：
- 流式输出响应
- Markdown 格式支持
- 代码高亮显示
- 消息操作（复制、重新生成等）
- 对话历史管理

```html
<template>
  <OpenAIChat
    :api-key="OPENAI_API_KEY"
    :model="gpt-3.5-turbo"
  />
</template>
```

### Ollama 风格对话

支持本地部署的 Ollama 模型：
- 支持多种开源模型
- 本地部署，数据安全
- 可自定义模型参数

```html
<template>
  <OllamaChat
    :api-base="http://localhost:11434"
    :model="llama2"
  />
</template>
```

### 无头对话组件

提供核心对话逻辑的无头组件，方便构建自定义界面：

```vue
<script setup>
import { useAIChat } from '@/composables/useAIChat'

const { messages, sendMessage, isLoading } = useAIChat({
  apiType: 'openai', // 或 'ollama'
  // ... 其他配置
})
</script>
```


## 🚀 快速开始

### 环境要求

- Node.js >= 16
- pnpm 包管理器

### 安装依赖

```bash
# 安装 pnpm
npm install pnpm -g

# 安装项目依赖
pnpm install
```

### 开发调试

```bash
# 启动开发服务器
pnpm dev
```

### 项目构建

```bash
# 构建生产版本
pnpm build
```

## 📝 开发建议

- 推荐使用 VSCode 编辑器
- 安装推荐的 VSCode 插件以获得最佳开发体验
- 遵循项目的代码规范和 Git 提交规范

## 💅 UI 组件使用

本项目集成了 [shadcn-vue](https://www.shadcn-vue.com/docs/installation.html) 组件库，提供了一系列可定制的高质量组件：

- 无需额外安装，组件已按需自动导入
- 支持暗黑模式
- 完全可定制的组件样式
- 基于 Radix Vue 构建，确保可访问性

使用示例：

```html
<template>
  <Button variant="default">点击我</Button>
  <Dialog>
    <DialogTrigger>打开对话框</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>对话框标题</DialogTitle>
      </DialogHeader>
    </DialogContent>
  </Dialog>
</template>
```
