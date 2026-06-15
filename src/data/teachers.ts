import type { Teacher, TimePeriod, TimeSlot } from '@/types/teacher'

export const detailTeacher: Teacher = {
  id: 1,
  name: '李娉',
  gender: 'female',
  school: '星洲艺术学院',
  degree: '本科',
  nickname: '小王',
  title: '金牌讲师',
  tags: ['口语专家', '口语专家', '口语专家'],
  subjects: [
    '面试英语',
    '雅思听力',
    '口语基础',
    '少儿口语',
    '日常口语',
    'PTE全科',
    '托福口语',
    '雅思阅读',
  ],
  intro:
    '拥有5年一线教学经验，擅长启发式教学，注重培养学生的逻辑思维能力和解题思路。教学风格亲切耐心，善于发现学生的薄弱环节并针对性辅导，帮助多名学生提升英语成绩。',
  listIntro: '10年教学经验，擅长口语突破与发音纠正，帮助超过200位学员提升口语能力。',
  trialPrice: '￥9.9',
  availableDates: ['4月28日', '4月28日', '4月28日', '4月28日', '4月28日'],
  scores: '雅思总分8.0，阅读9.0，口语7.5',
  experiences: [
    '累计辅导学生超300人，平均提分20+',
    '多名学生考入重点中学、985高校',
    '多次获评机构“优秀教师”“金牌讲师”称',
  ],
}

export const recommendedTeachers: Teacher[] = [
  {
    id: 1,
    name: '王老师',
    gender: 'male',
    school: '东北财经大学',
    degree: '本科',
    nickname: '小王',
    title: '金牌讲师',
    tags: ['口语专家', '口语专家', '口语专家'],
    subjects: ['面试英语', '雅思听力', '口语基础', '少儿口语', '日常口语', 'PTE全科'],
    intro:
      '拥有多年英语教学经验，课堂节奏清晰，善于拆解口语表达和听力理解中的关键问题，帮助学生建立稳定的学习方法。',
    listIntro: '10年教学经验，擅长口语突破与发音纠正，帮助超过200位学员提升口语能力。',
    trialPrice: '￥9.9',
    availableDates: ['4月28日', '4月28日', '4月28日', '4月28日', '4月28日'],
    scores: '雅思总分8.0，阅读9.0，口语7.5',
    experiences: ['累计辅导学生超300人，平均提分20+', '多名学生考入重点中学、985高校'],
  },
  {
    id: 2,
    name: '王老师',
    gender: 'male',
    school: '东北财经大学',
    degree: '本科',
    nickname: '小王',
    title: '金牌讲师',
    tags: ['口语专家', '口语专家', '口语专家'],
    subjects: ['面试英语', '雅思听力', '口语基础', '少儿口语'],
    intro: '专注一对一课程规划，熟悉不同年龄段学生的表达特点，能根据学生基础制定阶段性提升方案。',
    listIntro: '10年教学经验，擅长口语突破与发音纠正，帮助超过200位学员提升口语能力。',
    trialPrice: '￥9.9',
    availableDates: ['4月28日', '4月28日', '4月28日', '4月28日', '4月28日'],
    scores: '雅思总分8.0，阅读9.0，口语7.5',
    experiences: ['累计辅导学生超300人，平均提分20+', '多次获评机构“优秀教师”“金牌讲师”称'],
  },
  {
    id: 3,
    name: '王老师',
    gender: 'male',
    school: '东北财经大学',
    degree: '本科',
    nickname: '小王',
    title: '金牌讲师',
    tags: ['口语专家', '口语专家', '口语专家'],
    subjects: ['面试英语', '雅思听力', '口语基础', '少儿口语'],
    intro: '专注一对一课程规划，熟悉不同年龄段学生的表达特点，能根据学生基础制定阶段性提升方案。',
    listIntro: '10年教学经验，擅长口语突破与发音纠正，帮助超过200位学员提升口语能力。',
    trialPrice: '￥9.9',
    availableDates: ['4月28日', '4月28日', '4月28日', '4月28日', '4月28日'],
    scores: '雅思总分8.0，阅读9.0，口语7.5',
    experiences: ['累计辅导学生超300人，平均提分20+', '多次获评机构“优秀教师”“金牌讲师”称'],
  },
]

export const periods: Array<{ label: string; value: TimePeriod }> = [
  { label: '上午', value: 'morning' },
  { label: '下午', value: 'afternoon' },
  { label: '晚上', value: 'evening' },
]

export const scheduleDays = [
  { weekday: '日', date: '05.08' },
  { weekday: '一', date: '05.08' },
  { weekday: '二', date: '05.08' },
  { weekday: '三', date: '05.08' },
  { weekday: '四', date: '05.08' },
  { weekday: '五', date: '05.08' },
  { weekday: '六', date: '05.08' },
]

const periodTimes: Record<TimePeriod, string[]> = {
  morning: ['08:00-08:30', '08:30-09:00', '09:00-09:30', '09:30-10:00', '10:00-10:30'],
  afternoon: ['13:00-13:30', '13:30-14:00', '14:00-14:30', '14:30-15:00', '15:00-15:30'],
  evening: ['18:00-18:30', '18:30-19:00', '19:00-19:30', '19:30-20:00', '20:00-20:30'],
}

const availabilityMap: Record<TimePeriod, Array<Array<TimeSlot['state']>>> = {
  morning: [
    ['disabled', 'available', 'available', 'disabled', 'available', 'selected', 'disabled'],
    ['disabled', 'disabled', 'disabled', 'disabled', 'disabled', 'selected', 'disabled'],
    ['available', 'selected', 'disabled', 'available', 'available', 'disabled', 'available'],
    ['disabled', 'selected', 'disabled', 'disabled', 'disabled', 'disabled', 'disabled'],
    ['available', 'selected', 'disabled', 'available', 'disabled', 'disabled', 'available'],
  ],
  afternoon: [
    ['available', 'available', 'disabled', 'available', 'disabled', 'available', 'disabled'],
    ['disabled', 'available', 'available', 'disabled', 'available', 'disabled', 'available'],
    ['available', 'disabled', 'disabled', 'available', 'available', 'disabled', 'available'],
    ['disabled', 'selected', 'available', 'disabled', 'disabled', 'available', 'disabled'],
    ['available', 'disabled', 'available', 'available', 'disabled', 'disabled', 'available'],
  ],
  evening: [
    ['disabled', 'available', 'available', 'disabled', 'available', 'selected', 'disabled'],
    ['disabled', 'disabled', 'disabled', 'disabled', 'disabled', 'selected', 'disabled'],
    ['available', 'selected', 'disabled', 'available', 'available', 'disabled', 'available'],
    ['disabled', 'selected', 'disabled', 'disabled', 'disabled', 'disabled', 'disabled'],
    ['available', 'selected', 'disabled', 'available', 'disabled', 'disabled', 'available'],
  ],
}

export function createSchedule(period: TimePeriod): TimeSlot[][] {
  return periodTimes[period].map((time, rowIndex) =>
    scheduleDays.map((day, dayIndex) => ({
      id: `${period}-${rowIndex}-${dayIndex}`,
      label: time,
      date: day.date,
      weekday: day.weekday,
      period,
      state: availabilityMap[period][rowIndex]?.[dayIndex] ?? 'disabled',
    })),
  )
}
