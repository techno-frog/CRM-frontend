import { baseApi } from './baseApi';
import type { User, AuthTokens } from '../types/auth.types';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface RegisterWithInviteRequest {
  email: string;
  username: string;
  password: string;
  name: string;
  inviteCode?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RegisterWithInviteResponse extends AuthResponse {
  user: User & {
    joinedTeam?: {
      id: string;
      name: string;
    };
    hasCompletedOnboarding: boolean;
  };
}

interface CheckAvailabilityRequest {
  username?: string;
  email?: string;
}

interface CheckAvailabilityResponse {
  username?: {
    available: boolean;
    message: string;
  };
  email?: {
    available: boolean;
    message: string;
  };
}

interface SendVerificationCodeRequest {
  email: string;
}

interface SendVerificationCodeResponse {
  message: string;
  email: string;
}

interface VerifyEmailCodeRequest {
  email: string;
  code: string;
}

interface VerifyEmailCodeResponse {
  message: string;
  verified: boolean;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),
    registerWithInvite: builder.mutation<RegisterWithInviteResponse, RegisterWithInviteRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query<User & { hasCompletedOnboarding: boolean }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    refreshTokens: builder.mutation<AuthTokens, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
    }),
    validateInvite: builder.mutation<any, { inviteCode: string }>({
      query: (data) => ({
        url: '/auth/validate-invite',
        method: 'POST',
        body: data,
      }),
    }),
    completeOnboarding: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/complete-onboarding',
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),
    skipOnboarding: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/skip-onboarding',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    checkAvailability: builder.mutation<CheckAvailabilityResponse, CheckAvailabilityRequest>({
      query: (data) => ({
        url: '/auth/check-availability',
        method: 'POST',
        body: data,
      }),
    }),
    sendVerificationCode: builder.mutation<SendVerificationCodeResponse, SendVerificationCodeRequest>({
      query: (data) => ({
        url: '/auth/send-verification-code',
        method: 'POST',
        body: data,
      }),
    }),
    verifyEmailCode: builder.mutation<VerifyEmailCodeResponse, VerifyEmailCodeRequest>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRegisterWithInviteMutation,
  useLogoutMutation,
  useGetMeQuery,
  useRefreshTokensMutation,
  useValidateInviteMutation,
  useCheckAvailabilityMutation,
  useSendVerificationCodeMutation,
  useVerifyEmailCodeMutation,
  useCompleteOnboardingMutation,
  useSkipOnboardingMutation,
} = authApi;