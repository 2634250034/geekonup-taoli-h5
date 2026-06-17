import { post } from '@/api/request'
import type { Teacher } from '@/types/teacher'

interface ApiResponse<T> {
  success?: boolean
  code?: number | string
  message?: string
  data?: T
}

interface PageResponse<T> {
  records?: T[]
  total?: number
  size?: number
  current?: number
}

interface TeacherAvailabilityTime {
  date?: string
  times?: string[]
}

interface TeacherResponse {
  id?: number
  name?: string
  avatar?: string
  code?: string
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN'
  eduBack?: 'JUNIOR_COLLEGE' | 'BACHELOR' | 'MASTER' | 'DOCTOR' | 'OTHER'
  school?: string
  teacherType?: 'NORMAL' | 'GOLD'
  courseFee?: number
  tags?: string[]
  classTimeTags?: string[]
  intro?: string
  teachingExperience?: string
  languageScore?: string
  subjectNames?: string[]
  availabilityTime?: TeacherAvailabilityTime[]
}

interface TeacherPageRequest {
  token: string
  current?: number
  size?: number
}

export interface TeacherPage {
  records: Teacher[]
  total: number
  current: number
  size: number
}

const degreeTextMap: Record<NonNullable<TeacherResponse['eduBack']>, string> = {
  JUNIOR_COLLEGE: '大专',
  BACHELOR: '本科',
  MASTER: '硕士',
  DOCTOR: '博士',
  OTHER: '其他',
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number') return '￥--'

  return `￥${value}`
}

function formatDate(date?: string) {
  if (!date) return ''

  const [, month, day] = date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/) ?? []
  if (!month || !day) return date

  return `${Number(month)}月${Number(day)}日`
}

function getAvailableDates(teacher: TeacherResponse) {
  const dates = Array.from(
    new Set((teacher.availabilityTime ?? []).map((item) => formatDate(item.date)).filter(Boolean)),
  )

  if (dates.length > 0) return dates
  if (teacher.classTimeTags?.length) return teacher.classTimeTags

  return ['暂无可约时间']
}

function mapTeacher(teacher: TeacherResponse): Teacher {
  const subjects = teacher.subjectNames?.length ? teacher.subjectNames : (teacher.tags ?? [])
  const listIntro = teacher.teachingExperience || teacher.intro || '暂无老师简介'

  return {
    id: teacher.id ?? 0,
    name: teacher.name || '老师',
    avatar: teacher.avatar,
    gender: teacher.gender === 'FEMALE' ? 'female' : 'male',
    school: teacher.school || '暂无学校信息',
    degree: teacher.eduBack ? degreeTextMap[teacher.eduBack] : '暂无学历信息',
    nickname: teacher.code || '桃李老师',
    title: teacher.teacherType === 'GOLD' ? '金牌讲师' : '讲师',
    tags: teacher.tags?.length ? teacher.tags : subjects.slice(0, 3),
    subjects,
    intro: teacher.intro || listIntro,
    listIntro,
    trialPrice: formatCurrency(teacher.courseFee),
    availableDates: getAvailableDates(teacher),
    scores: teacher.languageScore || '暂无教学成果',
    experiences: teacher.teachingExperience ? [teacher.teachingExperience] : [],
  }
}

function isSuccessResponse<T>(response: ApiResponse<T>) {
  if (response.success === true) return true
  if (response.success === false) return false

  return response.code === undefined || ['0', '200'].includes(`${response.code}`)
}

export async function fetchTeacherPage(params: TeacherPageRequest): Promise<TeacherPage> {
  const response = await post<ApiResponse<PageResponse<TeacherResponse>>>('/h5/teacher/page', {
    headers: {
      Token: params.token,
    },
    data: {
      current: params.current ?? 1,
      size: params.size ?? 10,
      token: params.token,
    },
  })

  if (!isSuccessResponse(response)) {
    throw new Error(response.message || '老师列表加载失败')
  }

  return {
    records: (response.data?.records ?? []).map(mapTeacher),
    total: response.data?.total ?? 0,
    current: response.data?.current ?? params.current ?? 1,
    size: response.data?.size ?? params.size ?? 10,
  }
}
