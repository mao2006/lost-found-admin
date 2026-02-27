import type {
  AnnouncementListRequest,
  AnnouncementListResponse,
  ApproveAnnouncementRequest,
  PublishAnnouncementRequest,
  PublishAnnouncementResponse,
} from './types'
import { request } from '@/api/core/request'

export function getAnnouncementList(params: AnnouncementListRequest = {}) {
  return request<AnnouncementListResponse>({
    method: 'GET',
    params,
    url: '/announcement/list',
  })
}

export function getAnnouncementReviewList(params: AnnouncementListRequest = {}) {
  return request<AnnouncementListResponse>({
    method: 'GET',
    params,
    url: '/announcement/review-list',
  })
}

export function publishAnnouncement(payload: PublishAnnouncementRequest) {
  return request<PublishAnnouncementResponse>({
    data: payload,
    method: 'POST',
    url: '/announcement/publish',
  })
}

export function approveAnnouncement(payload: ApproveAnnouncementRequest) {
  return request<Record<string, never>>({
    data: payload,
    method: 'POST',
    url: '/announcement/approve',
  })
}
