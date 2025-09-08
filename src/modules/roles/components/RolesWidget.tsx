import React from 'react';
import { useGetRolesQuery } from '../../../api/rolesApi';
import css from './RolesWidget.module.css';

export const RolesWidget: React.FC = () => {
  const { data: roles, isLoading } = useGetRolesQuery(true);

  if (isLoading) {
    return (
      <div className={css.widget}>
        <h4>Роли</h4>
        <p>Загружаю...</p>
      </div>
    );
  }

  const activeRoles = roles?.filter(r => r.isActive).length || 0;
  const totalRoles = roles?.length || 0;

  return (
    <div className={css.widget}>
      <h4>Роли</h4>
      <p>Всего ролей: {totalRoles}</p>
      <p>Активных: {activeRoles}</p>
    </div>
  );
};