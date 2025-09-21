import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, Users, User, Clock, UserPlus, X, CheckCircle } from 'lucide-react';
import { useNotify } from '../../../../hooks/useNotify';
import { useVerifyEmailCodeMutation, useSendVerificationCodeMutation, useRegisterWithInviteMutation } from '../../../../api/authApi';
import { useGetPublicInviteQuery, useAcceptInviteMutation } from '../../../../api/invitesApi';
import { setPendingRegistrationData } from '../../../../store/slices/createTeamSlice';
import { setCredentials } from '../../../../store/slices/authSlice';
import type { RootState } from '../../../../store/store';
import css from '../../pages/CreateTeam/CreateTeam.module.css';

interface EmailVerificationStepProps {
  email: string;
  onVerificationComplete: () => void;
  onBack: () => void;
}

// Helper functions to handle both old and new API formats
const getTeamTitle = (invite: any) => {
  return invite?.team?.title || invite?.teamName || 'Команда';
};

const getTeamDescription = (invite: any) => {
  return invite?.team?.description || null;
};

const getInviterName = (invite: any) => {
  return invite?.createdBy?.name || 'Пользователь команды';
};

const getInviterEmail = (invite: any) => {
  return invite?.createdBy?.email || invite?.email || 'unknown@technofrog.store';
};

