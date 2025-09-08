import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import css from './ProfilePage.module.css';

export const ProfilePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className={css.container}>
      <h1>Профиль пользователя</h1>
      {user && (
        <div className={css.info}>
          <p><strong>Имя:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Роли:</strong> {user.roles?.join(', ')}</p>
        </div>
      )}
    </div>
  );
};