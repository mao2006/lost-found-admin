import { useMutation } from '@tanstack/react-query'
import { updateSystemConfig } from '@/api/modules/system'

export function useUpdateSystemConfigMutation() {
  return useMutation({
    mutationFn: updateSystemConfig,
  })
}
