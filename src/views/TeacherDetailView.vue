<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import aiIcon from '@/assets/image/ai-icon.svg'
import avatarImage from '@/assets/image/avatar.png'
import starIcon from '@/assets/image/star.svg'
import { fetchTeacherDetail } from '@/api/teacher'
import SectionCard from '@/components/SectionCard.vue'
import TeacherProfileCard from '@/components/TeacherProfileCard.vue'
import { detailTeacher } from '@/data/teachers'
import type { Teacher } from '@/types/teacher'

const tabs = ['老师介绍', '学生评价', '可上课时间'] as const
type DetailTab = (typeof tabs)[number]

const router = useRouter()
const route = useRoute()
const activeTab = ref<DetailTab>('老师介绍')
const teacher = ref<Teacher>(detailTeacher)
const isLoading = ref(false)
const errorMessage = ref('')

const teacherId = computed(() => Number(route.params.id))
const certificateItems = computed(() => teacher.value.certificateContent ?? [])
const feedbackItems = computed(() => teacher.value.studentFeedback ?? [])
const overallRating = '4.7'
const ratingStars = Array.from({ length: 5 }, (_, index) => index)
const ratingMetrics = [
  { label: '专业度', value: '4.6' },
  { label: '教学风格', value: '4.2' },
  { label: '互动表现', value: '4.1' },
]
const reviewSummary =
  '综合用户的评价，该课程讲师的上课效果好，同学们对知识学得快，掌握得牢。不仅如此，还十分的耐心细致，上课过程中能够照顾理解慢的学生，综合调整课程的进度。'
const studentReviews = [
  {
    id: 1,
    name: '用户名',
    score: '4.8',
    time: '评价时间',
    content:
      '评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价评价',
    anonymous: false,
  },
  {
    id: 2,
    name: '匿名同学',
    score: '4.8',
    time: '评价时间',
    content: '评价评价评价评价',
    anonymous: true,
  },
  {
    id: 3,
    name: '匿名同学',
    score: '4.8',
    time: '评价时间',
    content: '评价评价评价评价',
    anonymous: true,
  },
  {
    id: 4,
    name: '用户名',
    score: '4.8',
    time: '评价时间',
    content: '评价评价评价评价',
    anonymous: false,
  },
]

async function loadTeacherDetail() {
  if (!Number.isFinite(teacherId.value)) {
    errorMessage.value = '缺少老师 ID'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    teacher.value = await fetchTeacherDetail(teacherId.value)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '老师详情加载失败'
  } finally {
    isLoading.value = false
  }
}

function goSchedule() {
  router.push({
    path: '/schedule',
    query: {
      teacherId: String(teacherId.value),
    },
  })
}

function handleTabClick(tab: DetailTab) {
  if (tab === '可上课时间') {
    goSchedule()
    return
  }

  activeTab.value = tab
}

onMounted(() => {
  void loadTeacherDetail()
})
</script>

<template>
  <main class="page detail-page" :class="{ 'is-review-tab': activeTab === '学生评价' }">
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
      <p v-if="isLoading" class="detail-state">加载中...</p>
      <p v-else-if="errorMessage" class="detail-state">{{ errorMessage }}</p>

      <template v-else-if="activeTab === '老师介绍'">
        <TeacherProfileCard :teacher="teacher" />

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
            <div v-if="certificateItems.length > 0" class="certificate-grid">
              <img v-for="item in certificateItems" :key="item" :src="item" alt="资格证书" />
            </div>
            <p v-else>暂无资格证书</p>
          </div>
        </SectionCard>

        <SectionCard title="教学经验">
          <ul class="experience-list">
            <li v-for="item in teacher.experiences" :key="item">{{ item }}</li>
          </ul>
        </SectionCard>

        <SectionCard title="学员反馈">
          <div v-if="feedbackItems.length > 0" class="feedback-strip">
            <img v-for="item in feedbackItems" :key="item" :src="item" alt="学员反馈" />
          </div>
          <p v-else class="intro-text">暂无学员反馈</p>
        </SectionCard>
      </template>

      <template v-else-if="activeTab === '学生评价'">
        <section class="review-overview" aria-label="学生评价概览">
          <div class="review-overview__score">
            <strong>{{ overallRating }}</strong>
            <div class="review-overview__stars" aria-label="五星评价">
              <img
                v-for="star in ratingStars"
                :key="star"
                :src="starIcon"
                alt=""
                aria-hidden="true"
              />
            </div>
          </div>

          <dl class="review-overview__metrics">
            <div v-for="metric in ratingMetrics" :key="metric.label">
              <dt>{{ metric.label }}</dt>
              <dd>{{ metric.value }}</dd>
            </div>
          </dl>
        </section>

        <section class="ai-summary-card" aria-labelledby="ai-summary-title">
          <h2 id="ai-summary-title">
            <img :src="aiIcon" alt="" aria-hidden="true" />
            <span style="">AI总结：</span>
          </h2>
          <p>{{ reviewSummary }}</p>
        </section>

        <section class="student-review-section" aria-labelledby="student-review-title">
          <h2 id="student-review-title">学生评价（12）</h2>

          <div class="student-review-list">
            <article v-for="review in studentReviews" :key="review.id" class="student-review-item">
              <div
                class="student-review-item__avatar"
                :class="{ 'is-anonymous': review.anonymous }"
              >
                <img :src="review.anonymous ? aiIcon : avatarImage" :alt="review.name" />
              </div>

              <div class="student-review-item__body">
                <header>
                  <div>
                    <h3>{{ review.name }}</h3>
                    <p>
                      <img :src="starIcon" alt="" aria-hidden="true" />
                      {{ review.score }}
                    </p>
                  </div>
                  <time>{{ review.time }}</time>
                </header>

                <p class="student-review-item__content">{{ review.content }}</p>
              </div>
            </article>
          </div>

          <button class="review-more" type="button">
            更多
            <span aria-hidden="true"></span>
          </button>
        </section>
      </template>
    </div>

    <footer v-if="activeTab === '老师介绍' && !isLoading && !errorMessage" class="detail-action">
      <button type="button" @click="goSchedule">选择预约时间</button>
    </footer>
  </main>
