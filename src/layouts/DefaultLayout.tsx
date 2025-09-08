import React from 'react';
import { Outlet } from 'react-router-dom';
import css from './DefaultLayout.module.css';

export const DefaultLayout: React.FC = () => {
  return (
    <div className={css.container}>
      <main className={css.main}>
        <Outlet />
      </main>
      <footer className={css.footer}>
        <p>© 2024 TechnoFrog LLC, All rights reserved</p>
      </footer>
    </div>
  );
};