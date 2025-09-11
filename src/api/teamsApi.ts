import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';

export interface CreateTeamDto {
  title: string;
  company?: string;
  role: string
}

export interface Team {
  id: string,
  title: string
  members: string,
  deals: string,
  createdBy: string,
  company: string,
  isPublic: boolean,
}

export const teamsApi = createApi({
  reducerPath: 'teamsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/v0/teams',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Roles', 'UserRole'],
  endpoints: (builder) => ({
    createTeam: builder.mutation<Team, CreateTeamDto>({
      query: (body) => ({
        url: '/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
});

export const {
  useCreateTeamMutation
} = teamsApi;