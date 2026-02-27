import type { LoginRequest, LoginResponse, ResetPasswordRequest, ResetPasswordResponse } from './types'
import { RequestError } from '@/api/core/errors'
import { userLoginRequest, userUpdatePasswordRequest } from '@/api/modules/user'
import { toAdminRole } from '@/api/shared/transforms'

export function loginRequest(payload: LoginRequest): Promise<LoginResponse> {
  const uid = Number.parseInt(payload.employeeNo.trim(), 10)
  if (!Number.isInteger(uid)) {
    throw new RequestError('工号格式不正确')
  }

  return userLoginRequest({
    password: payload.password,
    uid,
  }).then((result) => {
    const role = toAdminRole(result.user_type)
    if (!role) {
      throw new RequestError('当前账号无管理端访问权限')
    }

    return {
      employeeNo: payload.employeeNo.trim(),
      needUpdatePassword: result.need_update,
      role,
      token: result.token,
      userId: result.id,
    }
  })
}

export function resetPasswordRequest(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  if (payload.newPassword !== payload.confirmPassword) {
    throw new RequestError('两次输入的密码不一致')
  }

  return userUpdatePasswordRequest({
    new_password: payload.newPassword,
    old_password: payload.oldPassword,
  })
}
