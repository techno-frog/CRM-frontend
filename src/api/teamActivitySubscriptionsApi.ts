import { baseApi } from './baseApi';
import type {
  CreateTeamActivitySubscriptionDto,
  UpdateTeamActivitySubscriptionDto,
  GetTeamActivitySubscriptionResponseDto,
  GetTeamSubscribersResponseDto,
  TeamActivitySubscriptionStatsDto
} from '../types/team-activity-subscriptions.types';
import { TeamActivityType } from '../types/team-activities.types';

export const teamActivitySubscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Создать или обновить подписку пользователя
    createOrUpdateSubscription: builder.mutation<
      GetTeamActivitySubscriptionResponseDto,
      CreateTeamActivitySubscriptionDto
    >({
      query: (body) => ({
        url: '/team-activity-subscriptions',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: 'TeamActivitySubscriptions' as const, id: teamId },
        'TeamActivitySubscriptions'
      ],
    }),

    // Получить подписку пользователя для команды
    getUserSubscription: builder.query<
      GetTeamActivitySubscriptionResponseDto | null,
      { teamId: string }
    >({
      query: ({ teamId }) => `/team-activity-subscriptions/user/${teamId}`,
      providesTags: (_result, _error, { teamId }) => [
        { type: 'TeamActivitySubscriptions' as const, id: teamId },
        'TeamActivitySubscriptions'
      ],
    }),

    // Обновить подписку пользователя
    updateUserSubscription: builder.mutation<
      GetTeamActivitySubscriptionResponseDto,
      { teamId: string; data: UpdateTeamActivitySubscriptionDto }
    >({
      query: ({ teamId, data }) => ({
        url: `/team-activity-subscriptions/user/${teamId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: 'TeamActivitySubscriptions' as const, id: teamId },
        'TeamActivitySubscriptions'
      ],
    }),

    // Удалить подписку пользователя
    deleteUserSubscription: builder.mutation<void, { teamId: string }>({
      query: ({ teamId }) => ({
        url: `/team-activity-subscriptions/user/${teamId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: 'TeamActivitySubscriptions' as const, id: teamId },
        'TeamActivitySubscriptions'
      ],
    }),

    // Получить всех подписчиков команды (для админов)
    getTeamSubscribers: builder.query<GetTeamSubscribersResponseDto[], { teamId: string }>({
      query: ({ teamId }) => `/team-activity-subscriptions/team/${teamId}/subscribers`,
      providesTags: (_result, _error, { teamId }) => [
        { type: 'TeamActivitySubscriptions' as const, id: `${teamId}-subscribers` }
      ],
    }),

    // Получить подписчиков определенного типа активности
    getSubscribersForActivityType: builder.query<
      GetTeamSubscribersResponseDto[],
      { teamId: string; activityType: TeamActivityType }
    >({
      query: ({ teamId, activityType }) =>
        `/team-activity-subscriptions/team/${teamId}/subscribers/${activityType}`,
      providesTags: (_result, _error, { teamId, activityType }) => [
        { type: 'TeamActivitySubscriptions' as const, id: `${teamId}-${activityType}` }
      ],
    }),

    // Получить статистику подписок команды
    getTeamSubscriptionStats: builder.query<
      TeamActivitySubscriptionStatsDto,
      { teamId: string }
    >({
      query: ({ teamId }) => `/team-activity-subscriptions/team/${teamId}/stats`,
      providesTags: (_result, _error, { teamId }) => [
        { type: 'TeamActivitySubscriptions' as const, id: `${teamId}-stats` }
      ],
    }),
  }),
});

export const {
  useCreateOrUpdateSubscriptionMutation,
  useGetUserSubscriptionQuery,
  useUpdateUserSubscriptionMutation,
  useDeleteUserSubscriptionMutation,
  useGetTeamSubscribersQuery,
  useGetSubscribersForActivityTypeQuery,
  useGetTeamSubscriptionStatsQuery,
} = teamActivitySubscriptionsApi;