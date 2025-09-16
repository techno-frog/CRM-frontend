import React from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import css from './TeamLayout.module.css';
import { useGetTeamQuery } from '../../../../../api/teamsApi';
import Side from '../../../components/Side/Side';

const TeamLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: team, isFetching } = useGetTeamQuery(id || '', { skip: !id });
  const members = team?.members || [];

  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        {/* Хедер с кнопкой назад */}
        <header className={css.header}>
          <Link to="/teams" className={css.backButton}>
            <ArrowLeft size={20} />
            Вернуться к командам
          </Link>
          <Link
            to={id ? `/team/${id}/callendar` : '#'}
            className={css.backButton}
            title="Календарь команды"
          >
            <Calendar size={20} />
            Календарь
          </Link>
        </header>

        {/* Главная область контента */}
        <div className={css.mainContent}>
          {/* Основная секция с контентом */}
          <main className={css.contentSection}>
            <Outlet />
          </main>

          {/* Секция участников */}
          <Side members={members as any[]} loading={isFetching} />
        </div>
      </div>
    </div>
  );
};

export default TeamLayout;
