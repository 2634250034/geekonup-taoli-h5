import { computed, reactive } from 'vue'

export type ToastType = 'info' | 'success' | 'error'

interface ToastState {
  message: string
  type: ToastType
  visible: boolean
}

interface ToastOptions {
  type?: ToastType
  duration?: number
}

const DEFAULT_TOAST_DURATION = 3000

const toastState = reactive<ToastState>({
  message: '',
  type: 'info',
  visible: false,
})

let toastTimer: number | undefined

function clearToastTimer() {
  if (toastTimer) {
    window.clearTimeout(toastTimer)
    toastTimer = undefined
  }
}

function hideToast() {
  clearToastTimer()
  toastState.visible = false
}

function showToast(message: string, options: ToastOptions = {}) {
  const nextMessage = message.trim()
  if (!nextMessage) return

  clearToastTimer()
  toastState.message = nextMessage
  toastState.type = options.type ?? 'info'
  toastState.visible = true

  toastTimer = window.setTimeout(hideToast, options.duration ?? DEFAULT_TOAST_DURATION)
}

export function useToast() {
  return {
    toast: computed(() => toastState),
    showToast,
    hideToast,
  }
}
