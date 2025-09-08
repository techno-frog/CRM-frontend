import type { Module } from '../../types/module.types';
import { HomePage } from './pages/HomePage';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { FaHome, FaUser } from 'react-icons/fa';
import { Role } from '../../types/auth.types';
import { ProfilePage } from './pages/ProfilePage';

export const dashboardModule: Module = {
  id: 'dashboard',
  routes: [
    {
      path: '/',
      component: HomePage,
      title: 'Главная',
      layout: DashboardLayout,
      navigable: true,
      icon: FaHome,
      // Публичный роут - allowedRoles не указан
    },
    {
      path: '/profile',
      component: ProfilePage,
      title: 'Профиль',
      layout: DashboardLayout,
      navigable: false,
      icon: FaUser,
      allowedRoles: [Role.USER, Role.ADMIN, Role.MODERATOR],
    }
  ]
};