export const EmailVerificationStep: React.FC<EmailVerificationStepProps> = ({
  email,
  onVerificationComplete,
  onBack
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pendingRegistrationData = useSelector((state: RootState) => state.createTeam.pendingRegistrationData);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [inviteDecision, setInviteDecision] = useState<'accept' | 'reject' | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  // Check for pending invite
  const pendingInviteCode = localStorage.getItem('pendingInviteCode');
  const { data: inviteData } = useGetPublicInviteQuery(pendingInviteCode!, {
    skip: !pendingInviteCode,
  });
  const [acceptInvite] = useAcceptInviteMutation();
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { success, error } = useNotify();
  const [verifyEmailCode] = useVerifyEmailCodeMutation();
  const [sendVerificationCode] = useSendVerificationCodeMutation();
  const [registerWithInvite] = useRegisterWithInviteMutation();

  // Таймер для повторной отправки
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Автофокус на первое поле при загрузке
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Только цифры

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Автоматический переход на следующее поле
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Автоматическая отправка при заполнении всех полей
    if (newCode.every(digit => digit !== '') && !isLoading) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Переход на предыдущее поле при Backspace
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];

    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }

    setCode(newCode);

    // Фокус на последнее заполненное поле
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();

    // Автоматическая отправка если все поля заполнены
    if (pastedData.length === 6) {
      verifyCode(pastedData);
    }
  };


  const verifyCode = async (codeString: string) => {
    setIsLoading(true);
    try {
      // Первый этап: проверка email кода
      await verifyEmailCode({ email, code: codeString }).unwrap();

      // Показываем анимированную галочку
      setEmailVerified(true);
      setIsLoading(false);

      // Если есть приглашение и пользователь еще не принял решение, показываем приглашение
      if (inviteData && inviteDecision === null) {
        return; // Ждем решения пользователя
      }

      // Второй этап: если email подтвержден, выполняем регистрацию
      if (pendingRegistrationData) {
        const registrationResponse = await registerWithInvite(pendingRegistrationData).unwrap();

        // Сохраняем токены аутентификации
        dispatch(setCredentials({
          user: registrationResponse.user,
          accessToken: registrationResponse.accessToken,
          refreshToken: registrationResponse.refreshToken
        }));

        // Очищаем pending data
        dispatch(setPendingRegistrationData(null));

        // Очищаем invite code если он был
        localStorage.removeItem('pendingInviteCode');

        success({ title: 'Регистрация завершена! 🎉', text: 'Добро пожаловать в TechnoFrog CRM!' });

        // Если пользователь присоединился к команде по инвайту, перенаправляем в дашборд
        if (registrationResponse.user.joinedTeam) {
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          // Иначе продолжаем с созданием команды
          setTimeout(() => {
            onVerificationComplete();
          }, 1000);
        }
      } else {
        error({ title: 'Ошибка', text: 'Данные регистрации не найдены' });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = typeof err?.data?.message === 'string'
        ? err.data.message
        : err?.message || 'Проверьте правильность введенного кода';

      error({
        title: 'Ошибка',
        text: errorMessage
      });
      setCode(['', '', '', '', '', '']);
      setEmailVerified(false); // Сбрасываем состояние верификации при ошибке
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setIsResending(true);
    try {
      await sendVerificationCode({ email }).unwrap();

      success({ title: 'Код отправлен', text: 'Новый код отправлен на вашу почту' });
      setTimeLeft(60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      setEmailVerified(false); // Сбрасываем состояние верификации при новой отправке
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      error({
        title: 'Ошибка',
        text: err?.data?.message || 'Не удалось отправить код. Попробуйте позже.'
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleInviteDecision = (decision: 'accept' | 'reject') => {
    setInviteDecision(decision);
    if (decision === 'reject') {
      localStorage.removeItem('pendingInviteCode');
    }
  };

  const continueAfterInviteDecision = async () => {
    if (!pendingRegistrationData) return;

    setIsLoading(true);
    try {
      // Выполняем регистрацию ПЕРВЫМ делом
      const registrationResponse = await registerWithInvite(pendingRegistrationData).unwrap();

      // Сохраняем токены аутентификации
      dispatch(setCredentials({
        user: registrationResponse.user,
        accessToken: registrationResponse.accessToken,
        refreshToken: registrationResponse.refreshToken
      }));

      // ПОСЛЕ аутентификации принимаем приглашение, если пользователь выбрал принять
      if (inviteDecision === 'accept' && pendingInviteCode) {
        try {
          await acceptInvite(pendingInviteCode).unwrap();
          success({
            title: 'Успешно! 🎉',
            text: `Вы зарегистрированы и присоединились к команде "${getTeamTitle(inviteData)}"`
          });
        } catch (inviteErr: any) {
          console.error('Failed to accept invite after registration:', inviteErr);
          // Регистрация прошла успешно, но не удалось принять приглашение
          success({ title: 'Регистрация завершена! 🎉', text: 'Добро пожаловать в TechnoFrog CRM!' });
          error({
            title: 'Ошибка приглашения',
            text: 'Регистрация прошла успешно, но не удалось принять приглашение'
          });
        }
      } else {
        success({ title: 'Регистрация завершена! 🎉', text: 'Добро пожаловать в TechnoFrog CRM!' });
      }

      // Очищаем pending data
      dispatch(setPendingRegistrationData(null));
      localStorage.removeItem('pendingInviteCode');

      // Перенаправляем
      if (inviteDecision === 'accept') {
        setTimeout(() => navigate('/teams'), 1500);
      } else {
        setTimeout(() => onVerificationComplete(), 1000);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = typeof err?.data?.message === 'string'
        ? err.data.message
        : typeof err?.message === 'string'
          ? err.message
          : 'Произошла ошибка при регистрации';
      error({
        title: 'Ошибка',
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={css.stepContainer}>
      <button className={css.backBtn} onClick={onBack}>
        <ArrowLeft size={20} />
        Назад
      </button>

      {!emailVerified && <div className={css.header}>
        <div className={css.iconWrapper}>
          <Mail size={32} color="white" />
        </div>
        <h1 className={css.title}>Подтвердите email</h1>
        <p className={css.subtitle}>
          Мы отправили 6-значный код на <strong>{email}</strong>
        </p>
      </div>}

      <div className={css.verificationForm}>

        {!emailVerified && <div className={css.codeInputs} onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInputChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className={css.codeInput}
              disabled={isLoading}
            />
          ))}
        </div>}

        {isLoading && (
          <div className={css.loadingState}>
            <div className={css.spinner}></div>
            <span>Проверяем код...</span>
          </div>
        )}

        {emailVerified && (
          <div className={css.verificationSuccess}>
            <div className={css.checkmarkWrapper}>
              <CheckCircle size={48} className={css.checkmarkIcon} />
            </div>
            <div className={css.successMessage}>
              <h3>Email успешно подтвержден!</h3>
              <p>Теперь можно продолжить регистрацию</p>
            </div>
          </div>
        )}

        {!emailVerified && <div className={css.resendSection}>
          {!canResend ? (
            <p className={css.timerText}>
              Повторная отправка через {timeLeft} сек
            </p>
          ) : (
            <button
              type="button"
              onClick={resendCode}
              disabled={isResending}
              className={css.resendBtn}
            >
              <RefreshCw size={16} className={isResending ? css.spinning : ''} />
              {isResending ? 'Отправляем...' : 'Отправить код еще раз'}
            </button>
          )}
        </div>}

        {!emailVerified && <div className={css.helpText}>
          <p>Не получили код? Проверьте папку "Спам" или попробуйте отправить еще раз</p>
        </div>}
      </div>

      {/* Show invite information if there's a pending invite and email is verified */}
      {inviteData && inviteDecision === null && !isLoading && code.every(digit => digit !== '') && (
        <div className={css.inviteSection}>
          <div className={css.inviteHeader}>
            <div className={css.inviteIcon}>
              <UserPlus size={32} />
            </div>
            <h2>Приглашение в команду</h2>
            <p>Email подтвержден! Теперь решите, хотите ли вы присоединиться к команде.</p>
          </div>

          <div className={css.inviteCard}>
            <div className={css.teamInfo}>
              <div className={css.teamHeader}>
                <Users size={24} />
                <div>
                  <h3>{getTeamTitle(inviteData)}</h3>
                  {getTeamDescription(inviteData) && (
                    <p className={css.teamDescription}>{getTeamDescription(inviteData)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={css.inviteDetails}>
              <div className={css.inviterInfo}>
                <User size={20} />
                <div>
                  <span className={css.label}>Приглашение от:</span>
                  <span className={css.inviterName}>{getInviterName(inviteData)}</span>
                  <span className={css.inviterEmail}>({getInviterEmail(inviteData)})</span>
                </div>
              </div>

              <div className={css.roleInfo}>
                <span className={css.label}>Роль в команде:</span>
                <span className={css.role}>{inviteData.role}</span>
              </div>

              {inviteData.note && (
                <div className={css.noteInfo}>
                  <span className={css.label}>Сообщение:</span>
                  <p className={css.note}>{inviteData.note}</p>
                </div>
              )}

              {inviteData.expiresAt && (
                <div className={css.expiryInfo}>
                  <Clock size={16} />
                  <span>Действует до: {new Date(inviteData.expiresAt).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>

            <div className={css.inviteActions}>
              <button
                onClick={() => handleInviteDecision('reject')}
                className={css.rejectBtn}
                disabled={isLoading}
              >
                <X size={16} />
                Отклонить
              </button>
              <button
                onClick={() => handleInviteDecision('accept')}
                className={css.acceptBtn}
                disabled={isLoading}
              >
                <UserPlus size={16} />
                Присоединиться
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show continue button after invite decision */}
      {inviteData && inviteDecision !== null && (
        <div className={css.continueSection}>
          <div className={css.decisionStatus}>
            {inviteDecision === 'accept' ? (
              <div className={css.acceptedStatus}>
                <UserPlus size={24} />
                <span>Вы решили присоединиться к команде "{getTeamTitle(inviteData)}"</span>
              </div>
            ) : (
              <div className={css.rejectedStatus}>
                <X size={24} />
                <span>Вы отклонили приглашение</span>
              </div>
            )}
          </div>
          <button
            onClick={continueAfterInviteDecision}
            className={css.continueBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Завершаем регистрацию...' : 'Завершить регистрацию'}
          </button>
        </div>
      )}
    </div>
  );
};