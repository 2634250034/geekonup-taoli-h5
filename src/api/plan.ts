import { get } from '@/api/request'

interface ApiResponse<T> {
  success?: boolean
  code?: number | string
  message?: string
  data?: T
}

export interface CoursePlanLesson {
  lessonTheme?: string
  lessonGoal?: string
}

export interface CoursePlanStage {
  stageName?: string
  stageCount?: number
  stageGoal?: string
  sceneTheme?: string
  studyGoal?: string
  lessons?: CoursePlanLesson[]
}

export interface CoursePlanDetail {
  basicSituation?: string
  subjectName?: string
  teacherName?: string
  directionName?: string
  totalCount?: number
  stages?: CoursePlanStage[]
}

function isSuccessResponse<T>(response: ApiResponse<T>) {
  if (response.success === false) return false
  if (response.success === true) return true

  return `${response.code}` === '200'
}

export async function fetchPlanDetail(token: string) {
  const response = await get<ApiResponse<CoursePlanDetail>>('/h5/plan', {
    params: {
      token,
    },
    headers: {
      Token: token,
    },
  })

  if (!isSuccessResponse(response)) {
    throw new Error(response.message || '规划详情加载失败')
  }

  return response.data ?? {}
}
