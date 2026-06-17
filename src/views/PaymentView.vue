<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import alipayIcon from '@/assets/image/alipay.svg'
import avatarImage from '@/assets/image/avatar.png'
import goldBadgeIcon from '@/assets/image/gold-badge-icon.svg'
import wechatPayIcon from '@/assets/image/weChatPay.svg'
import { createH5Prepay, fetchOrderPayInfo, type OrderPayInfo } from '@/api/payment'
import { useToast } from '@/composables/useToast'

type PaymentMethod = 'alipay' | 'wechat'

const ORDER_PAY_VALID_SECONDS = 15 * 60

const router = useRouter()
const route = useRoute()
const selectedMethod = ref<PaymentMethod>('alipay')
const isPaying = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const orderInfo = ref<OrderPayInfo | null>(null)
const nowTime = ref(Date.now())
const { showToast } = useToast()
let countdownTimer: number | undefined

const orderCode = computed(() => {
  const value = route.query.orderCode

  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')
})

const paymentMethods: Array<{
  id: PaymentMethod
  label: string
  icon: string
}> = [
  {
    id: 'alipay',
    label: '支付宝',
    icon: alipayIcon,
  },
  {
    id: 'wechat',
    label: '微信支付',
    icon: wechatPayIcon,
  },
]

const paymentAmount = computed(() => formatAmount(orderInfo.value?.orderAmount))
const orderStatusText = computed(() => formatOrderStatus(orderInfo.value?.orderStatus))
const isFormalOrder = computed(() => orderInfo.value?.orderType === 'FORMAL')
const remainingSeconds = computed(() => {
  if (isFormalOrder.value || orderInfo.value?.orderStatus !== 'WAIT_PAY') return null

  const expireDate = parseDateTime(orderInfo.value?.expireTime)
  if (!expireDate) return null

  const seconds = Math.max(0, Math.floor((expireDate.getTime() - nowTime.value) / 1000))

  return Math.min(ORDER_PAY_VALID_SECONDS, seconds)
})
const remainingTimeText = computed(() => formatCountdown(remainingSeconds.value))
const expireText = computed(() => {
  if (orderInfo.value?.orderStatus !== 'WAIT_PAY') return orderStatusText.value

  return `待支付，剩余时间 ${remainingTimeText.value}`
})
const primaryTeacher = computed(() => orderInfo.value?.teachers?.[0] ?? null)
const teacherName = computed(() => primaryTeacher.value?.teacherName || '预约讲师')
const teacherCode = computed(() => primaryTeacher.value?.teacherCode || '桃李老师')
const teacherAvatar = computed(() => primaryTeacher.value?.teacherAvatar || avatarImage)
const isGoldTeacher = computed(() => primaryTeacher.value?.teacherType === 'GOLD')
const teacherIntro = computed(
  () => primaryTeacher.value?.teacherIntro || orderInfo.value?.subjectName || '课程信息加载后展示',
)
const cardTitle = computed(() =>
  orderInfo.value?.orderType === 'FORMAL' ? '课程信息' : '预约讲师',
)
const bookingInfo = computed(() =>
  isFormalOrder.value
    ? [
        {
          label: '课程科目',
          value: orderInfo.value?.subjectName,
        },
        {
          label: '课时节数',
          value: formatClassCount(orderInfo.value?.classCount),
        },
        {
          label: '单课时长',
          value: '50分钟',
        },
      ].filter((item) => item.value)
    : [
        {
          label: '预约时间',
          value: formatAppointmentRange(orderInfo.value?.appointTime),
        },
        {
          label: '课程科目',
          value: orderInfo.value?.subjectName,
        },
      ].filter((item) => item.value),
)

async function loadOrderPayInfo() {
  if (!orderCode.value) {
    errorMessage.value = '缺少订单号'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    orderInfo.value = await fetchOrderPayInfo(orderCode.value)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '订单信息加载失败'
  } finally {
    isLoading.value = false
  }
}

function formatAmount(value?: number) {
  if (typeof value !== 'number') return '--'

  return value.toFixed(2).replace(/\.00$/, '')
}

function formatClassCount(value?: number) {
  if (typeof value !== 'number') return ''

  return `${value}节`
}

function parseDateTime(value?: string) {
  if (!value) return null

  const localDate = parseBackendLocalDateTime(value)
  if (localDate) return localDate

  const fallbackDate = new Date(value.replace(/-/g, '/'))

  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate
}

function parseBackendLocalDateTime(value: string) {
  const match = value
    .trim()
    .match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?/)

  if (!match) return null

  const [, year, month, day, hour = '0', minute = '0', second = '0'] = match
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  )

  return Number.isNaN(date.getTime()) ? null : date
}

function formatAppointmentRange(value?: string) {
  const date = parseDateTime(value)
  if (!date) return ''

  const endDate = new Date(date.getTime() + 30 * 60 * 1000)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const week = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
  const startTime = formatHourMinute(date)
  const endTime = formatHourMinute(endDate)

  return `${month}-${day} 周${week} ${startTime}-${endTime}`
}

