import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetMeQuery } from '../api/authApi';
import { setLoading } from '../store/slices/authSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  // Проверяем токены при загрузке приложения
  const { isLoading } = useGetMeQuery(undefined, {
    skip: !accessToken || !refreshToken,
  });

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      dispatch(setLoading(false));
    }
  }, [accessToken, refreshToken, dispatch]);

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  return <>{children}</>;
};