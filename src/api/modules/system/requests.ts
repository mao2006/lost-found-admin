import type { SystemConfig, UpdateSystemConfigRequest } from './types'
import { request } from '@/api/core/request'

export function getSystemConfig() {
  return request<SystemConfig>({
    method: 'GET',
    url: '/system/config',
  })
}

export function updateSystemConfig(payload: UpdateSystemConfigRequest) {
  return request<Record<string, never>>({
    data: payload,
    method: 'POST',
    url: '/system/config',
  })
}
