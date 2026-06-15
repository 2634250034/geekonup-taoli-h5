<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section class="section-card">
    <h2>{{ title }}</h2>
    <slot />
  </section>
</template>

<style scoped lang="less">
.section-card {
  border-radius: 12px;
  padding: 20px;
  background: var(--color-surface);
}

h2 {
  margin-bottom: 14px;
  color: #071c40;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}
</style>
