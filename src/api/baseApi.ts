import { createApi, fetchBaseQuery, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';
import { setCredentials, logout } from '../store/slices/authSlice';

let refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/v0',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const shouldRefresh = result.error && (result.error.status === 401 || result.error.status === 403);
  if (shouldRefresh) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    if (!refreshPromise) {
      refreshPromise = (async () => {
        const rr = await baseQuery({ url: '/auth/refresh', method: 'POST', body: { refreshToken } }, api, extraOptions);
        if (rr.data) {
          const data = rr.data as any;
          api.dispatch(setCredentials({ user: (api.getState() as RootState).auth.user!, accessToken: data.accessToken, refreshToken: data.refreshToken }));
          return { accessToken: data.accessToken, refreshToken: data.refreshToken };
        }
        api.dispatch(logout());
        return null;
      })();
    }

    const refreshed = await refreshPromise.finally(() => {
      refreshPromise = null;
    });
    if (refreshed) {
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Auth', 'Activities'],
  endpoints: () => ({}),
});