function formatHourMinute(date: Date) {
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${hour}:${minute}`
}

function formatCountdown(seconds: number | null) {
  if (seconds === null) return '--:--'

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const nextSeconds = String(seconds % 60).padStart(2, '0')

  return `${minutes}:${nextSeconds}`
}

function startCountdownTimer() {
  nowTime.value = Date.now()
  countdownTimer = window.setInterval(() => {
    nowTime.value = Date.now()
  }, 1000)
}

function formatOrderStatus(status?: OrderPayInfo['orderStatus']) {
  const statusMap: Record<NonNullable<OrderPayInfo['orderStatus']>, string> = {
    WAIT_PAY: '待支付',
    PAID: '已支付',
    CANCEL: '已取消',
    REFUND: '已退款',
    IN_EFFECT: '生效中',
    COMPLETED: '已完成',
  }

  return status ? statusMap[status] : '待支付'
}

async function handlePay() {
  if (isPaying.value || isLoading.value || errorMessage.value || !orderInfo.value) {
    return
  }

  if (!orderCode.value) {
    showToast('缺少订单号', { type: 'error' })
    return
  }

  isPaying.value = true

  try {
    await createH5Prepay(orderCode.value)
    router.push('/payment/result')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '支付发起失败', { type: 'error' })
  } finally {
    isPaying.value = false
  }
}

onMounted(() => {
  startCountdownTimer()
  void loadOrderPayInfo()
})

onBeforeUnmount(() => {
  if (countdownTimer) {
    window.clearInterval(countdownTimer)
  }
})
</script>

<template>
  <main class="page payment-page">
    <section v-if="!isFormalOrder" class="payment-amount" aria-label="支付金额">
      <p>支付金额</p>
      <strong class="webfont"><span>¥</span>{{ paymentAmount }}</strong>
      <small>{{ expireText }}</small>
    </section>

    <p v-if="isLoading" class="payment-state">加载中...</p>
    <section v-else-if="errorMessage" class="payment-state payment-state--error">
      <p>{{ errorMessage }}</p>
      <button type="button" @click="loadOrderPayInfo">重试</button>
    </section>

    <section v-else class="payment-card">
      <h1>{{ cardTitle }}</h1>

      <article class="teacher-summary">
        <img
          class="teacher-summary__avatar"
          :src="teacherAvatar"
          :alt="teacherName"
          @error="($event.target as HTMLImageElement).src = avatarImage"
        />

        <div class="teacher-summary__main">
          <div class="teacher-summary__title">
            <h2>{{ teacherName }}</h2>
            <img v-if="isGoldTeacher" :src="goldBadgeIcon" alt="金牌老师" />
          </div>

          <p class="teacher-summary__meta">
            {{ teacherCode }}
          </p>
        </div>

        <p class="teacher-summary__intro">
          {{ teacherIntro }}
        </p>

        <div class="teacher-summary__tags">
          <span>{{ orderStatusText }}</span>
          <span v-if="orderInfo?.orderType === 'FORMAL'">课包订单</span>
          <span v-else>试听订单</span>
        </div>
      </article>

      <h1 class="payment-card__subtitle">其他信息</h1>

      <dl class="booking-info">
        <div v-for="item in bookingInfo" :key="item.label">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </div>
      </dl>
    </section>

    <section v-if="!isLoading && !errorMessage" class="payment-card payment-method-card">
      <h1>支付方式</h1>

      <div class="payment-methods">
        <label
          v-for="method in paymentMethods"
          :key="method.id"
          class="payment-method"
          :class="{ 'is-selected': selectedMethod === method.id }"
        >
          <span class="payment-method__body">
            <img :src="method.icon" :alt="method.label" />
            <span>{{ method.label }}</span>
          </span>

          <input
            v-model="selectedMethod"
            class="payment-method__input"
            type="radio"
            name="payment-method"
            :value="method.id"
            :disabled="isPaying"
          />
          <span class="payment-method__check" aria-hidden="true"></span>
        </label>
      </div>
    </section>

    <footer class="payment-action">
      <div class="payment-action__price">
        <strong class="webfont">¥ {{ paymentAmount }}</strong>
        <p v-if="!isFormalOrder">15分钟内未支付，订单将自动取消</p>
      </div>

      <button
        type="button"
        :disabled="isPaying || isLoading || !!errorMessage || !orderInfo"
        @click="handlePay"
      >
        立即支付
      </button>
    </footer>

    <Teleport to="body">
      <div v-if="isPaying" class="payment-loading" role="status" aria-live="polite">
        <div class="payment-loading__dialog">
          <span class="payment-loading__spinner" aria-hidden="true"></span>
          <p>支付中</p>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<style scoped lang="less">
.payment-page {
  min-height: 100vh;
  padding: 38px 12px calc(112px + var(--safe-bottom));
  overflow-x: hidden;
  background: #f7f8fb;
}

.payment-amount {
  display: grid;
  justify-items: center;
  color: #071c40;

  p {
    font-size: 17px;
    line-height: 24px;
  }

  strong {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-top: 8px;
    font-size: 58px;
    font-weight: 700;
    line-height: 68px;
    letter-spacing: 0;

    span {
      font-size: 30px;
      line-height: 1;
    }
  }

  small {
    margin-top: 4px;
    color: var(--color-text-secondary);
    font-size: 17px;
    line-height: 26px;
  }
}

.payment-card {
  overflow: hidden;
  border-radius: 12px;
  margin-top: 28px;
  padding: 18px 12px 16px;
  background: var(--color-surface);

  h1 {
    color: #071c40;
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
  }
}

.payment-state {
  border-radius: 12px;
  margin-top: 28px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 24px;
  padding: 28px 16px;
  text-align: center;
}

.payment-state--error {
  display: grid;
  justify-items: center;
  gap: 12px;

  button {
    min-width: 84px;
    min-height: 36px;
    border-radius: 8px;
    background: var(--color-primary);
    color: #fff;
    font-size: 14px;
  }
}

.teacher-summary {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 10px 12px;
  margin-top: 16px;
  border-radius: 12px;
  padding: 14px 12px 16px;
  border: 2px solid #fffdf5;
  background: radial-gradient(157.61% 100% at 50% 100%, #fff 53.17%, #fffae7 87.9%, #fff0cc 100%);
  // box-shadow: 0 10px 22px rgba(30, 41, 59, 0.04);
}

.teacher-summary__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.teacher-summary__main {
  min-width: 0;
}

.teacher-summary__title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;

  h2 {
    flex: 0 1 auto;
    overflow: hidden;
    color: #071c40;
    font-size: 19px;
    font-weight: 600;
    line-height: 28px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  img {
    width: 66px;
    flex: 0 0 auto;
  }
}

.teacher-summary__meta {
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
}

.teacher-summary__intro {
  grid-column: 1 / -1;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 24px;
}

.teacher-summary__tags {
  display: flex;
  grid-column: 1 / -1;
  flex-wrap: wrap;
  gap: 10px;

  span {
    border-radius: 999px;
    background: rgba(255, 133, 35, 0.08);
    color: #ee7c22;
    font-size: 11px;
    line-height: 18px;
    padding: 0 8px;
  }
}

.payment-card__subtitle {
  margin-top: 24px;
}

.booking-info {
  overflow: hidden;
  margin-top: 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;

  div {
    display: flex;
    min-height: 60px;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 12px;

    & + div {
      border-top: 1px solid rgba(229, 234, 243, 0.72);
    }
  }

  dt {
    flex: 0 0 auto;
    color: #071c40;
    font-size: 16px;
    line-height: 24px;
  }

  dd {
    min-width: 0;
    color: var(--color-text-secondary);
    font-size: 16px;
    line-height: 24px;
    text-align: right;
    overflow-wrap: anywhere;
  }
}

.payment-method-card {
  margin-top: 12px;
  padding-bottom: 8px;
}

.payment-methods {
  margin-top: 16px;
}

.payment-method {
  position: relative;
  display: flex;
  min-height: 60px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;

  & + & {
    border-top: 1px solid rgba(229, 234, 243, 0.72);
  }
}

.payment-method__body {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  color: #071c40;
  font-size: 17px;
  line-height: 24px;

  img {
    width: 24px;
    height: 24px;
    flex: 0 0 auto;
  }
}

.payment-method__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.payment-method__check {
  position: relative;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  border-radius: 50%;
  border: 1px solid #d8dde7;
}

.payment-method.is-selected .payment-method__check {
  border-color: var(--color-primary);
  background: var(--color-primary);

  &::after {
    position: absolute;
    left: 6px;
    top: 3px;
    width: 5px;
    height: 9px;
    border-right: 2px solid #fff;
    border-bottom: 2px solid #fff;
    content: '';
    transform: rotate(45deg);
  }
}

.payment-action {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid #edf0f5;
  background: rgba(255, 255, 255, 0.97);
  padding: 14px 14px calc(14px + var(--safe-bottom));
}

.payment-action__price {
  min-width: 0;

  strong {
    display: block;
    color: #ff7a1a;
    font-size: 22px;
    font-weight: 700;
    line-height: 30px;
  }

  p {
    margin-top: 2px;
    color: var(--color-text-muted);
    font-size: 13px;
    line-height: 20px;
  }
}

.payment-action button {
  display: flex;
  width: 128px;
  min-height: 46px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #4d8cff 0%, #1759ee 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 600;

  &:disabled {
    opacity: 0.72;
  }
}

.payment-loading {
  position: fixed;
  inset: 0;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.payment-loading__dialog {
  display: grid;
  width: 104px;
  height: 104px;
  justify-items: center;
  align-content: center;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.68);
  color: #fff;
}

.payment-loading__spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.34);
  border-top-color: #fff;
  animation: payment-loading-spin 0.8s linear infinite;
}

.payment-loading__dialog p {
  margin-top: 14px;
  font-size: 15px;
  line-height: 22px;
}

@keyframes payment-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
