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
    },
    {
      path: '/teachers/:id',
      name: 'teacher-detail',
      component: TeacherDetailView,
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: ScheduleView,
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentView,
    },
    {
      path: '/payment/result',
      name: 'payment-result',
      component: PaymentResultView,
    },
    {
      path: '/course-plan',
      name: 'course-plan',
      component: CoursePlanView,
    },
  ],
})

export default router
