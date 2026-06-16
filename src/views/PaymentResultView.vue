<script setup lang="ts">
import { ref } from 'vue'
import customerServiceIcon from '@/assets/image/customer-service-icon.svg'
import qrCodeImage from '@/assets/image/QRcode.png'
import resultIcon from '@/assets/image/results.svg'

const showServiceModal = ref(false)
</script>

<template>
  <main class="page payment-result-page">
    <section class="payment-result-status" aria-labelledby="payment-result-title">
      <img class="payment-result-status__icon" :src="resultIcon" alt="" aria-hidden="true" />
      <h1 id="payment-result-title">支付成功</h1>
      <p>您已成功预约试听课</p>
      <RouterLink class="payment-result-status__link" to="/">
        点击打开小程序
        <span aria-hidden="true">›</span>
      </RouterLink>
    </section>

    <footer class="payment-result-action">
      <button type="button" @click="showServiceModal = true">
        <img :src="customerServiceIcon" alt="" aria-hidden="true" />
        咨询客服
      </button>
    </footer>

    <Teleport to="body">
      <div
        v-if="showServiceModal"
        class="service-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        @click.self="showServiceModal = false"
      >
        <section class="service-modal__card">
          <img class="service-modal__qr" :src="qrCodeImage" alt="客服微信二维码" />
          <h2 id="service-modal-title">添加客服微信</h2>
          <p>长按识别二维码</p>
          <button
            class="service-modal__close"
            type="button"
            aria-label="关闭"
            @click="showServiceModal = false"
          >
            ×
          </button>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<style scoped lang="less">
.payment-result-page {
  min-height: 100vh;
  padding: clamp(160px, 27vh, 220px) 16px calc(104px + var(--safe-bottom));
  overflow-x: hidden;
  background: #fff;
}

.payment-result-status {
  display: grid;
  justify-items: center;
  color: #071c40;
  text-align: center;
}

.payment-result-status__icon {
  width: 78px;
  height: 78px;
}

.payment-result-status h1 {
  margin-top: 28px;
  font-size: 22px;
  font-weight: 600;
  line-height: 32px;
}

.payment-result-status p {
  margin-top: 18px;
  color: var(--color-text-secondary);
  font-size: 17px;
  line-height: 26px;
}

.payment-result-status__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  color: var(--color-primary);
  font-size: 17px;
  line-height: 26px;

  span {
    font-size: 24px;
    line-height: 1;
  }
}

.payment-result-action {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 11;
  background: rgba(255, 255, 255, 0.97);
  padding: 14px 16px calc(14px + var(--safe-bottom));
}

.payment-result-action button {
  display: flex;
  width: 100%;
  min-height: 56px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4d8cff 0%, #1759ee 100%);
  color: #fff;
  font-size: 19px;
  font-weight: 600;

  img {
    width: 22px;
    height: 21px;
  }
}

.service-modal {
  position: fixed;
  inset: 0;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.34);
}

.service-modal__card {
  display: grid;
  width: min(100%, 280px);
  justify-items: center;
  border-radius: 14px;
  background: #fff;
  padding: 30px 28px 31px;
}

.service-modal__qr {
  width: 224px;
  height: 224px;
  object-fit: contain;
}

.service-modal__card h2 {
  margin-top: 24px;
  color: #071c40;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.service-modal__card p {
  margin-top: 12px;
  color: #697283;
  font-size: 17px;
  line-height: 26px;
}

.service-modal__close {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  border-radius: 14px;
  background: #f4f4f4;
  color: #071c40;
  font-size: 32px;
  font-weight: 300;
  line-height: 1;
}
</style>
