import React from 'react';
import { useParams } from 'react-router-dom';
import css from './AccountDialogsPage.module.css';

export const AccountDialogsPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className={css.container}>
      <h1>Диалоги аккаунта #{id}</h1>
      <div className={css.dialogsList}>
        <p>Тут будут диалоги, бро</p>
      </div>
    </div>
  );
};
