<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toast } = useToast()
</script>

<template>
  <Teleport to="body">
    <Transition name="toast-fade">
      <div
        v-if="toast.visible"
        class="app-toast"
        :class="`app-toast--${toast.type}`"
        role="status"
        aria-live="polite"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="less">
.app-toast {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 120;
  max-width: min(280px, calc(100vw - 48px));
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.76);
  color: #fff;
  font-size: 15px;
  line-height: 22px;
  padding: 10px 16px;
  text-align: center;
  transform: translate(-50%, -50%);
  word-break: break-word;
}

.app-toast--error {
  background: rgba(0, 0, 0, 0.82);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 8px));
}
</style>
