import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetMeQuery } from '../api/authApi';
import { Role } from '../types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  unauthorizedComponent?: React.ComponentType;
  unauthorizedRedirect?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  unauthorizedComponent: UnauthorizedComponent,
  unauthorizedRedirect = '/login',
}) => {
  const isPublic = !allowedRoles.length;
  const { data: user, isLoading, isError, isSuccess } = useGetMeQuery();

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/login')
  }

  useEffect(() => {
    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  })

  useEffect(() => {
    if (user) {
      if (!user.teams) {
        // navigate('/createTeam')
      }
    }
  }, [isSuccess])

  useEffect(() => {
    if (!isPublic && !isLoading && (isError || !user)) {
      if (!UnauthorizedComponent) {
        navigate(unauthorizedRedirect, {
          replace: true,
          state: { from: location },
        });
      }
    }
  }, [
    isPublic,
    isError,
    isLoading,
    user,
    navigate,
    unauthorizedRedirect,
    location,
    UnauthorizedComponent,
  ]);

  // Публичный маршрут — показываем без проверки
  if (isPublic) {
    return <>{children}</>;
  }

  // Приватный маршрут — лоадер во время запроса
  if (isLoading) {
    return <div>Загружаю, бро...</div>;
  }

  // Нет пользователя или ошибка
  if (isError || !user) {
    return UnauthorizedComponent ? <UnauthorizedComponent /> : null;
  }

  // Проверка роли
  const hasRequiredRole =
    user.roles?.some((role) => allowedRoles.includes(role)) ?? false;
  if (!hasRequiredRole) {
    return UnauthorizedComponent ? <UnauthorizedComponent /> : null;
  }

  return <>{children}</>;
};