</template>

<style scoped lang="less">
.detail-page {
  padding-bottom: calc(92px + var(--safe-bottom));
  background: var(--color-background);
}

.detail-page.is-review-tab {
  padding-bottom: calc(32px + var(--safe-bottom));
  background: #fff;
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
    color: var(--color-primary);
    font-weight: 600;

    &::after {
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 24px;
      height: 3px;
      border-radius: 999px;
      background: var(--color-primary);
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

.detail-state {
  border-radius: 12px;
  background: #fff;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 24px;
  padding: 28px 16px;
  text-align: center;
}

.is-review-tab .detail-page__content {
  gap: 0;
  padding: 0 12px 24px;
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

.detail-action {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 11;
  border-top: 1px solid #edf0f5;
  background: rgba(255, 255, 255, 0.96);
  padding: 14px 14px calc(14px + var(--safe-bottom));

  button {
    display: flex;
    width: 100%;
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

.review-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  padding: 24px 12px 28px;
  background: #fff;
}

.review-overview__score {
  flex: 0 0 auto;

  strong {
    display: block;
    color: #ff7e1c;
    font-size: 28px;
    font-weight: 700;
    line-height: 34px;
  }
}

.review-overview__stars {
  display: flex;
  gap: 3px;
  margin-top: 7px;

  img {
    width: 13px;
    height: 13px;
  }
}

.review-overview__metrics {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  div {
    display: grid;
    min-width: 0;
    justify-items: center;
    gap: 4px;
    padding: 0 10px;

    & + div {
      border-left: 1px solid #f0f2f6;
    }
  }

  dt {
    color: #a7adba;
    font-size: 12px;
    line-height: 18px;
    white-space: nowrap;
  }

  dd {
    color: #071c40;
    font-size: 17px;
    font-weight: 600;
    line-height: 24px;
  }
}

.ai-summary-card {
  border-radius: 12px;
  padding: 18px 16px 20px;
  background: linear-gradient(180deg, #fff0ff 0%, #fff 100%);
  box-shadow: 0 10px 24px rgba(119, 83, 207, 0.08);

  h2 {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
    font-weight: 600;
    line-height: 22px;
    /* 🔴 以下是新增的字体渐变核心样式 */
    background: linear-gradient(112deg, #5990ff -4.87%, #ff59c2 89.35%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;

    /* 🔴 必须确保这个属性宽度跟着文字走，否则渐变会拉得太长导致粉色断层 */
    width: max-content;
  }

  img {
    width: 20px;
    height: 20px;
  }

  p {
    margin-top: 14px;
    color: #697283;
    font-size: 15px;
    line-height: 28px;
    overflow-wrap: anywhere;
  }
}

.student-review-section {
  margin-top: 28px;
  background: #fff;

  > h2 {
    color: #071c40;
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
  }
}

.student-review-list {
  margin-top: 18px;
}

.student-review-item {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;

  & + & {
    margin-top: 16px;
  }
}

.student-review-item__avatar {
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 50%;
  background: #f4f5f8;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.is-anonymous {
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 28px;
      height: 28px;
      opacity: 0.42;
      filter: grayscale(1);
    }
  }
}

.student-review-item__body {
  min-width: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #eef1f5;

  header {
    display: flex;
    min-width: 0;
    justify-content: space-between;
    gap: 12px;
  }

  h3 {
    overflow: hidden;
    color: #071c40;
    font-size: 17px;
    font-weight: 500;
    line-height: 24px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  header p {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 4px;
    color: #ff7e1c;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;

    img {
      width: 14px;
      height: 14px;
    }
  }

  time {
    flex: 0 0 auto;
    color: #a7adba;
    font-size: 14px;
    line-height: 22px;
  }
}

.student-review-item__content {
  margin-top: 18px;
  color: #697283;
  font-size: 17px;
  line-height: 31px;
  overflow-wrap: anywhere;
}

.review-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 44px;
  margin: 4px auto 0;
  color: #697283;
  font-size: 13px;
  line-height: 20px;

  span {
    width: 8px;
    height: 8px;
    border-right: 1px solid currentColor;
    border-bottom: 1px solid currentColor;
    transform: translateY(-2px) rotate(45deg);
  }
}
</style>
