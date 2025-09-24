import { baseApi } from './baseApi';
import type {
  CreateTeamActivityDto,
  UpdateTeamActivityDto,
  GetTeamActivitiesParams,
  GetTeamActivitiesResponse,
  TeamActivityResponseDto,
  TeamActivityStatsDto
} from '../types/team-activities.types';

export const teamActivitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get team activities with filters and pagination
    getTeamActivities: builder.query<GetTeamActivitiesResponse, GetTeamActivitiesParams>({
      query: ({ teamId, ...params }) => ({
        url: `/team-activities/team/${teamId}`,
        params,
      }),
      providesTags: (_result, _error, { teamId }) => [
        { type: 'TeamActivities' as const, id: teamId },
        'TeamActivities'
      ],
    }),

    // Get single team activity
    getTeamActivity: builder.query<TeamActivityResponseDto, { id: string; teamId: string }>({
      query: ({ id, teamId }) => `/team-activities/${id}/team/${teamId}`,
      providesTags: (_result, _error, { id, teamId }) => [
        { type: 'TeamActivities' as const, id },
        { type: 'TeamActivities' as const, id: teamId }
      ],
    }),

    // Create team activity
    createTeamActivity: builder.mutation<TeamActivityResponseDto, CreateTeamActivityDto>({
      query: (body) => ({
        url: '/team-activities',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: 'TeamActivities' as const, id: teamId },
        'TeamActivities'
      ],
    }),

    // Update team activity
    updateTeamActivity: builder.mutation<TeamActivityResponseDto, { id: string; teamId: string; data: UpdateTeamActivityDto }>({
      query: ({ id, teamId, data }) => ({
        url: `/team-activities/${id}/team/${teamId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id, teamId }) => [
        { type: 'TeamActivities' as const, id },
        { type: 'TeamActivities' as const, id: teamId },
        'TeamActivities'
      ],
    }),

    // Archive team activity
    archiveTeamActivity: builder.mutation<TeamActivityResponseDto, { id: string; teamId: string }>({
      query: ({ id, teamId }) => ({
        url: `/team-activities/${id}/team/${teamId}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { id, teamId }) => [
        { type: 'TeamActivities' as const, id },
        { type: 'TeamActivities' as const, id: teamId },
        'TeamActivities'
      ],
    }),

    // Delete team activity
    deleteTeamActivity: builder.mutation<void, { id: string; teamId: string }>({
      query: ({ id, teamId }) => ({
        url: `/team-activities/${id}/team/${teamId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id, teamId }) => [
        { type: 'TeamActivities' as const, id },
        { type: 'TeamActivities' as const, id: teamId },
        'TeamActivities'
      ],
    }),

    // Get team activity statistics
    getTeamActivityStats: builder.query<TeamActivityStatsDto, { teamId: string; startDate?: string; endDate?: string }>({
      query: ({ teamId, startDate, endDate }) => ({
        url: `/team-activities/team/${teamId}/stats`,
        params: { startDate, endDate },
      }),
      providesTags: (_result, _error, { teamId }) => [
        { type: 'TeamActivities' as const, id: `${teamId}-stats` }
      ],
    }),
  }),
});

export const {
  useGetTeamActivitiesQuery,
  useGetTeamActivityQuery,
  useCreateTeamActivityMutation,
  useUpdateTeamActivityMutation,
  useArchiveTeamActivityMutation,
  useDeleteTeamActivityMutation,
  useGetTeamActivityStatsQuery,
} = teamActivitiesApi;