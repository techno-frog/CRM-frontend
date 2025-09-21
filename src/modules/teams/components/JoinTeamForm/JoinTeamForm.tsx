import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck } from 'lucide-react';
import { useJoinTeamMutation } from '../../../../api/teamsApi';
import { useNotify } from '../../../../hooks/useNotify';
import css from '../../pages/CreateTeam/CreateTeam.module.css';

export const JoinTeamForm: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [joinTeam, { isLoading }] = useJoinTeamMutation();
  const { success, error } = useNotify();

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      error({ title: 'Ошибка', text: 'Введите код приглашения' });
      return;
    }

    try {
      const result = await joinTeam({ inviteCode: inviteCode.trim() }).unwrap();

      success({
        title: 'Успешно! 🎉',
        text: `Вы присоединились к команде "${result.team.title}"`
      });

      // Перенаправляем в дашборд
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
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

  return (
    <div className={css.formContainer}>
      <div className={css.formHeader}>
        <div className={css.formIcon}>
          <UserPlus size={32} />
        </div>
        <h2>Присоединиться к команде</h2>
        <p>Введи код приглашения, который тебе прислали</p>
      </div>

      <form onSubmit={handleJoinTeam} className={css.formContent}>
        <div className={css.inputGroup}>
          <label>Код приглашения</label>
          <input
            type="text"
            placeholder="ER7K-BJN5"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className={css.input}
            autoComplete="off"
            disabled={isLoading}
          />
          <span className={css.inputHint}>Код должен содержать буквы и цифры</span>
        </div>

        <div className={css.actionButtons}>
          <button
            type="submit"
            className={css.primaryBtn}
            disabled={!inviteCode.trim() || isLoading}
          >
            <UserCheck size={20} />
            {isLoading ? 'Присоединяемся...' : 'Присоединиться'}
          </button>
        </div>
      </form>
    </div>
  );
});
