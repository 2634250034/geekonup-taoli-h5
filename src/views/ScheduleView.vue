<script setup lang="ts">
import { computed, ref } from 'vue'
import { createSchedule, periods, scheduleDays } from '@/data/teachers'
import type { TimePeriod, TimeSlot } from '@/types/teacher'

const activePeriod = ref<TimePeriod>('morning')
const schedule = computed(() => createSchedule(activePeriod.value))

const selectedSlot = ref<TimeSlot | null>(null)

const currentSelection = computed(() => selectedSlot.value)
const currentDateText = computed(() => {
  const slot = currentSelection.value

  if (!slot) {
    return ''
  }

  const date = slot.date.includes('月') ? slot.date : `${slot.date.replace('.', '月')}日`
  return `${date} 周${slot.weekday}`
})

function selectSlot(slot: TimeSlot) {
  if (slot.state === 'disabled') {
    return
  }

  if (selectedSlot.value?.id === slot.id) {
    selectedSlot.value = null
    return
  }

  selectedSlot.value = slot
}

function switchPeriod(period: TimePeriod) {
  activePeriod.value = period
  selectedSlot.value = null
}
</script>

<template>
  <main class="page schedule-page">
    <section class="selection-card">
      <p>当前选择：</p>
      <strong>{{ currentSelection?.label }}</strong>
      <span>{{ currentDateText }}</span>
    </section>

    <div class="period-tabs" role="tablist" aria-label="预约时段">
      <button
        v-for="period in periods"
        :key="period.value"
        type="button"
        :class="{ 'is-active': activePeriod === period.value }"
        @click="switchPeriod(period.value)"
      >
        {{ period.label }}
      </button>
    </div>

    <section class="schedule-table" aria-label="可上课时间">
      <div class="schedule-table__head schedule-table__row">
        <div class="schedule-table__time-col"></div>
        <div
          v-for="day in scheduleDays"
          :key="`${day.weekday}-${day.date}`"
          class="schedule-table__day-col schedule-table__day-head"
        >
          <strong>{{ day.weekday }}</strong>
          <span>{{ day.date }}</span>
        </div>
      </div>

      <div v-for="(row, rowIndex) in schedule" :key="rowIndex" class="schedule-table__row">
        <div class="schedule-table__time-col">
          <span>00:00</span>
        </div>

        <div v-for="slot in row" :key="slot.id" class="schedule-table__day-col">
          <button
            type="button"
            class="schedule-cell"
            :class="[
              `is-${slot.state}`,
              {
                'is-picked': selectedSlot?.id === slot.id,
              },
            ]"
            :disabled="slot.state === 'disabled'"
            @click="selectSlot(slot)"
          >
            <img
              v-if="selectedSlot?.id === slot.id"
              class="schedule-cell__selected-image"
              src="@/assets/image/selected-time.png"
              alt="已选择"
            />
            <span v-else-if="slot.state !== 'disabled'">可约</span>
            <span v-else>/</span>
          </button>
        </div>
      </div>
    </section>

    <footer class="schedule-action">
      <RouterLink to="/payment">确认约课</RouterLink>
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
  }
}
</style>
