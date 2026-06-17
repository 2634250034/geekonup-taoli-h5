import { createRouter, createWebHistory } from 'vue-router'
import CoursePlanView from '@/views/CoursePlanView.vue'
import PaymentResultView from '@/views/PaymentResultView.vue'
import PaymentView from '@/views/PaymentView.vue'
import ScheduleView from '@/views/ScheduleView.vue'
import TeacherDetailView from '@/views/TeacherDetailView.vue'
import TeacherListView from '@/views/TeacherListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'teacher-list',
      component: TeacherListView,
      meta: {
        title: '推荐老师',
      },
    },
    {
      path: '/teachers/:id',
      name: 'teacher-detail',
      component: TeacherDetailView,
      meta: {
        title: '老师详情',
      },
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: ScheduleView,
      meta: {
        title: '上课时间',
      },
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentView,
      meta: {
        title: '支付',
      },
    },
    {
      path: '/payment/result',
      name: 'payment-result',
      component: PaymentResultView,
      meta: {
        title: '支付成功',
      },
    },
    {
      path: '/course-plan',
      name: 'course-plan',
      component: CoursePlanView,
      meta: {
        title: '课程规划',
      },
    },
  ],
})

export default router
