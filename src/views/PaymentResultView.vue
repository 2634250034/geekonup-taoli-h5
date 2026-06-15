<script setup lang="ts">
import customerServiceIcon from '@/assets/image/customer-service-icon.svg'
import resultIcon from '@/assets/image/results.svg'
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
      <button type="button">
        <img :src="customerServiceIcon" alt="" aria-hidden="true" />
        咨询客服
      </button>
    </footer>
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
</style>
