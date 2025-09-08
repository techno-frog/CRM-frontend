import React from 'react';
import { Link } from 'react-router-dom';
import css from './BackToRoles.module.css';

export const BackToRoles: React.FC = () => {
  return (
    <div className={css.container}>
      <Link to="/roles" className={css.backLink}>
        ← Назад к ролям
      </Link>
    </div>
  );
};