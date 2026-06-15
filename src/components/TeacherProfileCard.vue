<script setup lang="ts">
import type { Teacher } from '@/types/teacher'

defineProps<{
  teacher: Teacher
}>()
</script>

<template>
  <section class="profile-card">
    <img class="profile-card__avatar" src="@/assets/image/avatar.png" :alt="teacher.name" />

    <div class="profile-card__body">
      <div class="profile-card__name-row">
        <h1>{{ teacher.name }}</h1>
        <img
          v-if="teacher.gender === 'female'"
          class="profile-card__gender"
          src="@/assets/image/female.svg"
          alt="女"
        />
        <img v-else class="profile-card__gender" src="@/assets/image/male.svg" alt="男" />
      </div>

      <img
        class="profile-card__badge"
        src="@/assets/image/gold-badge-icon.svg"
        :alt="teacher.title"
      />

      <p>
        {{ teacher.school }}<span>·</span>{{ teacher.degree }}<span>·</span>{{ teacher.nickname }}
      </p>
    </div>
  </section>
</template>

<style scoped lang="less">
.profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: 12px;
  padding: 16px 20px;
  background:
    linear-gradient(180deg, rgba(255, 221, 139, 0.5) 0, rgba(255, 255, 255, 0.96) 88px),
    var(--color-surface);
}

.profile-card__avatar {
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  border-radius: 50%;
  object-fit: cover;
}

.profile-card__body {
  min-width: 0;
}

.profile-card__name-row {
  display: flex;
  align-items: center;
  gap: 5px;

  h1 {
    color: #071c40;
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
  }
}

.profile-card__gender {
  width: 14px;
  height: 18px;
}

.profile-card__badge {
  width: 66px;
  margin-top: 2px;
}

p {
  display: flex;
  overflow: hidden;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
