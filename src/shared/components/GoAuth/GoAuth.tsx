import React from 'react';
import { Link } from 'react-router-dom';
import css from './GoAuth.module.css';

export const GoAuth: React.FC = () => {
  return (
    <div className={css.container}>
      <h2>Доступ запрещен</h2>
      <p>Эй, бро, тебе нужно залогиниться для доступа к этой странице</p>
      <Link to="/login" className={css.loginLink}>
        Перейти к авторизации
      </Link>
    </div>
  );
};