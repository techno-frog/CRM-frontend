import React, { useState, useEffect } from 'react';
import { X, Users, UserCheck, User } from 'lucide-react';
import css from './InviteModal.module.css';

interface InviteInfo {
  isValid: boolean;
  team: {
    id: string;
    name: string;
    description?: string;
  };
  invitedBy: {
    name: string;
    email: string;
  };
  activationsLeft: number;
  expiresAt?: string;
}

interface InviteModalProps {
  inviteCode: string;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  inviteCode,
  onAccept,
  onDecline,
  onClose
}) => {
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      fetchInviteInfo(inviteCode);
    }
  }, [inviteCode]);

  const fetchInviteInfo = async (code: string) => {
    setIsLoading(true);
    try {
      // TODO: Заменить на реальный API вызов
      // const result = await validateInvite({ inviteCode: code }).unwrap();

      // Временная имитация
      await new Promise(resolve => setTimeout(resolve, 500));

      // Мокаем данные приглашения
      const mockInviteInfo: InviteInfo = {
        isValid: true,
        team: {
          id: '1',
          name: 'Tech Startup Team',
          description: 'Команда разработчиков стартапа'
        },
        invitedBy: {
          name: 'Иван Петров',
          email: 'ivan@example.com'
        },
        activationsLeft: 5,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      setInviteInfo(mockInviteInfo);
    } catch (error) {
      console.error('Ошибка получения информации о приглашении:', error);
      setInviteInfo({
        isValid: false,
        team: { id: '', name: '' },
        invitedBy: { name: '', email: '' },
        activationsLeft: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      // TODO: Заменить на реальный API вызов для принятия приглашения
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAccept();
    } catch (error) {
      console.error('Ошибка принятия приглашения:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={css.overlay} onClick={handleBackdropClick}>
      <div className={css.modal}>
        <div className={css.header}>
          <button className={css.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className={css.loading}>
            <div className={css.spinner}></div>
            <p>Загружаем информацию о приглашении...</p>
          </div>
        ) : !inviteInfo?.isValid ? (
          <div className={css.content}>
            <div className={css.iconWrapper}>
              <X className={css.errorIcon} size={48} />
            </div>
            <h2 className={css.title}>Приглашение недействительно</h2>
            <p className={css.subtitle}>
              Код приглашения устарел или не существует
            </p>
            <div className={css.actions}>
              <button className={css.primaryBtn} onClick={onClose}>
                Понятно
              </button>
            </div>
          </div>
        ) : (
          <div className={css.content}>
            <div className={css.iconWrapper}>
              <Users className={css.inviteIcon} size={48} />
            </div>

            <h2 className={css.title}>Приглашение в команду</h2>
            <p className={css.subtitle}>
              {inviteInfo.invitedBy.name} приглашает вас присоединиться к команде
            </p>

            <div className={css.teamInfo}>
              <div className={css.teamHeader}>
                <div className={css.teamIcon}>
                  <Users size={24} />
                </div>
                <div className={css.teamDetails}>
                  <h3 className={css.teamName}>{inviteInfo.team.name}</h3>
                  {inviteInfo.team.description && (
                    <p className={css.teamDescription}>{inviteInfo.team.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={css.inviteDetails}>
              <div className={css.detailRow}>
                <User size={16} />
                <span>От: {inviteInfo.invitedBy.name}</span>
              </div>
              <div className={css.detailRow}>
                <UserCheck size={16} />
                <span>Осталось активаций: {inviteInfo.activationsLeft}</span>
              </div>
              {inviteInfo.expiresAt && (
                <div className={css.detailRow}>
                  <span>Действительно до: {new Date(inviteInfo.expiresAt).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>

            <div className={css.actions}>
              <button
                className={css.secondaryBtn}
                onClick={onDecline}
                disabled={isAccepting}
              >
                Отклонить
              </button>
              <button
                className={css.primaryBtn}
                onClick={handleAccept}
                disabled={isAccepting}
              >
                {isAccepting ? 'Присоединяемся...' : 'Присоединиться'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};