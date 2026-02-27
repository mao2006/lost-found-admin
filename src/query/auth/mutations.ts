import { useMutation } from '@tanstack/react-query'
import { loginRequest, resetPasswordRequest } from '@/api/modules/auth'

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginRequest,
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPasswordRequest,
  })
}
