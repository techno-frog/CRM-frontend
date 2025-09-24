import type { Module } from '../../types/module.types';
import { Role } from '../../types/auth.types';
import { RolesPage } from './pages/RolesPage';
import { CreateRolePage } from './pages/CreateRolePage';
import { EditRolePage } from './pages/EditRolePage';
import { AssignRolePage } from './pages/AssignRolePage';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { GoAuth } from '../../shared/components/GoAuth/GoAuth';
import { FaUserShield } from 'react-icons/fa';
import { RolesWidget } from './components/RolesWidget';
import { BackToRoles } from './components/BackToRoles';


export const rolesModule: Module = {
  id: 'roles',
  widget: RolesWidget,
  routes: [
    {
      path: '/roles',
      component: RolesPage,
      props: {},
      title: 'Роли',
      layout: DashboardLayout,
      navigable: true,
      icon: FaUserShield,
      allowedRoles: ['algo'],
      unauthorizedComponent: GoAuth,
      subModules: [
        {
          path: '/roles/create',
          component: CreateRolePage,
          props: {},
          title: 'Создать роль',
          layout: DashboardLayout,
          navigable: false,
          icon: FaUserShield,
          allowedRoles: [Role.ADMIN],
          topWidget: BackToRoles,
        },
        {
          path: '/roles/edit/:id',
          component: EditRolePage,
          props: {},
          title: 'Редактировать роль',
          layout: DashboardLayout,
          navigable: false,
          icon: FaUserShield,
          allowedRoles: [Role.ADMIN],
          topWidget: BackToRoles,
        },
        {
          path: '/roles/assign',
          component: AssignRolePage,
          props: {},
          title: 'Назначить роль',
          layout: DashboardLayout,
          navigable: false,
          icon: FaUserShield,
          allowedRoles: [Role.ADMIN],
          topWidget: BackToRoles,
        }
      ]
    }
  ]
};