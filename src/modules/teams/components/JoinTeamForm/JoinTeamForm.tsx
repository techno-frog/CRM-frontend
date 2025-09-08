import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { UserPlus, UserCheck } from 'lucide-react';
import type { RootState } from '../../../../store/store';
import { setInviteCode } from '../../../../store/slices/createTeamSlice';
import css from '../../pages/CreateTeam/CreateTeam.module.css';

export const JoinTeamForm: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const inviteCode = useSelector((state: RootState) => state.createTeam.inviteCode);
  return (
    <div className={css.formContainer}>
      <div className={css.formHeader}>
        <div className={css.formIcon}>
          <UserPlus size={32} />
        </div>
        <h2>Присоединиться к команде</h2>
        <p>Введи код приглашения, который тебе прислали</p>
      </div>

      <div className={css.formContent}>
        <div className={css.inputGroup}>
          <label>Код приглашения</label>
          <input
            type="text"
            placeholder="Например: TEAM-ABC-123"
            value={inviteCode}
            onChange={(e) => dispatch(setInviteCode(e.target.value))}
            className={css.input}
            autoComplete="off"
          />
          <span className={css.inputHint}>Код должен содержать буквы и цифры</span>
        </div>

        <div className={css.actionButtons}>
          <button className={css.primaryBtn} disabled={!inviteCode.trim()}>
            <UserCheck size={20} />
            Присоединиться
          </button>
        </div>
      </div>
    </div>
  );
});
