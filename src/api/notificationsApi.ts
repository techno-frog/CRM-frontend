import { baseApi } from './baseApi';

export interface SendTestInviteResponse {
  message: string;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendTestInvite: builder.mutation<SendTestInviteResponse, string>({
      query: (userId) => ({
        url: `/notifications/test-invite/${userId}`,
        method: 'POST',
      }),
    }),
    sendTestNotification: builder.mutation<SendTestInviteResponse, string>({
      query: (userId) => ({
        url: `/notifications/test/${userId}`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useSendTestInviteMutation,
  useSendTestNotificationMutation,
} = notificationsApi;