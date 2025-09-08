import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../../../api/authApi';
import css from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, isError, isSuccess }] = useLoginMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password }).unwrap();

    } catch (err) {
      console.error('Ошибка входа:', err);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      navigate('/')
    }
  }, [isSuccess])

  return (
    <div className={css.container}>
      <form className={css.form} onSubmit={handleSubmit}>
        <h2>Вход в систему</h2>

        {isError && <div className={css.error}>Неверный логин или пароль, бро</div>}

        <div className={css.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Твоя почта"
          />
        </div>

        <div className={css.field}>
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Твой пароль"
          />
        </div>

        <button type="submit" disabled={isLoading} className={css.submitBtn}>
          {isLoading ? 'Вхожу...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};