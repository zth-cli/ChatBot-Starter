import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
export const ConfirmDialog = defineComponent({
  name: 'ConfirmDialog',
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: '确认',
    },
    description: {
      type: String,
      default: '确定要执行此操作吗？',
    },
    cancelText: {
      type: String,
      default: '取消',
    },
    confirmText: {
      type: String,
      default: '确定',
    },
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    return () => (
      <AlertDialog open={props.open}>
        <AlertDialogTrigger as-child></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{props.title}</AlertDialogTitle>
            <AlertDialogDescription>{props.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => emit('cancel')}>{props.cancelText}</AlertDialogCancel>
            <AlertDialogAction variant='destructive' onClick={() => emit('confirm')}>
              {props.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  },
})
