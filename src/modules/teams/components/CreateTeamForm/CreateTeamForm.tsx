import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Plus } from 'lucide-react';
import type { RootState } from '../../../../store/store';
import {
  setTeamName,
  setUserRole,
} from '../../../../store/slices/createTeamSlice';
import css from '../../pages/CreateTeam/CreateTeam.module.css';
import { useCreateTeamMutation } from '../../../../api/teamsApi';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '../../../../hooks/useNotify';
import { extractErrorMessage } from '../../../../utils/extractErrorMessage';

export const CreateTeamForm: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const { teamName, userRole } = useSelector((state: RootState) => state.createTeam);
  const [create, { isLoading }] = useCreateTeamMutation()
  const { success, error: notifyError } = useNotify();

  const handleCreate = async () => {
    try {
      const created = await create({
        title: teamName,
        role: userRole
      }).unwrap();
      const redirectId = (created as any).id || (created as any)._id;
      success({ title: 'Команда готова', text: 'Можно приглашать коллег' });
      if (redirectId) navigate('/team/' + redirectId);
    } catch (err) {
      console.error('Ошибка создания команды:', err);
      notifyError({ title: 'Не удалось создать команду', text: extractErrorMessage(err, 'Попробуй ещё раз') });
    }
  }

  return (
    <div className={css.formContainer}>
      <div className={css.formHeader}>
        <div className={css.formIcon}>
          <Plus size={32} />
        </div>
        <h2>Создать команду</h2>
        <p>Настрой свою команду и пригласи участников</p>
      </div>

      <div className={css.formContent}>
        <div className={css.formGrid}>
          <div className={css.inputGroup}>
            <label>Название команды</label>
            <input
              type="text"
              placeholder="Моя крутая команда"
              value={teamName}
              onChange={(e) => dispatch(setTeamName(e.target.value))}
              className={css.input}
              autoComplete="off"
            />
          </div>

          <div className={css.inputGroup}>
            <label>Твоя роль в команде</label>
            <select
              value={userRole}
              onChange={(e) => dispatch(setUserRole(e.target.value))}
              className={css.select}
            >
              <option value="">Выбери роль</option>
              <option value="founder">Основатель</option>
              <option value="ceo">CEO</option>
              <option value="cto">CTO</option>
              <option value="manager">Менеджер</option>
              <option value="developer">Разработчик</option>
              <option value="designer">Дизайнер</option>
            </select>
          </div>
        </div>

        {/* <div className={css.inviteSection}>
          <h3>Пригласить участников</h3>
          <div className={css.inviteList}>
            {teamInvites.map((invite) => (
              <div key={invite.id} className={css.inviteItem}>
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="email@example.com"
                  className={css.inviteInput}
                  value={invite.email}
                  onChange={(e) => dispatch(updateTeamInvite({ id: invite.id, email: e.target.value }))}
                  autoComplete="off"
                />
                {teamInvites.length > 1 && (
                  <button
                    className={css.removeBtn}
                    onClick={() => dispatch(removeTeamInvite(invite.id))}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            className={css.addMoreBtn}
            onClick={() => dispatch(addTeamInvite())}
            type="button"
          >
            + Добавить еще
          </button>
        </div> */}

        <div className={css.actionButtons}>
          <button
            onClick={handleCreate}
            className={css.primaryBtn}
            disabled={!teamName.trim() || !userRole || isLoading}
          >
            <Users size={20} />
            {isLoading ? 'Создаём…' : 'Создать команду'}
          </button>
        </div>
      </div>
    </div>
  );
};
