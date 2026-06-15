import { createRouter, createWebHistory } from 'vue-router'
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
  ],
})

export default router
