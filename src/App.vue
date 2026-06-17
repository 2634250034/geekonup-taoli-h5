<script setup lang="ts">
import AppToast from '@/components/AppToast.vue'
</script>

<template>
  <RouterView />
  <AppToast />
</template>
<style>
@font-face {
  font-family: 'AlimamaFangYuanVF';
  src:
    url('https://at.alicdn.com/wf/webfont/vIfC1icTa0KN/QY1ycGrEPSyB.woff2') format('woff2'),
    url('https://at.alicdn.com/wf/webfont/vIfC1icTa0KN/NiNS42SvP9SG.woff') format('woff');
  font-display: swap;
}

/* 2. 注册为全局快捷类名 */
.webfont {
  font-family: 'AlimamaFangYuanVF', sans-serif;
  /* 基础参数：圆角BEVL 80，字重wght 200（适合下面的 label 标签） */
  font-variation-settings:
    'BEVL' 80,
    'wght' 600;
}
</style>
