<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPlanDetail, type CoursePlanDetail } from '@/api/plan'
import arrowIcon from '@/assets/image/arrow.svg'
import topIcon from '@/assets/image/top-icon.svg'
import rightIcon from '@/assets/image/right.svg'
import lessonIcon from '@/assets/image/lesson-icon.svg'

interface PlanStage {
  id: number
  title: string
  lessonCount: string
  name: string
  goal: string
  scene: string
  learningGoal: string
}

interface LessonDetail {
  id: number
  title: string
  target: string
}

type LessonSheetDragSource = 'pointer' | 'touch'

const route = useRoute()
const expandedStageIds = ref<number[]>([1])
const showLessonSheet = ref(false)
const lessonSheetDragY = ref(0)
const isLessonSheetDragging = ref(false)
const shouldIgnoreHandleClick = ref(false)
const planDetail = ref<CoursePlanDetail | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const activeLessonStageId = ref<number | null>(null)

let lessonSheetDragStartY = 0
let lessonSheetDragSource: LessonSheetDragSource | null = null
let bodyScrollTop = 0
let isBodyScrollLocked = false
let originalBodyStyle: Partial<CSSStyleDeclaration> = {}
let originalHtmlOverflow = ''

const token = computed(() => {
  const value = route.query.token
  const tokenValue = Array.isArray(value) ? value[0] : value

  return typeof tokenValue === 'string' ? tokenValue : ''
})
const planInfo = computed(() => [
  { label: '课程科目', value: planDetail.value?.subjectName || '暂无' },
  {
    label: '规划节数',
    value:
      typeof planDetail.value?.totalCount === 'number'
        ? `${planDetail.value.totalCount}节`
        : '暂无',
  },
])
const basicSituation = computed(() => planDetail.value?.basicSituation?.trim() ?? '')
const stages = computed<PlanStage[]>(() =>
  (planDetail.value?.stages ?? []).map((stage, index) => ({
    id: index + 1,
    title: `第${index + 1}阶段`,
    lessonCount: typeof stage.stageCount === 'number' ? `${stage.stageCount}节课` : '暂无节数',
    name: stage.stageName || '暂无阶段名称',
    goal: stage.stageGoal || '暂无阶段目标',
    scene: stage.sceneTheme || '暂无场景主题',
    learningGoal: stage.studyGoal || '暂无学习目标',
  })),
)
const expandedStageSet = computed(() => new Set(expandedStageIds.value))
const lessonSheetPanelStyle = computed(() => ({
  '--lesson-sheet-drag-y': `${lessonSheetDragY.value}px`,
}))
const activeLessonDetails = computed<LessonDetail[]>(() => {
  const stageIndex = activeLessonStageId.value === null ? -1 : activeLessonStageId.value - 1
  const lessons = planDetail.value?.stages?.[stageIndex]?.lessons ?? []

  return lessons.map((lesson, index) => ({
    id: index + 1,
    title: lesson.lessonTheme || `第 ${index + 1} 课`,
    target: lesson.lessonGoal || '暂无课次目标',
  }))
})

function isStageExpanded(stageId: number) {
  return expandedStageSet.value.has(stageId)
}

function toggleStage(stageId: number) {
  if (isStageExpanded(stageId)) {
    expandedStageIds.value = expandedStageIds.value.filter((id) => id !== stageId)
    return
  }

  expandedStageIds.value = [...expandedStageIds.value, stageId]
}

async function loadPlanDetail() {
  if (!token.value) {
    errorMessage.value = '分享链接缺少 token 参数'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    planDetail.value = await fetchPlanDetail(token.value)
    expandedStageIds.value = planDetail.value.stages?.length ? [1] : []
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '规划详情加载失败'
  } finally {
    isLoading.value = false
  }
}

function openLessonSheet(stageId: number) {
  activeLessonStageId.value = stageId
  showLessonSheet.value = true
}

function closeLessonSheet() {
  showLessonSheet.value = false
  activeLessonStageId.value = null
}

function resetLessonSheetDrag() {
  lessonSheetDragY.value = 0
  isLessonSheetDragging.value = false
  lessonSheetDragSource = null
}

function lockBodyScroll() {
  if (typeof window === 'undefined' || isBodyScrollLocked) return

  const bodyStyle = document.body.style

  bodyScrollTop = window.scrollY
  originalBodyStyle = {
    position: bodyStyle.position,
    top: bodyStyle.top,
    left: bodyStyle.left,
    right: bodyStyle.right,
    width: bodyStyle.width,
    overflow: bodyStyle.overflow,
  }
  originalHtmlOverflow = document.documentElement.style.overflow

  document.documentElement.style.overflow = 'hidden'
  bodyStyle.position = 'fixed'
  bodyStyle.top = `-${bodyScrollTop}px`
  bodyStyle.left = '0'
  bodyStyle.right = '0'
  bodyStyle.width = '100%'
  bodyStyle.overflow = 'hidden'
  isBodyScrollLocked = true
}

