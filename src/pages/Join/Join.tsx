import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, UserPlus, X, Clock, User } from 'lucide-react';
import { useGetPublicInviteQuery, useAcceptInviteMutation } from '../../api/invitesApi';
import { useNotify } from '../../hooks/useNotify';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import css from './Join.module.css';

const Join: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useNotify();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // Debug auth state
  useEffect(() => {
    console.log('Auth state:', { accessToken, isAuthenticated });
  }, [accessToken, isAuthenticated]);

  const { data: invite, isLoading, error: inviteError } = useGetPublicInviteQuery(id!, {
    skip: !id,
  });

  // Debug: log the invite data
  useEffect(() => {
    if (invite) {
      console.log('Invite data:', invite);
    }
  }, [invite]);

  const [acceptInvite, { isLoading: accepting }] = useAcceptInviteMutation();

  useEffect(() => {
    if (!isAuthenticated && id) {
      // Store invite code in localStorage for registration flow
      localStorage.setItem('pendingInviteCode', id);
    }
  }, [isAuthenticated, id]);

  // Helper functions to handle both old and new API formats
  const getTeamTitle = (invite: any) => {
    return invite.team?.title || invite.teamName || 'Команда';
  };

  const getTeamDescription = (invite: any) => {
    return invite.team?.description || null;
  };

  const getInviterName = (invite: any) => {
    return invite.createdBy?.name || 'Пользователь команды';
  };

  const getInviterEmail = (invite: any) => {
    return invite.createdBy?.email || invite.email || 'unknown@technofrog.store';
  };

  const handleAccept = async () => {
    if (!id) return;

    console.log('handleAccept called, isAuthenticated:', isAuthenticated);

    // If user is not authenticated, redirect to registration with invite code
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to registration');
      localStorage.setItem('pendingInviteCode', id);
      navigate('/registration');
      return;
    }

    console.log('User authenticated, proceeding with invite acceptance');
    try {
      const result = await acceptInvite(id).unwrap();
      const teamTitle = result.team?.title || getTeamTitle(invite);
      success({
        title: 'Успешно! 🎉',
        text: `Вы присоединились к команде "${teamTitle}"`
      });
      navigate('/teams');
    } catch (err: any) {
      console.error('Accept invite error:', err);
      const errorMessage = err?.data?.message || err?.message || 'Не удалось принять приглашение';
      error({
        title: 'Ошибка',
        text: typeof errorMessage === 'string' ? errorMessage : 'Произошла ошибка при принятии приглашения'
      });
    }
  };

  const handleReject = () => {
    localStorage.removeItem('pendingInviteCode');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className={css.wrapper}>
        <div className={css.loading}>
          <div className={css.spinner}></div>
          <p>Загружаем приглашение...</p>
        </div>
      </div>
    );
  }

  if (inviteError || !invite) {
    return (
      <div className={css.wrapper}>
        <div className={css.error}>
          <X size={48} />
          <h2>Приглашение не найдено</h2>
          <p>Проверьте правильность ссылки или обратитесь к тому, кто отправил приглашение.</p>
          <Link to="/" className={css.homeBtn}>
            На главную
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={css.wrapper}>
        <div className={css.card}>
          <div className={css.header}>
            <div className={css.iconWrapper}>
              <UserPlus size={32} />
            </div>
            <h1>Приглашение в команду</h1>
            <p className={css.subtitle}>
              Вас пригласили присоединиться к команде "{getTeamTitle(invite)}"
            </p>
          </div>

          <div className={css.inviteInfo}>
            <div className={css.teamCard}>
              <div className={css.teamHeader}>
                <Users size={24} />
                <div>
                  <h3>{getTeamTitle(invite)}</h3>
                  {getTeamDescription(invite) && (
                    <p className={css.teamDescription}>{getTeamDescription(invite)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={css.inviterCard}>
              <User size={20} />
              <div>
                <span className={css.label}>Приглашение от:</span>
                <span className={css.inviterName}>{getInviterName(invite)}</span>
                <span className={css.inviterEmail}>({getInviterEmail(invite)})</span>
              </div>
            </div>

            <div className={css.roleCard}>
              <div className={css.roleInfo}>
                <span className={css.label}>Роль в команде:</span>
                <span className={css.role}>{invite.role}</span>
              </div>
            </div>

            {invite.note && (
              <div className={css.noteCard}>
                <span className={css.label}>Сообщение:</span>
                <p className={css.note}>{invite.note}</p>
              </div>
            )}

            {invite.expiresAt && (
              <div className={css.expiryCard}>
                <Clock size={16} />
                <span>Приглашение действует до: {new Date(invite.expiresAt).toLocaleDateString('ru-RU')}</span>
              </div>
            )}
          </div>

          <div className={css.authNotice}>
            <h3>Выберите действие</h3>
            <p>Для принятия приглашения нужно зарегистрироваться или войти в систему.</p>
            <div className={css.authActions}>
              <button
                onClick={handleAccept}
                className={css.registerBtn}
              >
                <UserPlus size={16} />
                Зарегистрироваться и присоединиться
              </button>
              <Link to="/login" className={css.loginBtn}>
                Уже есть аккаунт? Войти
              </Link>
            </div>
            <button
              onClick={handleReject}
              className={css.rejectSmallBtn}
            >
              Отклонить приглашение
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={css.wrapper}>
      <div className={css.card}>
        <div className={css.header}>
          <div className={css.iconWrapper}>
            <UserPlus size={32} />
          </div>
          <h1>Приглашение в команду</h1>
          <p className={css.subtitle}>
            Вас пригласили присоединиться к команде "{getTeamTitle(invite)}"
          </p>
        </div>

        <div className={css.inviteInfo}>
          <div className={css.teamCard}>
            <div className={css.teamHeader}>
              <Users size={24} />
              <div>
                <h3>{getTeamTitle(invite)}</h3>
                {getTeamDescription(invite) && (
                  <p className={css.teamDescription}>{getTeamDescription(invite)}</p>
                )}
              </div>
            </div>
          </div>

          <div className={css.inviterCard}>
            <User size={20} />
            <div>
              <span className={css.label}>Приглашение от:</span>
              <span className={css.inviterName}>{getInviterName(invite)}</span>
              <span className={css.inviterEmail}>({getInviterEmail(invite)})</span>
            </div>
          </div>

          <div className={css.roleCard}>
            <div className={css.roleInfo}>
              <span className={css.label}>Роль в команде:</span>
              <span className={css.role}>{invite.role}</span>
            </div>
          </div>

          {invite.note && (
            <div className={css.noteCard}>
              <span className={css.label}>Сообщение:</span>
              <p className={css.note}>{invite.note}</p>
            </div>
          )}

          {invite.expiresAt && (
            <div className={css.expiryCard}>
              <Clock size={16} />
              <span>Приглашение действует до: {new Date(invite.expiresAt).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
        </div>

        <div className={css.actions}>
          <button
            onClick={handleReject}
            className={css.rejectBtn}
            disabled={accepting}
          >
            Отклонить
          </button>
          <button
            onClick={handleAccept}
            className={css.acceptBtn}
            disabled={accepting}
          >
            <UserPlus size={16} />
            {accepting
              ? 'Присоединяемся...'
              : isAuthenticated
                ? 'Присоединиться'
                : 'Зарегистрироваться и присоединиться'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Join;