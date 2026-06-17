<script setup lang="ts">
import { computed } from 'vue'
import fallbackAvatar from '@/assets/image/avatar.png'
import type { Teacher } from '@/types/teacher'

const props = defineProps<{
  teacher: Teacher
}>()

const isGoldTeacher = computed(() => props.teacher.teacherType === 'GOLD')
</script>

<template>
  <article class="teacher-card" :class="{ 'teacher-card--gold': isGoldTeacher }">
    <RouterLink
      class="teacher-card__main"
      :to="`/teachers/${teacher.id}`"
      :aria-label="`查看${teacher.name}详情`"
    >
      <img
        class="teacher-card__avatar"
        :src="teacher.avatar || fallbackAvatar"
        :alt="teacher.name"
        @error="($event.target as HTMLImageElement).src = fallbackAvatar"
      />

      <div class="teacher-card__content">
        <div class="teacher-card__title-row">
          <h2>{{ teacher.name }}</h2>
          <img
            v-if="isGoldTeacher"
            class="teacher-card__badge"
            src="@/assets/image/gold-badge-icon.svg"
            :alt="teacher.title"
          />
        </div>

        <p class="teacher-card__meta">
          {{ teacher.school }}<span>·</span>{{ teacher.degree }}<span>·</span>{{ teacher.nickname }}
        </p>
      </div>

      <img
        class="teacher-card__arrow"
        src="@/assets/image/arrow-right.svg"
        alt=""
        aria-hidden="true"
      />
    </RouterLink>

    <div class="teacher-card__tags">
      <span v-for="tag in teacher.tags" :key="tag">{{ tag }}</span>
    </div>

    <p class="teacher-card__intro">{{ teacher.listIntro }}</p>

    <div class="teacher-card__dates">
      <img src="@/assets/image/filled-time.svg" alt="" aria-hidden="true" />
      <span>可约：</span>
      <p>{{ teacher.availableDates.join('、') }}...</p>
      <RouterLink
        class="teacher-card__more"
        :to="{ path: '/schedule', query: { teacherId: String(teacher.id) } }"
      >
        更多
      </RouterLink>
      <img
        class="teacher-card__more-icon"
        src="@/assets/image/arrow-right.svg"
        alt=""
        aria-hidden="true"
      />
    </div>

    <footer class="teacher-card__footer">
      <div class="teacher-card__price">
        <span>试听费用：</span>
        <strong>{{ teacher.trialPrice }}</strong>
      </div>

      <RouterLink
        class="teacher-card__book"
        :to="{ path: '/schedule', query: { teacherId: String(teacher.id) } }"
      >
        去预约
        <span aria-hidden="true">→</span>
      </RouterLink>
    </footer>
  </article>
</template>

<style scoped lang="less">
.teacher-card {
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: var(--color-surface);
  box-shadow: 0 8px 24px rgba(15, 31, 64, 0.05);
}

.teacher-card--gold {
  border-color: rgba(0, 0, 0, 0.03);
  background:
    linear-gradient(180deg, rgba(255, 221, 139, 0.55) 0, rgba(255, 255, 255, 0.95) 92px),
    var(--color-surface);
}

.teacher-card__main {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 16px;
  gap: 12px;
  align-items: center;
  padding: 18px 18px 8px;
  color: inherit;
}

.teacher-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.teacher-card__content {
  min-width: 0;
}

.teacher-card__title-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;

  h2 {
    flex: 0 1 auto;
    overflow: hidden;
    color: #071c40;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.teacher-card__badge {
  width: 66px;
  height: auto;
}

.teacher-card__meta {
  display: flex;
  overflow: hidden;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;

  span {
    color: #98a3b8;
  }
}

.teacher-card__arrow {
  width: 8px;
  justify-self: end;
  opacity: 0.85;
}

.teacher-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 4px 18px 0;

  span {
    border-radius: 999px;
    background: rgba(255, 133, 35, 0.08);
    color: #ee7c22;
    font-size: 11px;
    line-height: 18px;
    padding: 0 8px;
  }
}

.teacher-card__intro {
  padding: 10px 18px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 24px;
}

.teacher-card__dates {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 4px;
  padding: 12px 18px 14px;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 20px;

  > img:first-child {
    width: 14px;
    height: 14px;
  }

  p {
    overflow: hidden;
    min-width: 0;
    flex: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.teacher-card__more {
  flex: 0 0 auto;
  color: var(--color-text-muted);
}

.teacher-card__more-icon {
  width: 6px;
  opacity: 0.55;
}

.teacher-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 18px;
  padding: 14px 0 16px;
  border-top: 1px solid rgba(229, 234, 243, 0.76);
}

.teacher-card__price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: #071c40;
  font-size: 14px;
  line-height: 24px;

  strong {
    color: #f58a19;
    font-size: 18px;
    font-weight: 700;
  }
}

.teacher-card__book {
  display: inline-flex;
  min-width: 82px;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4d8cff 0%, #1759ee 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 8px 16px rgba(29, 92, 240, 0.18);
}
</style>
