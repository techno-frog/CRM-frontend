import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../../../../api/authApi';
import css from './RegisterPage.module.css';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [register, { isLoading, error }] = useRegisterMutation();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Неверный формат email';
    }

    // Password validation
    if (formData.password.length < 8) {
      errors.password = 'Пароль должен быть минимум 8 символов';
    } else if (formData.password.length > 32) {
      errors.password = 'Пароль не должен превышать 32 символа';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      errors.password = 'Пароль должен содержать заглавные и строчные буквы, цифры и спецсимволы';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    // Name validation
    if (formData.name.length < 2) {
      errors.name = 'Имя должно быть минимум 2 символа';
    } else if (formData.name.length > 50) {
      errors.name = 'Имя не должно превышать 50 символов';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      }).unwrap();
      navigate('/');
    } catch (err: any) {
      console.error('Ошибка регистрации:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку поля при изменении
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getErrorMessage = (): string | null => {
    if (!error) return null;

    if (typeof error === 'object' && error !== null && 'data' in error) {
      const data = (error as { data?: any }).data;
      if (data?.message) {
        if (
          data.message === 'User already exists' ||
          data.message === 'User with this email already exists'
        ) {
          return 'Пользователь с таким email уже существует';
        }
        return data.message;
      }
    }

    return 'Произошла ошибка при регистрации';
  };


  return (
    <div className={css.container}>
      <form className={css.form} onSubmit={handleSubmit}>
        <h2>Регистрация</h2>
        {getErrorMessage() && <div className={css.error}>{getErrorMessage()}</div>}

        <div className={css.field}>
          <label htmlFor="name">Имя</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Твое имя"
          />
          {validationErrors.name && <span className={css.fieldError}>{validationErrors.name}</span>}
        </div>

        <div className={css.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Твоя почта"
          />
          {validationErrors.email && <span className={css.fieldError}>{validationErrors.email}</span>}
        </div>

        <div className={css.field}>
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Придумай пароль"
          />
          {validationErrors.password && <span className={css.fieldError}>{validationErrors.password}</span>}
          <small className={css.hint}>
            Минимум 8 символов, должен содержать заглавные и строчные буквы, цифры и спецсимволы
          </small>
        </div>

        <div className={css.field}>
          <label htmlFor="confirmPassword">Подтвердите пароль</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Повтори пароль"
          />
          {validationErrors.confirmPassword && <span className={css.fieldError}>{validationErrors.confirmPassword}</span>}
        </div>

        <button type="submit" disabled={isLoading} className={css.submitBtn}>
          {isLoading ? 'Регистрирую...' : 'Зарегистрироваться'}
        </button>

        <div className={css.footer}>
          <p>Уже есть аккаунт? <Link to="/login">Войди</Link></p>
        </div>
      </form>
    </div>
  );
};