import { useMutation } from '@tanstack/react-query'
import { approveAnnouncement, publishAnnouncement } from '@/api/modules/announcement'

export function usePublishAnnouncementMutation() {
  return useMutation({
    mutationFn: publishAnnouncement,
  })
}

export function useApproveAnnouncementMutation() {
  return useMutation({
    mutationFn: approveAnnouncement,
  })
}
