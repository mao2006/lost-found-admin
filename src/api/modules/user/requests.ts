import type { UserLoginRequest, UserLoginResponse, UserUpdatePasswordRequest, UserUpdatePasswordResponse } from './types'
import { request } from '@/api/core/request'

export function userLoginRequest(payload: UserLoginRequest): Promise<UserLoginResponse> {
  return request<UserLoginResponse>({
    data: payload,
    method: 'POST',
    url: '/user/login',
  })
}

export function userUpdatePasswordRequest(payload: UserUpdatePasswordRequest): Promise<UserUpdatePasswordResponse> {
  return request<UserUpdatePasswordResponse>({
    data: payload,
    method: 'POST',
    url: '/user/update',
  })
}
