<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import SectionCard from '@/components/SectionCard.vue'
import TeacherProfileCard from '@/components/TeacherProfileCard.vue'
import { detailTeacher } from '@/data/teachers'

const tabs = ['老师介绍', '学生评价', '可上课时间'] as const
type DetailTab = (typeof tabs)[number]

const router = useRouter()
const activeTab = ref<DetailTab>('老师介绍')
const teacher = computed(() => detailTeacher)

const certificateItems = Array.from({ length: 6 }, (_, index) => index)
const feedbackItems = Array.from({ length: 4 }, (_, index) => index)

function handleTabClick(tab: DetailTab) {
  if (tab === '可上课时间') {
    router.push('/schedule')
    return
  }

  activeTab.value = tab
}
</script>

<template>
  <main class="page detail-page">
    <nav class="detail-tabs" aria-label="老师详情">
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        :class="{ 'is-active': activeTab === tab }"
        @click="handleTabClick(tab)"
      >
        {{ tab }}
      </button>
    </nav>

    <div class="detail-page__content">
      <TeacherProfileCard :teacher="teacher" />

      <template v-if="activeTab === '老师介绍'">
        <SectionCard title="可授课学科">
          <div class="subject-list">
            <span v-for="subject in teacher.subjects" :key="subject">{{ subject }}</span>
          </div>
        </SectionCard>

        <SectionCard title="个人简介">
          <p class="intro-text">{{ teacher.intro }}</p>
        </SectionCard>

        <SectionCard title="教学资质">
          <div class="qualification">
            <h3>语言成绩：</h3>
            <p>{{ teacher.scores }}</p>

            <h3>资格证书：</h3>
            <div class="certificate-grid">
              <img
                v-for="item in certificateItems"
                :key="item"
                src="@/assets/image/cert-placeholder.png"
                alt="资格证书"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="教学经验">
          <ul class="experience-list">
            <li v-for="item in teacher.experiences" :key="item">{{ item }}</li>
          </ul>
        </SectionCard>

        <SectionCard title="学员反馈">
          <div class="feedback-strip">
            <img
              v-for="item in feedbackItems"
              :key="item"
              src="@/assets/image/cert-placeholder.png"
              alt="学员反馈"
            />
          </div>
        </SectionCard>
      </template>

      <template v-else-if="activeTab === '学生评价'">
        <SectionCard title="学员反馈">
          <div class="review-list">
            <article>
              <strong>学习体验很好</strong>
              <p>老师讲解很细，会根据我的薄弱点安排练习，口语表达明显更顺了。</p>
            </article>
            <article>
              <strong>课程节奏清晰</strong>
              <p>每节课都有明确目标，课后反馈也很具体，适合备考阶段持续跟进。</p>
            </article>
          </div>
        </SectionCard>
      </template>
    </div>

    <footer class="detail-action">
      <RouterLink to="/schedule">选择预约时间</RouterLink>
    </footer>
  </main>
</template>

<style scoped lang="less">
.detail-page {
  padding-bottom: calc(92px + var(--safe-bottom));
  background: var(--color-background);
}

.detail-tabs {
  position: sticky;
  top: 0;
  z-index: 9;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom: 1px solid #eef1f6;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);

  button {
    position: relative;
    min-height: 52px;
    color: var(--color-text-secondary);
    font-size: 17px;
    line-height: 24px;
  }

  .is-active {
    color: #071c40;
    font-weight: 600;

    &::after {
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 24px;
      height: 3px;
      border-radius: 999px;
      background: #071c40;
      content: '';
      transform: translateX(-50%);
    }
  }
}

.detail-page__content {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.subject-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    border-radius: 999px;
    background: #f1f4ff;
    color: #6676ac;
    font-size: 13px;
    line-height: 24px;
    padding: 0 10px;
  }
}

.intro-text,
.qualification p {
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 28px;
}

.qualification {
  border-radius: 8px;
  border: 1px solid var(--color-border);
  padding: 16px 12px;

  h3 {
    margin-bottom: 8px;
    color: #071c40;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;

    &:not(:first-child) {
      margin-top: 16px;
    }
  }
}

.certificate-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  img {
    width: 100%;
    border-radius: 4px;
  }
}

.experience-list {
  display: grid;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 26px;
  list-style: disc;
  padding-left: 20px;
}

.feedback-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  img {
    width: 100%;
    border-radius: 8px;
  }
}

.review-list {
  display: grid;
  gap: 12px;

  article {
    border-radius: 10px;
    background: var(--color-surface-muted);
    padding: 14px;
  }

  strong {
    color: #071c40;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin-top: 6px;
    color: var(--color-text-secondary);
    font-size: 15px;
    line-height: 26px;
  }
}

.detail-action {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 11;
  border-top: 1px solid #edf0f5;
  background: rgba(255, 255, 255, 0.96);
  padding: 14px 14px calc(14px + var(--safe-bottom));

  a {
    display: flex;
    min-height: 52px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: linear-gradient(135deg, #4d8cff 0%, #1759ee 100%);
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }
}
</style>
