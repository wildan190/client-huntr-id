import { apiGet, apiPost } from "../client";

/**
 * Notifications API
 */

export const getNotifications = (userId: number, page: number = 1) =>
  apiGet(`/api/notifications?user_id=${userId}&page=${page}`);

export const markNotificationAsRead = (id: string, userId: number) =>
  apiPost(`/api/notifications/${id}/read`, { user_id: userId });

export const markAllNotificationsAsRead = (userId: number) =>
  apiPost(`/api/notifications/read-all`, { user_id: userId });
