import type { FC } from 'react';
import type { Team } from '../../../../api/teamsApi';
import css from './TeamList.module.css';
import { useNavigate } from 'react-router-dom';

interface TeamListProps {
  items: Team[] | undefined;
  loading?: boolean;
}

const TeamList: FC<TeamListProps> = ({ items = [], loading }) => {
  const navigate = useNavigate();
  if (loading) {
    return <div>Загрузка команд...</div>;
  }
  if (!items || items.length === 0) {
    return <div>Команды не найдены</div>;
  }
  return (
    <div className={css.list}>
      {items.map((t) => (
        <div
          className={css.item}
          key={t._id || t.id}
          role="button"
          tabIndex={0}
          onClick={() => navigate(`/team/${t.id || t._id}`)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate(`/team/${t.id || t._id}`)
          }}
        >
          <div className={css.title}>{t.title}</div>
          <div className={css.meta}>
            <span>{t.isPublic ? 'Публичная' : 'Приватная'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamList;