function unlockBodyScroll() {
  if (typeof window === 'undefined' || !isBodyScrollLocked) return

  const bodyStyle = document.body.style

  bodyStyle.position = originalBodyStyle.position ?? ''
  bodyStyle.top = originalBodyStyle.top ?? ''
  bodyStyle.left = originalBodyStyle.left ?? ''
  bodyStyle.right = originalBodyStyle.right ?? ''
  bodyStyle.width = originalBodyStyle.width ?? ''
  bodyStyle.overflow = originalBodyStyle.overflow ?? ''
  document.documentElement.style.overflow = originalHtmlOverflow
  window.scrollTo(0, bodyScrollTop)
  isBodyScrollLocked = false
}

function beginLessonSheetDrag(clientY: number) {
  lessonSheetDragStartY = clientY
  lessonSheetDragY.value = 0
  isLessonSheetDragging.value = true
  shouldIgnoreHandleClick.value = false
}

function updateLessonSheetDrag(clientY: number) {
  if (!isLessonSheetDragging.value) return

  lessonSheetDragY.value = Math.max(0, clientY - lessonSheetDragStartY)
}

function endLessonSheetDrag() {
  if (!isLessonSheetDragging.value) return

  const draggedDistance = lessonSheetDragY.value
  isLessonSheetDragging.value = false
  lessonSheetDragSource = null

  if (draggedDistance > 72) {
    closeLessonSheet()
    return
  }

  if (draggedDistance <= 6) {
    closeLessonSheet()
    return
  }

  lessonSheetDragY.value = 0
  shouldIgnoreHandleClick.value = draggedDistance > 6
}

function captureLessonSheetPointer(target: HTMLElement, pointerId: number) {
  try {
    target.setPointerCapture?.(pointerId)
  } catch {
    // Some WebViews throw for synthetic or interrupted pointer sequences.
  }
}

function releaseLessonSheetPointer(target: HTMLElement, pointerId: number) {
  try {
    target.releasePointerCapture?.(pointerId)
  } catch {
    // Some WebViews throw when the capture was already released.
  }
}

function startLessonSheetPointerDrag(event: PointerEvent) {
  if (lessonSheetDragSource && lessonSheetDragSource !== 'pointer') return

  lessonSheetDragSource = 'pointer'
  beginLessonSheetDrag(event.clientY)
  captureLessonSheetPointer(event.currentTarget as HTMLElement, event.pointerId)
  event.preventDefault()
}

function moveLessonSheetPointerDrag(event: PointerEvent) {
  if (lessonSheetDragSource !== 'pointer') return

  updateLessonSheetDrag(event.clientY)
  event.preventDefault()
}

function finishLessonSheetPointerDrag(event: PointerEvent) {
  if (lessonSheetDragSource !== 'pointer') return

  releaseLessonSheetPointer(event.currentTarget as HTMLElement, event.pointerId)
  endLessonSheetDrag()
  event.preventDefault()
}

function cancelLessonSheetPointerDrag(event: PointerEvent) {
  if (lessonSheetDragSource !== 'pointer') return

  releaseLessonSheetPointer(event.currentTarget as HTMLElement, event.pointerId)
  resetLessonSheetDrag()
  event.preventDefault()
}

function startLessonSheetTouchDrag(event: TouchEvent) {
  if (lessonSheetDragSource && lessonSheetDragSource !== 'touch') return

  const touch = event.touches[0]
  if (!touch) return

  lessonSheetDragSource = 'touch'
  beginLessonSheetDrag(touch.clientY)
  event.preventDefault()
}

function moveLessonSheetTouchDrag(event: TouchEvent) {
  if (lessonSheetDragSource !== 'touch') return

  const touch = event.touches[0]
  if (!touch) return

  updateLessonSheetDrag(touch.clientY)
  event.preventDefault()
}

function finishLessonSheetTouchDrag(event: TouchEvent) {
  if (lessonSheetDragSource !== 'touch') return

  endLessonSheetDrag()
  event.preventDefault()
}

function cancelLessonSheetTouchDrag(event: TouchEvent) {
  if (lessonSheetDragSource !== 'touch') return

  resetLessonSheetDrag()
  event.preventDefault()
}

function handleLessonSheetHandleClick() {
  if (shouldIgnoreHandleClick.value) {
    shouldIgnoreHandleClick.value = false
    return
  }

  closeLessonSheet()
}

watch(showLessonSheet, (visible) => {
  if (visible) {
    lockBodyScroll()
    return
  }

  unlockBodyScroll()
  resetLessonSheetDrag()
})

onBeforeUnmount(() => {
  unlockBodyScroll()
})

