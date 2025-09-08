import type { Module } from '../../types/module.types';
import { Role } from '../../types/auth.types';
import { AccountsPage } from './pages/AccountsPage';
import { AccountDialogsPage } from './pages/AccountDialogsPage';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { GoAuth } from '../../shared/components/GoAuth/GoAuth';

import { FaKey } from 'react-icons/fa';
import { AccountsWidget } from './components/AccountWidget';
import { BackToAccounts } from './components/BackToAccount';

export const accountsModule: Module = {
  id: 'accounts',
  widget: AccountsWidget,
  routes: [
    {
      path: '/accounts',
      component: AccountsPage,
      props: {},
      title: 'Аккаунты',
      layout: DashboardLayout,
      navigable: true,
      icon: FaKey,
      allowedRoles: [Role.ADMIN],
      unauthorizedComponent: GoAuth,
      subModules: [
        {
          path: '/accounts/chats/:id',
          component: AccountDialogsPage,
          props: {},
          title: 'Диалоги аккаунта',
          layout: DashboardLayout,
          navigable: false,
          icon: FaKey,
          allowedRoles: [Role.ADMIN],
          topWidget: BackToAccounts,
        }
      ]
    }
  ]
};