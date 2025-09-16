import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../../../api/authApi';
import { Mail, Lock, Sparkles } from 'lucide-react';
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
      navigate('/');
    }
  }, [isSuccess]);

  return (
    <div className={css.container}>
      <div className={css.backdrop} />
      <div className={css.cardWrapper}>
        <div className={css.brand}>TechnoFrog <Sparkles size={16} /></div>
        <form className={css.form} onSubmit={handleSubmit}>
          <h1 className={css.title}>С возвращением</h1>
          <p className={css.subtitle}>Войди в аккаунт и продолжай работу</p>

          {isError && (
            <div className={css.error}>
              Неверный email или пароль
            </div>
          )}

          <div className={css.field}>
            <label htmlFor="email">Email</label>
            <div className={css.inputWrap}>
              <Mail size={16} className={css.inputIcon} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className={css.field}>
            <label htmlFor="password">Пароль</label>
            <div className={css.inputWrap}>
              <Lock size={16} className={css.inputIcon} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className={css.actionsRow}>
            <label className={css.checkbox}>
              <input type="checkbox" />
              <span>Запомнить меня</span>
            </label>
            <a className={css.link} href="#">Забыли пароль?</a>
          </div>

          <button type="submit" disabled={isLoading} className={css.submitBtn}>
            {isLoading ? 'Входим…' : 'Войти'}
          </button>

          <div className={css.footerNote}>
            Нет аккаунта? <a className={css.link} href="#">Зарегистрироваться</a>
          </div>
        </form>
      </div>
    </div>
  );
};
