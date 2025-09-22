import { baseApi } from './baseApi';
import type { GetActivitiesParams, GetActivitiesResponse } from '../types/activities.types';

export const activitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query<GetActivitiesResponse, GetActivitiesParams>({
      query: (params) => ({
        url: '/activities',
        params,
      }),
      providesTags: ['Activities'],
    }),
    markActivityAsRead: builder.mutation<{ message: string }, string>({
      query: (activityId) => ({
        url: `/activities/${activityId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Activities'],
    }),
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => '/activities/unread-count',
      providesTags: ['Activities'],
    }),
    markAllAsRead: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/activities/mark-all-read',
        method: 'PATCH',
      }),
      invalidatesTags: ['Activities'],
    }),
  }),
});

export const {
  useGetActivitiesQuery,
  useMarkActivityAsReadMutation,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
} = activitiesApi;