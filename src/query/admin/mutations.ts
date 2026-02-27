import { useMutation } from '@tanstack/react-query'
import { approveAdminPost, archiveAdminPost, claimAdminPost, deleteAdminPost, rejectAdminPost } from '@/api/modules/admin'

export function useApproveAdminPostMutation() {
  return useMutation({
    mutationFn: approveAdminPost,
  })
}

export function useRejectAdminPostMutation() {
  return useMutation({
    mutationFn: rejectAdminPost,
  })
}

export function useClaimAdminPostMutation() {
  return useMutation({
    mutationFn: claimAdminPost,
  })
}

export function useArchiveAdminPostMutation() {
  return useMutation({
    mutationFn: archiveAdminPost,
  })
}

export function useDeleteAdminPostMutation() {
  return useMutation({
    mutationFn: deleteAdminPost,
  })
}
