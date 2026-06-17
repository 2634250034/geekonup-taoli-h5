<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchTeacherPage } from '@/api/teacher'
import TeacherCard from '@/components/TeacherCard.vue'
import type { Teacher } from '@/types/teacher'

const route = useRoute()
const teachers = ref<Teacher[]>([])
const currentPage = ref(1)
const pageSize = 10
const total = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')

const token = computed(() => {
  const value = route.query.token
  const tokenValue = Array.isArray(value) ? value[0] : value

  return typeof tokenValue === 'string' ? tokenValue : ''
})

const hasMore = computed(() => teachers.value.length < total.value)

async function loadTeachers(page = 1) {
  if (!token.value) {
    errorMessage.value = '分享链接缺少 token 参数'
    return
  }

  if (isLoading.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await fetchTeacherPage({
      token: token.value,
      current: page,
      size: pageSize,
    })

    teachers.value = page === 1 ? result.records : [...teachers.value, ...result.records]
    currentPage.value = result.current
    total.value = result.total
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '老师列表加载失败'
  } finally {
    isLoading.value = false
  }
}

function loadMore() {
  if (!hasMore.value) return

  void loadTeachers(currentPage.value + 1)
}

onMounted(() => {
  void loadTeachers()
})
</script>

<template>
  <main class="page teacher-list-page">
    <img src="@/assets/image/hero-card.png" alt="推荐老师" />

    <section v-if="teachers.length > 0" class="teacher-list" aria-label="老师列表">
      <TeacherCard v-for="teacher in teachers" :key="teacher.id" :teacher="teacher" />
    </section>

    <p v-else class="list-state">{{ isLoading ? '加载中...' : errorMessage || '暂无推荐老师' }}</p>

    <p v-if="errorMessage && teachers.length > 0" class="list-state">{{ errorMessage }}</p>

    <button
      v-if="hasMore || isLoading"
      class="load-more"
      type="button"
      :disabled="isLoading"
      @click="loadMore"
    >
      {{ isLoading ? '加载中...' : '点击查看更多老师' }}
      <span aria-hidden="true"></span>
    </button>
  </main>
</template>

<style scoped lang="less">
.teacher-list-page {
  padding: 20px 12px calc(56px + var(--safe-bottom));
  background: #fff;
}

.hero-card__icon {
  position: relative;
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  border: 4px solid rgba(255, 255, 255, 0.9);
  border-top-color: transparent;
  border-radius: 18px;

  &::before,
  &::after {
    position: absolute;
    content: '';
  }

  &::before {
    top: 8px;
    left: 10px;
    width: 20px;
    height: 20px;
    border: 4px solid rgba(255, 255, 255, 0.9);
    border-radius: 50%;
  }

  &::after {
    right: -9px;
    bottom: 8px;
    width: 22px;
    height: 32px;
    border-right: 4px solid rgba(255, 255, 255, 0.9);
    border-bottom: 4px solid rgba(255, 255, 255, 0.9);
    border-radius: 0 0 12px 0;
  }

  span {
    position: absolute;
    right: -5px;
    top: 7px;
    width: 23px;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.9);

    &::after {
      position: absolute;
      right: 0;
      top: 10px;
      width: 18px;
      height: 4px;
      border-radius: inherit;
      background: inherit;
      content: '';
    }
  }
}

.teacher-list {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

.list-state {
  margin-top: 24px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 22px;
  text-align: center;
}

.load-more {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 22px;
  color: var(--color-text-secondary);
  font-size: 14px;

  &:disabled {
    opacity: 0.65;
  }

  span {
    width: 8px;
    height: 8px;
    border-right: 1.5px solid currentColor;
    border-bottom: 1.5px solid currentColor;
    transform: rotate(45deg) translateY(-2px);
  }
}
</style>
