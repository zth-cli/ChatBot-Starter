import { createApp, h } from 'vue'
import { ConfirmDialog } from './Dialog'

export interface ConfirmOptions {
  title?: string
  description?: string
  cancelText?: string
  confirmText?: string
}

export function confirm(options: ConfirmOptions = {}) {
  return new Promise<boolean>((resolve) => {
    const container = document.createElement('div')

    const app = createApp({
      setup() {
        const open = ref(true)

        const destroy = () => {
          app.unmount()
          container.remove()
        }

        const onConfirm = () => {
          destroy()
          resolve(true)
        }

        const onCancel = () => {
          destroy()
          resolve(false)
        }

        return () =>
          h(ConfirmDialog, {
            open: open.value,
            title: options.title,
            description: options.description,
            cancelText: options.cancelText,
            confirmText: options.confirmText,
            onConfirm,
            onCancel,
          })
      },
    })

    document.body.appendChild(container)
    app.mount(container)
  })
}
