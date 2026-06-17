export interface Teacher {
  id: number
  name: string
  avatar?: string
  teacherType?: 'NORMAL' | 'GOLD'
  gender: 'female' | 'male'
  school: string
  degree: string
  nickname: string
  title: string
  tags: string[]
  subjects: string[]
  intro: string
  listIntro: string
  trialPrice: string
  availableDates: string[]
  scores: string
  experiences: string[]
  certificateContent?: string[]
  studentFeedback?: string[]
  remarkContent?: string
}

export type TimePeriod = 'morning' | 'afternoon' | 'evening'

export type SlotState = 'available' | 'disabled' | 'selected'

export interface TimeSlot {
  id: string
  label: string
  date: string
  weekday: string
  period: TimePeriod
  state: SlotState
}
