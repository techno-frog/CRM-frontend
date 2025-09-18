import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithReauth } from './baseQueryWithReauth';

export interface Invite {
  _id: string;
  teamId: string;
  token: string;
  maxActivations: number;
  activationsUsed: number;
  email?: string;
  role?: string;
  note?: string;
  isPerpetual?: boolean;
  expiresAt?: string;
  revoked?: boolean;
  createdBy?: string | { _id: string; email: string; name?: string; id?: string };
  createdAt: string;
}

export interface CreateInviteLinkDto {
  teamId: string;
  maxActivations?: number;
  expiresAt?: string;
  role?: string;
  note?: string;
}

export interface SendInviteDto {
  teamId: string;
  email: string;
  maxActivations?: number;
  role?: string;
  note?: string;
}

export const invitesApi = createApi({
  reducerPath: 'invitesApi',
  baseQuery: createBaseQueryWithReauth('http://localhost:3000/v0/invites'),
  tagTypes: ['Invites'],
  endpoints: (builder) => ({
    getActiveInvites: builder.query<Invite[], string>({
      query: (teamId) => `/active/${teamId}`,
      providesTags: (_r, _e, teamId) => [{ type: 'Invites', id: teamId }],
    }),
    createInviteLink: builder.mutation<Invite, CreateInviteLinkDto>({
      query: (body) => ({ url: '/create-link', method: 'POST', body }),
      invalidatesTags: (_r, _e, { teamId }) => [{ type: 'Invites', id: teamId }],
    }),
    inviteUser: builder.mutation<{ status: 'ok' }, { teamId: string; userEmail: string; expiresAt?: string }>({
      query: (body) => ({ url: '/invite-user', method: 'POST', body }),
      invalidatesTags: (_r, _e, { teamId }) => [{ type: 'Invites', id: teamId }],
    }),
    sendInvite: builder.mutation<{ status: 'ok' }, SendInviteDto>({
      query: (body) => ({ url: '/send', method: 'POST', body }),
      invalidatesTags: (_r, _e, { teamId }) => [{ type: 'Invites', id: teamId }],
    }),
    revokeInvite: builder.mutation<{ status: 'ok' }, { id: string; teamId: string }>({
      query: ({ id }) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { teamId }) => [{ type: 'Invites', id: teamId }],
    }),
    updateInvite: builder.mutation<Invite, { id: string; teamId: string; maxActivations?: number; expiresAt?: string }>({
      query: ({ id, ...body }) => ({ url: `/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { teamId }) => [{ type: 'Invites', id: teamId }],
    }),
    searchUsers: builder.query<{ id: string; email: string; name?: string }[], string>({
      query: (q) => `/search-users?q=${encodeURIComponent(q)}`,
    }),
  }),
});

export const {
  useGetActiveInvitesQuery,
  useCreateInviteLinkMutation,
  useInviteUserMutation,
  useSendInviteMutation,
  useRevokeInviteMutation,
  useUpdateInviteMutation,
  useLazySearchUsersQuery,
} = invitesApi;
