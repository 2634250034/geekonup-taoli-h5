import { get, post } from '@/api/request'

interface ApiResponse<T> {
  success?: boolean
  code?: number | string
  message?: string
  data?: T
}

export type OrderType = 'FORMAL' | 'AUDITION'

export type OrderStatus = 'WAIT_PAY' | 'PAID' | 'CANCEL' | 'REFUND' | 'IN_EFFECT' | 'COMPLETED'

export type PayTeacherType = 'NORMAL' | 'GOLD'

export type PayTeacherEducation = 'JUNIOR_COLLEGE' | 'BACHELOR' | 'MASTER' | 'DOCTOR' | 'OTHER'

export interface OrderPayTeacher {
  teacherName?: string
  teacherCode?: string
  eduBack?: PayTeacherEducation
  school?: string
  tags?: string[]
  teacherType?: PayTeacherType
  teacherIntro?: string
  teacherAvatar?: string
}

export interface OrderPayInfo {
  orderCode?: string
  orderType?: OrderType
  orderStatus?: OrderStatus
  orderAmount?: number
  expireTime?: string
  subjectName?: string
  studentName?: string
  teachers?: OrderPayTeacher[]
  appointTime?: string
  classCount?: number
}

export interface AuditionReserveRequest {
  token: string
  teacherId: number
  appointTime: string
}

export interface AuditionReserveResult {
  needPay?: boolean
  orderCode?: string
  orderAmount?: number
  expireTime?: string
}

function isSuccessResponse<T>(response: ApiResponse<T>) {
  if (`${response.code}` === '200') return true
  if (response.success === false) return false

  return response.success === true && response.code === undefined
}

export async function fetchOrderPayInfo(orderCode: string) {
  const response = await get<ApiResponse<OrderPayInfo>>('/h5/pay/order', {
    params: {
      orderCode,
    },
  })

  if (!isSuccessResponse(response)) {
    throw new Error(response.message || '订单信息加载失败')
  }

  return response.data ?? {}
}

export async function reserveAudition(data: AuditionReserveRequest) {
  const response = await post<ApiResponse<AuditionReserveResult>>('/h5/audition/reserve', {
    data,
  })

  if (!isSuccessResponse(response)) {
    throw new Error(response.message || '预约提交失败')
  }

  return response.data ?? {}
}

export async function createH5Prepay(orderCode: string) {
  const response = await post<ApiResponse<Record<string, unknown>>>('/h5/pay/prepay', {
    params: {
      orderCode,
    },
  })

  if (!isSuccessResponse(response)) {
    throw new Error(response.message || '支付发起失败')
  }

  return response.data ?? {}
}
