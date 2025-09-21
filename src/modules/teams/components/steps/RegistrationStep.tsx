import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Sparkles, UserCheck, Check, Loader2 } from 'lucide-react';
import { useCheckAvailabilityMutation, useSendVerificationCodeMutation } from '../../../../api/authApi';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useNotify } from '../../../../hooks/useNotify';
import { setPendingRegistrationEmail, setPendingRegistrationData } from '../../../../store/slices/createTeamSlice';
import css from '../../pages/CreateTeam/CreateTeam.module.css';

interface RegistrationStepProps {
  onEmailVerificationRequired: () => void;
}

export const RegistrationStep: React.FC<RegistrationStepProps> = ({ onEmailVerificationRequired }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const inviteCodeFromUrl = searchParams.get('JoinInvite');

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [emailStatus, setEmailStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [nameValid, setNameValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);

  const debouncedUsername = useDebounce(formData.username, 500);
  const debouncedEmail = useDebounce(formData.email, 500);
  const { success, error } = useNotify();
  const [checkAvailability] = useCheckAvailabilityMutation();
  const [sendVerificationCode] = useSendVerificationCodeMutation();
  const [isRegistering, setIsRegistering] = useState(false);

  // Сохраняем invite code в localStorage если он есть в URL
  useEffect(() => {
    if (inviteCodeFromUrl) {
      localStorage.setItem('pendingInviteCode', inviteCodeFromUrl);
    }
  }, [inviteCodeFromUrl]);

  // Проверка доступности username с debounce
  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3) {
      // Проверяем формат username перед API запросом
      if (!/^[a-zA-Z0-9_-]+$/.test(debouncedUsername)) {
        setUsernameStatus('taken'); // Показываем как занятый если неверный формат
        return;
      }
      if (debouncedUsername.length > 20) {
        setUsernameStatus('taken');
        return;
      }
      checkUsernameAvailability(debouncedUsername);
    } else {
      setUsernameStatus(null);
    }
  }, [debouncedUsername]);

  // Проверка доступности email с debounce
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (debouncedEmail && emailRegex.test(debouncedEmail)) {
      // Email формат корректный, проверяем доступность
      checkEmailAvailability(debouncedEmail);
    } else {
      // Email формат некорректный или пустой
      setEmailStatus(null);
    }
  }, [debouncedEmail]);

  const checkUsernameAvailability = async (username: string) => {
    setUsernameStatus('checking');
    try {
      const response = await checkAvailability({ username }).unwrap();
      setUsernameStatus(response.username?.available ? 'available' : 'taken');
    } catch (error) {
      setUsernameStatus('taken');
    }
  };

  const checkEmailAvailability = async (email: string) => {
    setEmailStatus('checking');
    try {
      const response = await checkAvailability({ email }).unwrap();
      setEmailStatus(response.email?.available ? 'available' : 'taken');
    } catch (error) {
      setEmailStatus('taken');
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Неверный формат email';
    } else if (emailStatus === 'taken') {
      errors.email = 'Этот email уже занят';
    }

    if (formData.username.length < 3) {
      errors.username = 'Username должен быть минимум 3 символа';
    } else if (formData.username.length > 20) {
      errors.username = 'Username не должен превышать 20 символов';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Username может содержать только буквы, цифры, _ и -';
    } else if (usernameStatus === 'taken') {
      errors.username = 'Этот username уже занят';
    }

    if (formData.password.length < 8) {
      errors.password = 'Пароль должен быть минимум 8 символов';
    } else if (formData.password.length > 32) {
      errors.password = 'Пароль не должен превышать 32 символа';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      errors.password = 'Пароль должен содержать заглавные и строчные буквы, цифры и спецсимволы';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    if (formData.name.length < 2) {
      errors.name = 'Имя должно быть минимум 2 символа';
    } else if (formData.name.length > 50) {
      errors.name = 'Имя не должно превышать 50 символов';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Проверяем валидность полей в реальном времени
    if (name === 'name') {
      setNameValid(value.length >= 2 && value.length <= 50);
    } else if (name === 'password') {
      const isValid = value.length >= 8 && value.length <= 32 &&
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value);
      setPasswordValid(isValid);
      // Проверяем подтверждение пароля с новым значением пароля
      setConfirmPasswordValid(newFormData.confirmPassword === value && newFormData.confirmPassword !== '');
    } else if (name === 'confirmPassword') {
      setConfirmPasswordValid(value === newFormData.password && value !== '');
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || usernameStatus !== 'available' || emailStatus !== 'available') {
      error({ title: 'Ошибка валидации', text: 'Проверьте правильность заполнения всех полей' });
      return;
    }

    const inviteCode = localStorage.getItem('pendingInviteCode');
    setIsRegistering(true);

    try {
      // Сначала отправляем код подтверждения
      await sendVerificationCode({ email: formData.email }).unwrap();

      success({ title: 'Код отправлен! 📧', text: 'Проверьте вашу почту для получения кода подтверждения' });

      // Сохраняем email для верификации
      dispatch(setPendingRegistrationEmail(formData.email));

      // Сохраняем все данные регистрации для последующего использования
      dispatch(setPendingRegistrationData({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        name: formData.name,
        inviteCode
      }));

      // Переходим к шагу верификации email
      setTimeout(() => {
        onEmailVerificationRequired();
      }, 1000);
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      error({
        title: 'Ошибка регистрации',
        text: error?.data?.message || 'Не удалось зарегистрироваться. Попробуйте позже.'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const renderFieldStatus = (status: 'checking' | 'available' | 'taken' | null, field: string) => {
    if (!status) return null;

    switch (status) {
      case 'checking':
        return (
          <div className={css.fieldStatus}>
            <Loader2 size={16} className={css.spinIcon} />
            <span className={css.statusText}>Проверяем...</span>
          </div>
        );
      case 'available':
        return (
          <div className={css.fieldStatus}>
            <Check size={16} className={css.successIcon} />
            <span className={css.successText}>
              {field === 'username' ? 'Username доступен' : 'Email доступен'}
            </span>
          </div>
        );
      case 'taken':
        return (
          <div className={css.fieldStatus}>
            <span className={css.errorText}>
              {field === 'username' ? '✗ Username уже занят' : '✗ Email уже занят'}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={css.stepContainer}>
      <div className={css.header}>
        <div className={css.iconWrapper}>
          <Sparkles size={32} color="white" />
        </div>
        <h1 className={css.title}>
          {inviteCodeFromUrl ? 'Присоединиться к команде' : 'Добро пожаловать!'}
        </h1>
        <p className={css.subtitle}>
          {inviteCodeFromUrl
            ? 'Создайте аккаунт и присоединитесь к команде'
            : 'Создайте аккаунт, чтобы начать работу с платформой'
          }
        </p>
      </div>

      <form onSubmit={handleRegistration} className={css.form}>
        <div className={css.inputGroup}>
          <label htmlFor="name" className={css.label}>Имя</label>
          <div className={css.inputWrapper}>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ваше имя"
              required
              className={`${css.input} ${nameValid ? css.inputSuccess : ''}`}
            />
            {nameValid && (
              <Check size={20} className={css.inputIcon} />
            )}
          </div>
          {validationErrors.name && (
            <span className={css.error}>{validationErrors.name}</span>
          )}
        </div>

        <div className={css.inputGroup}>
          <label htmlFor="username" className={css.label}>Имя пользователя</label>
          <div className={css.inputWrapper}>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="username"
              required
              className={`${css.input} ${usernameStatus === 'available' ? css.inputSuccess : usernameStatus === 'taken' ? css.inputError : ''}`}
            />
            {usernameStatus === 'available' && (
              <Check size={20} className={css.inputIcon} />
            )}
          </div>
          {renderFieldStatus(usernameStatus, 'username')}
          {validationErrors.username && (
            <span className={css.error}>{validationErrors.username}</span>
          )}
        </div>

        <div className={css.inputGroup}>
          <label htmlFor="email" className={css.label}>Email</label>
          <div className={css.inputWrapper}>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ваш@email.com"
              required
              className={`${css.input} ${emailStatus === 'available' ? css.inputSuccess : emailStatus === 'taken' ? css.inputError : ''}`}
            />
            {emailStatus === 'available' && (
              <Check size={20} className={css.inputIcon} />
            )}
          </div>
          {renderFieldStatus(emailStatus, 'email')}
          {validationErrors.email && (
            <span className={css.error}>{validationErrors.email}</span>
          )}
        </div>

        <div className={css.inputGroup}>
          <label htmlFor="password" className={css.label}>Пароль</label>
          <div className={css.inputWrapper}>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Создайте надежный пароль"
              required
              className={`${css.input} ${passwordValid ? css.inputSuccess : ''}`}
            />
            {passwordValid && (
              <Check size={20} className={css.inputIcon} />
            )}
          </div>
          {validationErrors.password && (
            <span className={css.error}>{validationErrors.password}</span>
          )}
          <span className={css.hint}>
            Минимум 8 символов, должен содержать заглавные и строчные буквы, цифры и спецсимволы
          </span>
        </div>

        <div className={css.inputGroup}>
          <label htmlFor="confirmPassword" className={css.label}>Подтвердите пароль</label>
          <div className={css.inputWrapper}>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Повторите пароль"
              required
              className={`${css.input} ${confirmPasswordValid ? css.inputSuccess : ''}`}
            />
            {confirmPasswordValid && (
              <Check size={20} className={css.inputIcon} />
            )}
          </div>
          {validationErrors.confirmPassword && (
            <span className={css.error}>{validationErrors.confirmPassword}</span>
          )}
        </div>

        <div className={css.actionButtons}>
          <button
            type="submit"
            disabled={isRegistering || usernameStatus !== 'available' || emailStatus !== 'available'}
            className={css.primaryBtn}
          >
            <UserCheck size={20} />
            {isRegistering ? 'Регистрируем...' : (inviteCodeFromUrl ? 'Присоединиться' : 'Зарегистрироваться')}
          </button>
        </div>
      </form>
    </div>
  );
};