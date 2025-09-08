import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';

export enum ResourceType {
  COMPANY = 'company',
  TEAM = 'team',
  PRODUCT = 'product',
}

export enum Action {
  ALL = 'system',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  INVITE = 'invite',
  UPDATE_STOCK = 'update_stock',
  DISMISS = 'dismiss'
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  defaultActions: Action[];
  isActive: boolean;
  resourceType?: ResourceType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  defaultActions: Action[];
  resourceType?: ResourceType;
  isActive?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  defaultActions?: Action[];
  isActive?: boolean;
}

export interface AssignRoleDto {
  userId: string;
  roleId: string;
}

export interface AssignRoleToResourceDto {
  userId: string;
  roleId: string;
  resourceType: ResourceType;
  resourceId: string;
  additionalActions?: Action[];
}

export interface UserRole {
  _id: string;
  userId: string;
  roleId: Role | string;
  assignedBy?: string;
  assignedAt: string;
}

export interface Permission {
  _id: string;
  userId: string;
  roleId?: Role | string;
  resourceType: ResourceType;
  resourceId: string;
  actions: Action[];
  grantedAt: string;
  grantedBy?: string;
}

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/v0',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Role', 'UserRole', 'Permission'],
  endpoints: (builder) => ({
    // Роли
    getRoles: builder.query<Role[], boolean>({
      query: (activeOnly = true) => ({
        url: '/roles',
        params: { activeOnly }
      }),
      providesTags: ['Role'],
    }),

    getRoleById: builder.query<Role, string>({
      query: (id) => `/roles/${id}`,
      providesTags: (_, __, id) => [{ type: 'Role', id }],
    }),

    getResourceRoles: builder.query<Role[], ResourceType>({
      query: (resourceType) => `/roles/resource/${resourceType}`,
      providesTags: ['Role'],
    }),

    createRole: builder.mutation<Role, CreateRoleDto>({
      query: (body) => ({
        url: '/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Role'],
    }),

    updateRole: builder.mutation<Role, { id: string; body: UpdateRoleDto }>({
      query: ({ id, body }) => ({
        url: `/roles/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Role', id },
        'Role'
      ],
    }),

    deleteRole: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),

    // Назначение ролей
    assignRoleToUser: builder.mutation<UserRole, AssignRoleDto>({
      query: (body) => ({
        url: '/roles/assign',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UserRole'],
    }),

    assignRoleToResource: builder.mutation<Permission, AssignRoleToResourceDto>({
      query: (body) => ({
        url: '/roles/assign-resource',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Permission'],
    }),

    revokeRoleFromUser: builder.mutation<{ message: string }, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: `/roles/revoke/${userId}/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserRole'],
    }),

    getUserRoles: builder.query<UserRole[], string>({
      query: (userId) => `/roles/user/${userId}`,
      providesTags: ['UserRole'],
    }),

    // Разрешения
    getUserPermissions: builder.query<Permission[], string>({
      query: (userId) => `/permissions/user/${userId}`,
      providesTags: ['Permission'],
    }),

    grantPermission: builder.mutation<Permission, {
      userId: string;
      resourceType: ResourceType;
      resourceId: string;
      actions: Action[];
      roleId?: string;
    }>({
      query: (body) => ({
        url: '/permissions/grant',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Permission'],
    }),

    revokePermission: builder.mutation<void, {
      userId: string;
      resourceType: string;
      resourceId: string;
    }>({
      query: ({ userId, resourceType, resourceId }) => ({
        url: `/permissions/${userId}/${resourceType}/${resourceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permission'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useGetResourceRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRoleToUserMutation,
  useAssignRoleToResourceMutation,
  useRevokeRoleFromUserMutation,
  useGetUserRolesQuery,
  useGetUserPermissionsQuery,
  useGrantPermissionMutation,
  useRevokePermissionMutation,
} = rolesApi;