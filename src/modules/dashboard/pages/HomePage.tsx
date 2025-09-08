import React from 'react';
import css from './HomePage.module.css';

export const HomePage: React.FC = () => {
  return (
    <div className={css.container}>
      <h1>Добро пожаловать, бро!</h1>
      <p>Это главная страница нашей крутой аппки</p>
    </div>
  );
};
