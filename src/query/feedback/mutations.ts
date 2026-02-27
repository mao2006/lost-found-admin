import { useMutation } from '@tanstack/react-query'
import { processFeedback } from '@/api/modules/feedback'

export function useProcessFeedbackMutation() {
  return useMutation({
    mutationFn: processFeedback,
  })
}
