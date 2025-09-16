import { fetchBaseQuery, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';
import { setCredentials, logout } from '../store/slices/authSlice';

// Общий промис для исключения конкурирующих обновлений токена
let refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

export const createBaseQueryWithReauth = (baseUrl: string) => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  // Отдельный baseQuery для рефреша с базовым API URL
  const refreshBaseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/v0',
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json');
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
          const rr = await refreshBaseQuery(
            { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
            api,
            extraOptions
          );
          if (rr.data) {
            const data = rr.data as any;
            api.dispatch(
              setCredentials({
                user: (api.getState() as RootState).auth.user!,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
              })
            );
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
        // Повторяем оригинальный запрос с обновленным accessToken
        result = await baseQuery(args, api, extraOptions);
      }
    }

    return result;
  };

  return baseQueryWithReauth;
};
