<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import alipayIcon from '@/assets/image/alipay.svg'
import avatarImage from '@/assets/image/avatar.png'
import goldBadgeIcon from '@/assets/image/gold-badge-icon.svg'
import wechatPayIcon from '@/assets/image/weChatPay.svg'
import { detailTeacher, recommendedTeachers } from '@/data/teachers'

type PaymentMethod = 'alipay' | 'wechat'

const router = useRouter()
const teacher = computed(() => recommendedTeachers[0] ?? detailTeacher)
const selectedMethod = ref<PaymentMethod>('alipay')
const isPaying = ref(false)

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

const paymentAmount = '9.9'
const bookingInfo = [
  {
    label: '预约时间',
    value: '03-27 周三 19:00-19:30',
  },
  {
    label: '课程科目',
    value: '日常口语',
  },
]

function handlePay() {
  if (isPaying.value) {
    return
  }

  isPaying.value = true

  window.setTimeout(() => {
    router.push('/payment/result')
  }, 1000)
}
</script>

<template>
  <main class="page payment-page">
    <section class="payment-amount" aria-label="支付金额">
      <p>支付金额</p>
      <strong><span>¥</span>{{ paymentAmount }}</strong>
      <small>待支付， 剩余 14:59</small>
    </section>

    <section class="payment-card">
      <h1>预约讲师</h1>

      <article class="teacher-summary">
        <img class="teacher-summary__avatar" :src="avatarImage" :alt="teacher.name" />

        <div class="teacher-summary__main">
          <div class="teacher-summary__title">
            <h2>{{ teacher.name }}</h2>
            <img :src="goldBadgeIcon" :alt="teacher.title" />
          </div>

          <p class="teacher-summary__meta">
            {{ teacher.school }}<span>·</span>{{ teacher.degree }}<span>·</span
            >{{ teacher.nickname }}
          </p>
        </div>

        <p class="teacher-summary__intro">{{ teacher.listIntro }}</p>

        <div class="teacher-summary__tags">
          <span v-for="tag in teacher.tags" :key="tag">{{ tag }}</span>
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

    <section class="payment-card payment-method-card">
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
        <strong>¥ {{ paymentAmount }}</strong>
        <p>15分钟内未支付，订单将自动取消</p>
      </div>

      <button type="button" :disabled="isPaying" @click="handlePay">立即支付</button>
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

.teacher-summary {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 10px 12px;
  margin-top: 16px;
  border-radius: 12px;
  padding: 14px 12px 16px;
  background:
    linear-gradient(180deg, rgba(255, 223, 146, 0.58) 0, rgba(255, 255, 255, 0.95) 94px), #fff;
  box-shadow: 0 10px 22px rgba(30, 41, 59, 0.04);
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
  min-height: 56px;
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
