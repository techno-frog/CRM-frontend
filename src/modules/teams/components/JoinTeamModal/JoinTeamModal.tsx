import React, { useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { useJoinTeamMutation } from '../../../../api/teamsApi';
import { useNotify } from '../../../../hooks/useNotify';
import Modal from '../../../../shared/components/Modal/Modal';
import css from './JoinTeamModal.module.css';

interface JoinTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinTeamModal: React.FC<JoinTeamModalProps> = ({
  isOpen,
  onClose
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [joinTeam, { isLoading }] = useJoinTeamMutation();
  const { success, error } = useNotify();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!inviteCode.trim()) {
      errors.inviteCode = 'Введите код приглашения';
    } else if (inviteCode.trim().length < 4) {
      errors.inviteCode = 'Код приглашения слишком короткий';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInviteCode(value);
    if (validationErrors.inviteCode) {
      setValidationErrors(prev => ({ ...prev, inviteCode: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await joinTeam({ inviteCode: inviteCode.trim() }).unwrap();

      success({
        title: 'Успешно! 🎉',
        text: `Вы присоединились к команде "${result.team.title}"`
      });

      // Закрываем модалку и очищаем форму
      onClose();
      setInviteCode('');
      setValidationErrors({});
    } catch (err: any) {
      console.error('Join team error:', err);
      const errorMessage = typeof err?.data?.message === 'string'
        ? err.data.message
        : err?.message || 'Не удалось присоединиться к команде';

      error({
        title: 'Ошибка',
        text: errorMessage
      });
    }
  };

  const handleClose = () => {
    setInviteCode('');
    setValidationErrors({});
    onClose();
  };

  const footer = (
    <div className={css.actions}>
      <button
        type="button"
        onClick={handleClose}
        className={css.cancelBtn}
        disabled={isLoading}
      >
        Отмена
      </button>
      <button
        type="submit"
        form="join-team-form"
        className={css.submitBtn}
        disabled={!inviteCode.trim() || isLoading}
      >
        <UserCheck size={16} />
        {isLoading ? 'Присоединяемся...' : 'Присоединиться'}
      </button>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      title={
        <div className={css.titleSection}>
          <div className={css.iconWrapper}>
            <UserPlus size={24} />
          </div>
          Присоединиться к команде
        </div>
      }
      onClose={handleClose}
      footer={footer}
    >
      <p className={css.description}>
        Введите код приглашения, который вам прислали
      </p>

      <form id="join-team-form" onSubmit={handleSubmit} className={css.form}>
        <div className={css.inputGroup}>
          <label htmlFor="inviteCode" className={css.label}>
            Код приглашения
          </label>
          <input
            id="inviteCode"
            type="text"
            value={inviteCode}
            onChange={handleChange}
            placeholder="ER7K-BJN5"
            className={`${css.input} ${validationErrors.inviteCode ? css.inputError : ''}`}
            disabled={isLoading}
            autoComplete="off"
          />
          {validationErrors.inviteCode && (
            <span className={css.error}>{validationErrors.inviteCode}</span>
          )}
          <span className={css.hint}>
            Код должен содержать буквы и цифры
          </span>
        </div>
      </form>
    </Modal>
  );
};