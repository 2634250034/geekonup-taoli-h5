<template>
  <view class="custom-page custom-page--gray min-h-100vh" style="background: #fff !important;">
    <scroll-view scroll-y class="page-scroll">
      <view class="booking-content">
        <view class="selected-time-card">
          <text class="selected-label">当前选择：</text>
          <text class="selected-time">{{ selectedTimeRange }}</text>
          <text class="selected-date">{{
            selectedSlotDay?.label || "请选择预约日期"
          }}</text>
        </view>

        <view class="period-tabs">
          <view
            v-for="period in availablePeriods"
            :key="period"
            class="period-tab"
            :class="{ 'period-tab--active': activePeriod === period }"
            @tap="changePeriod(period)"
          >
            <text>{{ period }}</text>
          </view>
        </view>

        <view class="schedule-table">
          <view class="schedule-head">
            <view class="time-col"></view>
            <view
              v-for="day in scheduleDays"
              :key="day.key"
              class="day-col day-head"
            >
              <text class="day-week">{{ day.week }}</text>
              <text class="day-date">{{ day.date }}</text>
            </view>
          </view>
          <view
            v-for="row in scheduleRows"
            :key="row.time"
            class="schedule-row"
          >
            <view class="time-col">
              <text>{{ row.time }}</text>
            </view>
            <view
              v-for="cell in row.cells"
              :key="`${row.time}-${cell.day.key}`"
              class="day-col"
              @tap="cell.available && selectSlot(row.time, cell.day)"
            >
              <view
                class="slot-cell"
                :class="{
                  'slot-cell--available': cell.available,
                  'slot-cell--active':
                    selectedSlotKey === `${cell.day.key}-${row.time}`,
                }"
              >
                <t-icon
                  v-if="selectedSlotKey === `${cell.day.key}-${row.time}`"
                  name="check"
                  size="34rpx"
                  color="#FFFFFF"
                />
                <text v-else>{{ cell.available ? "可约" : "/" }}</text>
              </view>
            </view>
          </view>
        </view>

        <text class="contact-hint">请填写您的联系方式，便于后续联系您</text>
        <view class="contact-card">
          <view class="field-row">
            <text class="field-label"><text class="required">*</text>姓名</text>
            <input
              class="field-input"
              v-model="contact.name"
              placeholder="请填写"
            />
          </view>
          <view class="field-row">
            <text class="field-label"><text class="required">*</text>微信号</text>
            <input
              class="field-input"
              v-model="contact.wechat"
              placeholder="请填写"
            />
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="footer-actions mb-32rpx">
      <t-button
        theme="primary"
        block
        :disabled="isSubmitting"
        custom-style="height:96rpx;border-radius:24rpx;background:linear-gradient(270deg,#1D5CF0 0%,#518AFF 100%);font-size:32rpx;font-weight:500;"
        @click="confirmBooking"
      >
        {{ isSubmitting ? "提交中..." : "确认约课" }}
      </t-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import {
  getStudentTeacherAvailability,
  saveStudentClueInfo,
  type TeacherTimeSlot,
} from "@/api";
import { useUserInfo } from "@/composables/useUserInfo";
import { onLoad } from "@dcloudio/uni-app";
import { computed, reactive, ref } from "vue";
import { getTeacherById, periods, periodTimes } from "./data";
import { createPaymentContextKey, savePaymentContext } from "./payment-context";
import type { Period, ScheduleDay } from "./types";
import { createQuery, createScheduleDays, nextHalfHour } from "./utils";

const activePeriod = ref<Period>("晚上");
const teacherId = ref(1);
const subjectId = ref<number | undefined>();
const subject = ref("日常口语");
const selectedSlotKey = ref("");
const selectedSlotTime = ref("");
const selectedSlotDay = ref<ScheduleDay | null>(null);
const isSubmitting = ref(false);
const availabilitySlots = ref<TeacherTimeSlot[]>([]);
const contact = reactive({ name: "", wechat: "" });
const { userInfo } = useUserInfo();

