import { get } from '@/api/request'

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

export interface TeacherEvaluationDetail {
  evaluationId?: number
  content?: string
  totalScore?: number
  courseId?: number
  studentId?: number
  studentName?: string
  studentAvatar?: string
  isAnonymous?: boolean
  createdAt?: string
}

export interface TeacherEvaluationPageResult {
  page?: PageResponse<TeacherEvaluationDetail>
  professionalismAvg?: number
  techingStyleAvg?: number
  interactionAvg?: number
  totalScore?: number
  aiEvaluation?: string
}

interface TeacherEvaluationRequest {
  teacherId: number
  current?: number
  size?: number
}

function isSuccessResponse<T>(response: ApiResponse<T>) {
  if (response.success === true) return true
  if (response.success === false) return false

  return response.code === undefined || ['0', '200'].includes(`${response.code}`)
}

export async function fetchTeacherEvaluation(params: TeacherEvaluationRequest) {
  const response = await get<ApiResponse<TeacherEvaluationPageResult>>('/app/evaluation/pageList', {
    params: {
      teacherId: params.teacherId,
      current: params.current ?? 1,
      size: params.size ?? 10,
    },
  })

  if (!isSuccessResponse(response)) {
    throw new Error(response.message || '老师评价加载失败')
  }

  return response.data ?? {}
}
