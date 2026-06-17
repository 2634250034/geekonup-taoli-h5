import { get } from '@/api/request'

interface ApiResponse<T> {
  success?: boolean
  code?: number | string
  message?: string
  data?: T
}

export type OrderType = 'FORMAL' | 'AUDITION'

export type OrderStatus = 'WAIT_PAY' | 'PAID' | 'CANCEL' | 'REFUND' | 'IN_EFFECT' | 'COMPLETED'

export interface OrderPayInfo {
  orderCode?: string
  orderType?: OrderType
  orderStatus?: OrderStatus
  orderAmount?: number
  expireTime?: string
  subjectName?: string
  studentName?: string
  teacherName?: string
  teacherCode?: string
  appointTime?: string
  classCount?: number
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
