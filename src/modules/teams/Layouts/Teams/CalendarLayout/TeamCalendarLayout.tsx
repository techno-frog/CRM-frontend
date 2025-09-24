import React, { useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import css from './TeamCalendarLayout.module.css';
import { useGetTeamQuery } from '../../../../../api/teamsApi';
import Side from '../../../components/Side/Side';
import { HamburgerMenu } from '../../../../../shared/components/HamburgerMenu';
import type { MenuItem } from '../../../../../shared/components/HamburgerMenu/HamburgerMenu';

const TeamCalendarLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: team, isFetching } = useGetTeamQuery(id || '', { skip: !id });
  const members = team?.members || [];

  // Mobile: only one active sheet at a time
  const [activeSheet, setActiveSheet] = useState<'calendar' | 'members'>('calendar');

  const menuItems: MenuItem[] = [
    {
      path: '/teams',
      label: 'Вернуться к командам',
      icon: ArrowLeft
    },
    {
      path: id ? `/team/${id}/callendar` : '#',
      label: 'Календарь',
      icon: Calendar
    }
  ];

  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        {/* Хедер с кнопкой назад */}
        <header className={css.header}>
          {/* Desktop actions */}
          <div className={css.desktopOnly}>
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
          </div>
          {/* Mobile hamburger */}
          <div className={css.mobileOnly}>
            <HamburgerMenu items={menuItems} />
          </div>
        </header>

        {/* Десктопная раскладка */}
        <div className={`${css.mainContent} ${css.desktopOnly}`}>
          <main className={css.contentSection}>
            <Outlet />
          </main>
          <Side members={members as any[]} loading={isFetching} />
        </div>

        {/* Мобильная раскладка: активная секция + нижняя шторка-переключатель */}
        <div className={css.mobileOnly}>
          <div className={css.mobileMain}>
            {activeSheet === 'calendar' ? (
              <Outlet />
            ) : (
              <Side members={members as any[]} loading={isFetching} />
            )}
          </div>
          <div className={css.bottomDock}>
            {activeSheet === 'calendar' ? (
              <button className={css.dockButton} onClick={() => setActiveSheet('members')}>
                Участники
              </button>
            ) : (
              <button className={css.dockButton} onClick={() => setActiveSheet('calendar')}>
                Календарь
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCalendarLayout;
