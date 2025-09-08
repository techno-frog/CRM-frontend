import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useRefreshTokensMutation } from '../api/authApi';
import { getTokenExpirationTime } from '../utils/authUtils';


export const useTokenRefresh = () => {
  const { accessToken, refreshToken } = useSelector((state: RootState) => state.auth);
  const [refreshTokens] = useRefreshTokensMutation()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (!accessToken || !refreshToken) {
      return;
    }

    const expirationTime = getTokenExpirationTime(accessToken);
    if (!expirationTime) {
      return;
    }

    // Обновляем токен за 1 минуту до истечения
    const timeUntilRefresh = expirationTime - Date.now() - 60000;

    if (timeUntilRefresh > 0) {
      timeoutRef.current = setTimeout(async () => {
        try {
          await refreshTokens({ refreshToken }).unwrap();
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }, timeUntilRefresh);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [accessToken, refreshToken, refreshTokens]);
};