<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchTeacherAvailability } from '@/api/teacher'

type SchedulePeriod = '上午' | '下午' | '晚上' | '凌晨'

interface ScheduleDay {
  key: string
  week: string
  date: string
  label: string
}

interface AvailabilitySlot {
  isRegular?: boolean
  date?: string
  times?: string[]
}

const periodTimes: Record<SchedulePeriod, string[]> = {
  上午: createHalfHourTimes(6, 12),
  下午: createHalfHourTimes(12, 18),
  晚上: createHalfHourTimes(18, 24),
  凌晨: createHalfHourTimes(0, 6),
}
const defaultPeriods: SchedulePeriod[] = ['上午', '下午', '晚上']

const activePeriod = ref<SchedulePeriod>('晚上')
const selectedSlotKey = ref('')
const selectedSlotTime = ref('')
const selectedSlotDay = ref<ScheduleDay | null>(null)
const route = useRoute()
const isLoading = ref(false)
const errorMessage = ref('')
const availabilitySlots = ref<AvailabilitySlot[]>([])

const teacherId = computed(() => Number(route.query.teacherId))
const scheduleDays = computed(() => createScheduleDays())
const availablePeriods = computed<SchedulePeriod[]>(() =>
  hasAvailablePeriod('凌晨') ? [...defaultPeriods, '凌晨'] : defaultPeriods,
)
const scheduleRows = computed(() =>
  periodTimes[activePeriod.value].map((time) => ({
    time,
    cells: scheduleDays.value.map((day) => ({
      day,
      available: isTrialSlotAvailable(day.key, time),
    })),
  })),
)
const selectedTimeRange = computed(() =>
  selectedSlotTime.value
    ? `${selectedSlotTime.value}-${nextHalfHour(selectedSlotTime.value)}`
    : '--:--',
)
const selectedDateText = computed(() => selectedSlotDay.value?.label || '请选择预约日期')

function createHalfHourTimes(startHour: number, endHour: number) {
  const times: string[] = []

  for (let hour = startHour; hour < endHour; hour += 1) {
    times.push(`${padTimePart(hour)}:00`, `${padTimePart(hour)}:30`)
  }

  return times
}

function createScheduleDays(): ScheduleDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    const week = getWeekdayText(date.getDay())
    const monthText = padTimePart(date.getMonth() + 1)
    const dayText = padTimePart(date.getDate())

    return {
      key: `${date.getFullYear()}-${monthText}-${dayText}`,
      week,
      date: `${monthText}.${dayText}`,
      label: `${monthText}月${dayText}日 周${week}`,
    }
  })
}

function getWeekdayText(dayIndex: number) {
  const weekdayMap = ['日', '一', '二', '三', '四', '五', '六']

  return weekdayMap[dayIndex] ?? ''
}

function nextHalfHour(time: string) {
  const [hourText = '0', minuteText = '0'] = time.split(':')
  const date = new Date(2000, 0, 1, Number(hourText), Number(minuteText) + 30)

  return `${padTimePart(date.getHours())}:${padTimePart(date.getMinutes())}`
}

function padTimePart(value: number) {
  return String(value).padStart(2, '0')
}

function normalizeSlotDate(date?: string) {
  return date?.slice(0, 10) ?? ''
}

function normalizeSlotTime(time: string) {
  const match = time.match(/(\d{1,2}):(\d{2})/)

  if (!match) return time

  return `${padTimePart(Number(match[1]))}:${match[2]}`
}

function isTrialSlotAvailable(dayKey: string, time: string) {
  return availabilitySlots.value.some(
    (slot) =>
      normalizeSlotDate(slot.date) === dayKey &&
      slot.isRegular !== true &&
      (slot.times || []).map(normalizeSlotTime).includes(time),
  )
}

function hasAvailablePeriod(period: SchedulePeriod) {
  return periodTimes[period].some((time) =>
    scheduleDays.value.some((day) => isTrialSlotAvailable(day.key, time)),
  )
}

function getFirstAvailablePeriod() {
  return availablePeriods.value.find((period) => hasAvailablePeriod(period))
}

async function loadTeacherAvailability() {
  selectedSlotKey.value = ''
  selectedSlotTime.value = ''
  selectedSlotDay.value = null

  if (!Number.isFinite(teacherId.value)) {
    errorMessage.value = '缺少老师 ID'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    availabilitySlots.value = await fetchTeacherAvailability(teacherId.value)
    activePeriod.value = getFirstAvailablePeriod() || availablePeriods.value[0] || '上午'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '老师可约时间加载失败'
  } finally {
    isLoading.value = false
  }
}

function selectSlot(time: string, day: ScheduleDay) {
  if (!isTrialSlotAvailable(day.key, time)) {
    return
  }

  const nextSlotKey = `${day.key}-${time}`

  if (selectedSlotKey.value === nextSlotKey) {
    selectedSlotKey.value = ''
    selectedSlotTime.value = ''
    selectedSlotDay.value = null
    return
  }

  selectedSlotKey.value = nextSlotKey
  selectedSlotTime.value = time
  selectedSlotDay.value = day
}

function switchPeriod(period: SchedulePeriod) {
  activePeriod.value = period
}

onMounted(() => {
  void loadTeacherAvailability()
})
</script>

