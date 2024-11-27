// 使用mitt库来替代vue3的eventBus
import { PluginType } from '@rzx/chat-plugin-sdk'
import mitt from 'mitt'

export type PluginTypePlus = PluginType | 'files-preview'

export type MittEvents = {
  openRightPanel: {
    identifier: PluginTypePlus
    label: string
    payload: any
  }
  openEditor: {
    identifier: 'task-editor'
  }
}

export const emitter = mitt<MittEvents>()