const selectedTeacher = computed(() => getTeacherById(teacherId.value));
const scheduleDays = computed(() => createScheduleDays());
const availablePeriods = computed<Period[]>(() => {
  const defaultPeriods: Period[] = ["上午", "下午", "晚上"];
  return hasAvailablePeriod("凌晨")
    ? [...defaultPeriods, "凌晨"]
    : defaultPeriods;
});
const scheduleRows = computed(() =>
  periodTimes[activePeriod.value].map((time) => ({
    time,
    cells: scheduleDays.value.map((day) => ({
      day,
      available: isTrialSlotAvailable(day.key, time),
    })),
  })),
);
const selectedTimeRange = computed(() =>
  selectedSlotTime.value
    ? `${selectedSlotTime.value}-${nextHalfHour(selectedSlotTime.value)}`
    : "--:--",
);

onLoad((query) => {
  teacherId.value = Number(query?.teacherId || 1);
  const nextSubjectId = Number(query?.subjectId || 0);
  subjectId.value = nextSubjectId || undefined;
  subject.value = String(query?.subject || "日常口语");
  contact.name = userInfo.value?.nickname || userInfo.value?.name || "";
  contact.wechat = userInfo.value?.wechatNo || "";
  loadTeacherAvailability();
});

function selectSlot(time: string, day: ScheduleDay) {
  selectedSlotKey.value = `${day.key}-${time}`;
  selectedSlotTime.value = time;
  selectedSlotDay.value = day;
}

function changePeriod(period: Period) {
  activePeriod.value = period;
}

function selectFirstAvailableSlot() {
  for (const period of availablePeriods.value) {
    const row = periodTimes[period].find((time) =>
      scheduleDays.value.some((day) => isTrialSlotAvailable(day.key, time)),
    );
    if (!row) continue;
    const day = scheduleDays.value.find((item) =>
      isTrialSlotAvailable(item.key, row),
    );
    if (!day) continue;
    activePeriod.value = period;
    selectSlot(row, day);
    return;
  }
}

async function loadTeacherAvailability() {
  selectedSlotKey.value = "";
  selectedSlotTime.value = "";
  selectedSlotDay.value = null;

  try {
    const result = await getStudentTeacherAvailability(teacherId.value);
    if (result.code !== 200 || !result.data) {
      uni.showToast({
        title: result.message || "可约时间加载失败",
        icon: "none",
      });
      return;
    }

    availabilitySlots.value = result.data.slotData || [];
    activePeriod.value = availablePeriods.value[0] || "上午";
    selectFirstAvailableSlot();
  } catch (error) {
    uni.showToast({ title: "可约时间加载失败", icon: "none" });
  }
}

function isTrialSlotAvailable(dayKey: string, time: string) {
  return availabilitySlots.value.some(
    (slot) =>
      slot.date === dayKey &&
      slot.isRegular !== true &&
      (slot.times || []).map(normalizeSlotTime).includes(time),
  );
}

function hasAvailablePeriod(period: Period) {
  return periodTimes[period].some((time) =>
    scheduleDays.value.some((day) => isTrialSlotAvailable(day.key, time)),
  );
}

function normalizeSlotTime(time: string) {
  return time.length === 5 ? time : time.slice(0, 5);
}

async function confirmBooking() {
  if (isSubmitting.value) return;
  if (!selectedSlotKey.value || !contact.name || !contact.wechat) {
    uni.showToast({ title: "请选择时间并填写联系方式", icon: "none" });
    return;
  }

  isSubmitting.value = true;
  uni.showLoading({ title: "提交中...", mask: true });
  try {
    const result = await saveStudentClueInfo({
      teacherId: selectedTeacher.value.id,
      subjectId: subjectId.value,
      reserveTime: getReserveTime(),
      studentName: contact.name,
      studentPhone: userInfo.value?.phone,
      studentWechat: contact.wechat,
    });

    if (result.code !== 200) {
      uni.hideLoading();
      uni.showToast({ title: result.message || "预约失败", icon: "none" });
      return;
    }

    const orderAmount = result.data?.orderAmount;
    const shouldPay =
      selectedTeacher.value.isGold &&
      (orderAmount === undefined || Number(orderAmount) > 0);

    uni.hideLoading();
    goBookingResult(shouldPay, result.data?.subjectName, result.data?.expireTime);
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: "预约失败，请稍后重试", icon: "none" });
  } finally {
    uni.hideLoading();
    isSubmitting.value = false;
  }
}