onMounted(() => {
  void loadPlanDetail()
})
</script>

<template>
  <main class="page course-plan-page">
    <p v-if="isLoading" class="plan-state">加载中...</p>
    <p v-else-if="errorMessage" class="plan-state">{{ errorMessage }}</p>

    <template v-else>
      <section class="plan-info-card">
        <dl>
          <div v-for="item in planInfo" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="basicSituation" class="basic-card">
        <h1>基本情况</h1>
        <p>{{ basicSituation }}</p>
      </section>

      <section v-if="stages.length > 0" class="stage-list" aria-label="课程阶段">
        <article v-for="stage in stages" :key="stage.id" class="stage-card">
          <header class="stage-card__header">
            <button
              class="stage-card__toggle"
              type="button"
              :aria-expanded="isStageExpanded(stage.id)"
              @click="toggleStage(stage.id)"
            >
              <img
                :class="{ 'is-expanded': isStageExpanded(stage.id) }"
                :src="arrowIcon"
                alt=""
                aria-hidden="true"
              />
            </button>

            <div class="stage-card__title">
              <h2>{{ stage.title }}</h2>
              <p>
                {{ stage.name }} <span>{{ stage.lessonCount }}</span>
              </p>
            </div>

            <button class="stage-card__detail" type="button" @click="toggleStage(stage.id)">
              查看详情
              <img :src="rightIcon" alt="查看详情" />
            </button>
          </header>

          <template v-if="isStageExpanded(stage.id)">
            <div class="stage-content">
              <section>
                <h3>阶段名称</h3>
                <p>{{ stage.name }}</p>
              </section>

              <section>
                <h3>阶段目标</h3>
                <p>{{ stage.goal }}</p>
              </section>

              <section>
                <h3>场景主题</h3>
                <p>{{ stage.scene }}</p>
              </section>

              <section>
                <h3>学习目标</h3>
                <p>{{ stage.learningGoal }}</p>
              </section>
            </div>

            <button class="lesson-entry" type="button" @click="openLessonSheet(stage.id)">
              <span>
                <img :src="lessonIcon" alt="" aria-hidden="true" />
                课次详情
              </span>
              <span>
                查看
                <img class="lesson-entry__arrow" :src="rightIcon" alt="查看" />
              </span>
            </button>

            <button class="stage-collapse" type="button" @click="toggleStage(stage.id)">
              <img :src="topIcon" alt="" aria-hidden="true" />
              收起
            </button>
          </template>
        </article>
      </section>

      <p v-else class="plan-state">暂无课程规划</p>
    </template>

    <Teleport to="body">
      <div
        v-if="showLessonSheet"
        class="lesson-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="课次详情"
        @click.self="closeLessonSheet"
      >
        <section
          class="lesson-sheet__panel"
          :class="{ 'is-dragging': isLessonSheetDragging }"
          :style="lessonSheetPanelStyle"
        >
          <button
            class="lesson-sheet__handle"
            type="button"
            aria-label="关闭课次详情"
            @click="handleLessonSheetHandleClick"
            @pointerdown="startLessonSheetPointerDrag"
            @pointermove="moveLessonSheetPointerDrag"
            @pointerup="finishLessonSheetPointerDrag"
            @pointercancel="cancelLessonSheetPointerDrag"
            @touchstart="startLessonSheetTouchDrag"
            @touchmove="moveLessonSheetTouchDrag"
            @touchend="finishLessonSheetTouchDrag"
            @touchcancel="cancelLessonSheetTouchDrag"
          ></button>

          <div class="lesson-sheet__content">
            <p v-if="activeLessonDetails.length === 0" class="lesson-empty">暂无课次详情</p>

            <article v-for="lesson in activeLessonDetails" :key="lesson.id" class="lesson-card">
              <header>{{ lesson.title }}</header>
              <section>
                <h3>课次目标</h3>
                <p>{{ lesson.target }}</p>
              </section>
            </article>
          </div>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<style scoped lang="less">
.course-plan-page {
  min-height: 100vh;
  padding: 12px 12px calc(30px + var(--safe-bottom));
  overflow-x: hidden;
  background: #f6f7fa;
}

.plan-state {
  border-radius: 12px;
  background: #fff;
  color: #697283;
  font-size: 15px;
  line-height: 24px;
  padding: 28px 16px;
  text-align: center;
}

.plan-info-card,
.basic-card,
.stage-card {
  border-radius: 12px;
  background: #fff;
}

.plan-info-card {
  padding: 20px 16px;

  dl {
    display: grid;
  }

  div {
    display: flex;
    min-height: 45px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    & + div {
      border-top: 1px solid #edf0f4;
    }
  }

  dt {
    color: #071c40;
    font-size: 17px;
    line-height: 25px;
  }

  dd {
    color: #697283;
    font-size: 17px;
    line-height: 25px;
    text-align: right;
  }
}

