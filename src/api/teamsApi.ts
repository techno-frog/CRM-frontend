import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';
import { createBaseQueryWithReauth } from './baseQueryWithReauth';

export interface CreateTeamDto {
  title: string;
  company?: string;
  role: string
}

export interface Team {
  _id: string;
  id: string;
  title: string;
  isPublic: boolean;
  createdBy?: string;
  company?: string;
  members?: Array<{ _id?: string; id?: string; name: string; email: string }>;
  deals?: string[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const teamsApi = createApi({
  reducerPath: 'teamsApi',
  baseQuery: createBaseQueryWithReauth('http://localhost:3000/v0/teams'),
  tagTypes: ['teams', 'userTeams'],
  endpoints: (builder) => ({
    createTeam: builder.mutation<Team, CreateTeamDto>({
      query: (body) => ({
        url: '/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['teams'],
    }),
    getMyTeams: builder.query<Team[], void>({
      query: () => '/my',
      providesTags: ['teams']
    }),
    getTeam: builder.query<Team, string>({
      query: (id) => `/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'teams' as const, id }]
    }),
    getMyTeamsPaginated: builder.query<Paginated<Team>, { page: number; limit: number }>({
      query: ({ page, limit }) => `/my/paginated?page=${page}&limit=${limit}`,
      providesTags: ['teams', 'userTeams']
    }),

  }),
});

export const {
  useCreateTeamMutation,

  useGetMyTeamsQuery,
  useGetMyTeamsPaginatedQuery,
  useGetTeamQuery
} = teamsApi;