<template>
  <main class="page schedule-page">
    <section class="selection-card">
      <p>当前选择：</p>
      <strong>{{ selectedTimeRange }}</strong>
      <span>{{ selectedDateText }}</span>
    </section>

    <div class="period-tabs" role="tablist" aria-label="预约时段">
      <button
        v-for="period in availablePeriods"
        :key="period"
        type="button"
        :class="{ 'is-active': activePeriod === period }"
        @click="switchPeriod(period)"
      >
        {{ period }}
      </button>
    </div>

    <p v-if="isLoading" class="schedule-state">加载中...</p>
    <p v-else-if="errorMessage" class="schedule-state">{{ errorMessage }}</p>
    <p v-else-if="availabilitySlots.length === 0" class="schedule-state">暂无可约时间</p>

    <section v-else class="schedule-table" aria-label="可上课时间">
      <div class="schedule-table__head schedule-table__row">
        <div class="schedule-table__time-col"></div>
        <div
          v-for="day in scheduleDays"
          :key="day.key"
          class="schedule-table__day-col schedule-table__day-head"
        >
          <strong>{{ day.week }}</strong>
          <span>{{ day.date }}</span>
        </div>
      </div>

      <div v-for="row in scheduleRows" :key="row.time" class="schedule-table__row">
        <div class="schedule-table__time-col">
          <span>{{ row.time }}</span>
        </div>

        <div
          v-for="cell in row.cells"
          :key="`${cell.day.key}-${row.time}`"
          class="schedule-table__day-col"
        >
          <button
            type="button"
            class="schedule-cell"
            :class="[
              cell.available ? 'is-available' : 'is-disabled',
              {
                'is-picked': selectedSlotKey === `${cell.day.key}-${row.time}`,
              },
            ]"
            :disabled="!cell.available"
            @click="selectSlot(row.time, cell.day)"
          >
            <img
              v-if="selectedSlotKey === `${cell.day.key}-${row.time}`"
              class="schedule-cell__selected-image"
              src="@/assets/image/selected-time.png"
              alt="已选择"
            />
            <span v-else-if="cell.available">可约</span>
            <span v-else>/</span>
          </button>
        </div>
      </div>
    </section>

    <footer class="schedule-action">
      <RouterLink :class="{ 'is-disabled': !selectedSlotKey }" to="/payment">确认约课</RouterLink>
    </footer>
  </main>
</template>

<style scoped lang="less">
.schedule-page {
  min-height: 100vh;
  padding: 20px 12px calc(104px + var(--safe-bottom));
  background: #fff;
}

.selection-card {
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 18px 16px;

  p {
    color: var(--color-text-secondary);
    font-size: 15px;
    line-height: 24px;
  }

  strong {
    display: block;
    margin-top: 4px;
    color: #071c40;
    font-size: 30px;
    font-weight: 700;
    line-height: 38px;
  }

  span {
    display: block;
    margin-top: 4px;
    color: var(--color-text-secondary);
    font-size: 17px;
    line-height: 26px;
  }
}

.period-tabs {
  display: flex;
  gap: 12px;
  margin-top: 16px;

  button {
    min-width: 58px;
    min-height: 45px;
    border-radius: 12px;
    background: #f7f8fa;
    color: #071c40;
    font-size: 18px;
    line-height: 24px;
  }

  .is-active {
    background: #e9f3ff;
    color: var(--color-primary);
  }
}

.schedule-state {
  border-radius: 12px;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 24px;
  margin-top: 16px;
  padding: 28px 16px;
  text-align: center;
}

.schedule-table {
  overflow: hidden;
  margin-top: 16px;
  border-radius: 12px;
  border: 1px solid #e7e7e7;
  background: #fff;
}

.schedule-table__row {
  display: flex;
}

.schedule-table__head {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.schedule-table__row + .schedule-table__row {
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.schedule-table__time-col {
  display: flex;
  width: 47px;
  min-height: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  color: #a6aebf;
  font-size: 12px;
  line-height: 18px;
}

.schedule-table__day-col {
  display: flex;
  width: calc((100% - 47px) / 7);
  min-height: 38px;
  align-items: center;
  justify-content: center;
}

.schedule-table__day-head {
  min-height: 52px;
  flex-direction: column;

  strong {
    color: #0a1c40;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
  }

  span {
    color: #697283;
    font-size: 11px;
    line-height: 18px;
  }
}

.schedule-cell {
  display: flex;
  width: 35px;
  height: 27px;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  overflow: hidden;
  padding: 0;
  color: #d5d9e0;
  font-size: 11px;
  font-weight: 600;
  line-height: 17px;

  &.is-disabled {
    background: #f6f7f8;
    color: #d5d9e0;
  }

  &.is-available,
  &.is-selected {
    background: #e6f8ef;
    color: #2ba471;
  }

  &.is-picked {
    background: transparent;
    color: #fff;
  }
}

.schedule-cell__selected-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.schedule-action {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 11;
  border-top: 1px solid #edf0f5;
  background: rgba(255, 255, 255, 0.96);
  padding: 16px 16px calc(16px + var(--safe-bottom));

  a {
    display: flex;
    width: 100%;
    min-height: 56px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: linear-gradient(135deg, #4d8cff 0%, #1759ee 100%);
    color: #fff;
    font-size: 20px;
    font-weight: 600;

    &.is-disabled {
      opacity: 0.55;
      pointer-events: none;
    }
  }
}
</style>