.basic-card {
  margin-top: 12px;
  padding: 19px 16px;

  h1 {
    color: #071c40;
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
  }

  p {
    margin-top: 14px;
    color: #697283;
    font-size: 17px;
    line-height: 31px;
    overflow-wrap: anywhere;
  }
}

.stage-list {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.stage-card {
  padding: 16px 12px 14px;
}

.stage-card__header {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.stage-card__toggle {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;

  img {
    display: block;
    width: 28px;
    min-width: 28px;
    max-width: none;
    height: 28px;
    flex: 0 0 28px;
    object-fit: contain;
    transition: transform 0.2s ease;
  }

  img.is-expanded {
    transform: rotate(180deg);
  }
}

.stage-card__title {
  min-width: 0;

  h2 {
    overflow: hidden;
    color: #071c40;
    font-size: 18px;
    font-weight: 600;
    line-height: 25px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    margin-top: 5px;
    color: #697283;
    font-size: 15px;
    line-height: 22px;

    span {
      margin-left: 8px;
    }
  }
}

.stage-card__detail {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #a7adba;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;

  img {
    width: 14px;
    height: 14px;
    opacity: 0.7;
  }

  img.is-expanded {
    transform: rotate(180deg);
  }
}

.stage-content {
  display: grid;
  gap: 20px;
  margin-top: 14px;
  border-radius: 8px;
  background: #f6f7fa;
  padding: 14px 12px 16px;

  h3 {
    color: #071c40;
    font-size: 15px;
    font-weight: 600;
    line-height: 22px;
  }

  p {
    margin-top: 7px;
    color: #697283;
    font-size: 16px;
    line-height: 31px;
    overflow-wrap: anywhere;
  }
}
.lesson-entry__arrow {
  width: 14px !important;
  height: 14px !important;
  opacity: 0.7;
}
.lesson-entry {
  display: flex;
  width: 100%;
  min-height: 54px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  border-radius: 8px;
  background: #e9f3ff;
  color: var(--color-primary);
  padding: 0 16px;

  span {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;

    &:last-child {
      color: #a7adba;
      font-size: 13px;
      font-weight: 400;
      line-height: 20px;
    }
  }

  img {
    width: 24px;
    height: 27px;
  }
}

.stage-collapse {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 8px auto 0;
  color: #a7adba;
  font-size: 13px;
  line-height: 20px;

  img {
    width: 14px;
    height: 14px;
    transform: rotate(180deg);
  }
}

.lesson-sheet {
  position: fixed;
  inset: 0;
  z-index: 99;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.34);
}

.lesson-sheet__panel {
  width: 100%;
  max-height: 76vh;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  background: #fff;
  padding: 18px 16px calc(20px + var(--safe-bottom));
  transform: translate3d(0, var(--lesson-sheet-drag-y, 0), 0);
  transition: transform 0.2s ease;
  will-change: transform;

  &.is-dragging {
    transition: none;
  }
}

.lesson-sheet__handle {
  position: relative;
  display: flex;
  width: 96px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  margin: -8px auto 8px;
  background: transparent;
  touch-action: none;

  &::before {
    width: 64px;
    height: 4px;
    border-radius: 999px;
    background: #d7d7d7;
    content: '';
  }
}

.lesson-sheet__content {
  display: grid;
  max-height: calc(76vh - 58px - var(--safe-bottom));
  overflow-y: auto;
  overscroll-behavior: contain;
  gap: 16px;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}

.lesson-empty {
  color: #697283;
  font-size: 15px;
  line-height: 24px;
  padding: 28px 16px;
  text-align: center;
}

.lesson-card {
  overflow: hidden;
  border-radius: 10px;
  background: #f7f9ff;
}

.lesson-card header {
  border-bottom: 1px solid #ced9f7;
  background: linear-gradient(90deg, #eef3ff 0%, #d7e0ff 100%);
  color: #071c40;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
  padding: 15px 16px;
}

.lesson-card section {
  padding: 18px 16px 20px;

  h3 {
    position: relative;
    color: #697283;
    font-size: 17px;
    font-weight: 400;
    line-height: 25px;
    padding-left: 26px;

    &::before {
      position: absolute;
      left: 0;
      top: 5px;
      width: 16px;
      height: 16px;
      border-radius: 4px;
      background: #697283;
      content: '';
      clip-path: polygon(
        50% 0,
        61% 33%,
        96% 35%,
        68% 56%,
        79% 90%,
        50% 70%,
        21% 90%,
        32% 56%,
        4% 35%,
        39% 33%
      );
    }
  }

  p {
    margin-top: 14px;
    color: #697283;
    font-size: 17px;
    line-height: 31px;
    overflow-wrap: anywhere;
  }
}
</style>