function goBookingResult(
  shouldPay: boolean,
  savedSubjectName?: string,
  expireTime?: string,
) {
  if (!shouldPay) {
    uni.navigateTo({
      url: `/pages/custom-course/result?${createQuery({ type: "booking" })}`,
    });
    return;
  }

  const paymentContextKey = createPaymentContextKey();
  savePaymentContext(paymentContextKey, {
    teacherId: selectedTeacher.value.id,
    subjectId: subjectId.value,
    subject: savedSubjectName || subject.value,
    date: selectedSlotDay.value?.compactLabel || "",
    time: selectedTimeRange.value,
    expireTime,
  });

  uni.navigateTo({
    url: `/pages/custom-course/payment?${createQuery({ paymentContextKey })}`,
  });
}

function getReserveTime() {
  return selectedSlotDay.value && selectedSlotTime.value
    ? `${selectedSlotDay.value.key} ${selectedSlotTime.value}:00`
    : "";
}
</script>

<style lang="scss" scoped>
@use "./shared.scss";

.booking-content {
  box-sizing: border-box;
  min-height: 100%;
  padding: 24rpx 24rpx 212rpx;
}

.selected-time-card {
  display: flex;
  min-height: 190rpx;
  flex-direction: column;
  justify-content: center;
  padding: 24rpx;
  border: 2rpx solid #e7e7e7;
  border-radius: 24rpx;
  background: #fff;
  box-sizing: border-box;
}

.selected-label,
.selected-date {
  color: #697283;
  font-size: 28rpx;
  line-height: 44rpx;
}

.selected-time {
  margin-top: 4rpx;
  color: #0a1c40;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 56rpx;
}

.period-tabs {
  display: flex;
  gap: 24rpx;
  margin: 28rpx 0 24rpx;
}

.period-tab {
  display: flex;
  width: 96rpx;
  height: 64rpx;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: #f6f7f8;
  color: #0a1c40;
  font-size: 32rpx;
  line-height: 48rpx;
}

.period-tab--active {
  background: #e8f1ff;
  color: #1d5cf0;
}

.schedule-table {
  overflow: hidden;
  border: 2rpx solid #e7e7e7;
  border-radius: 24rpx;
  background: #fff;
}

.schedule-head,
.schedule-row {
  display: flex;
}

.schedule-head {
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.06);
}

.time-col {
  display: flex;
  width: 94rpx;
  min-height: 72rpx;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-right: 2rpx solid rgba(0, 0, 0, 0.06);
  color: #a6aebf;
  font-size: 24rpx;
  line-height: 40rpx;
  box-sizing: border-box;
}

.day-col {
  display: flex;
  width: calc((100% - 94rpx) / 7);
  min-height: 72rpx;
  align-items: center;
  justify-content: center;
}

.day-head {
  min-height: 104rpx;
  flex-direction: column;
}

.day-week {
  color: #0a1c40;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 40rpx;
}

.day-date {
  color: #697283;
  font-size: 24rpx;
  line-height: 40rpx;
}

.slot-cell {
  display: flex;
  width: 72rpx;
  height: 56rpx;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  background: #f6f7f8;
  color: #d5d9e0;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 40rpx;
}

.slot-cell--available {
  background: #e6f8ef;
  color: #2ba471;
}

.slot-cell--active {
  background: #58c58c;
  color: #fff;
}

.contact-hint {
  display: block;
  margin-top: 32rpx;
  color: #697283;
  font-size: 28rpx;
  line-height: 44rpx;
}

.contact-card {
  margin-top: 16rpx;
  padding: 24rpx 24rpx 0;
  border: 2rpx solid #e7e7e7;
  border-radius: 24rpx;
  background: #fff;
}
</style>
