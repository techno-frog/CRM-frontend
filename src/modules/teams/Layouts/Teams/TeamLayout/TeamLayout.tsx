import React, { useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronDown } from 'lucide-react';
import css from './TeamLayout.module.css';
import { useGetTeamQuery } from '../../../../../api/teamsApi';
import Side from '../../../components/Side/Side';
import { HamburgerMenu } from '../../../../../shared/components/HamburgerMenu';
import type { MenuItem } from '../../../../../shared/components/HamburgerMenu/HamburgerMenu';

const TeamLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: team, isFetching } = useGetTeamQuery(id || '', { skip: !id });
  const members = team?.members || [];

  const [mainOpen, setMainOpen] = useState(true);
  const [membersOpen, setMembersOpen] = useState(true);

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
          <div className={css.mobileOnly}>
            <HamburgerMenu items={menuItems} />
          </div>
        </header>

        {/* Десктопная раскладка */}
        <div className={`${css.mainContent} ${css.desktopOnly}`}>
          <main className={css.contentSection}>
            <Outlet />
          </main>
          <Side members={members as any[]} loading={isFetching} teamName={team?.title} />
        </div>

        {/* Мобильная раскладка со шторками */}
        <div className={css.mobileOnly}>
          <section className={css.sheet}>
            <button className={css.sheetHeader} onClick={() => setMainOpen(v => !v)}>
              <span className={css.sheetTitle}>Детали</span>
              <ChevronDown size={18} className={`${css.chevron} ${mainOpen ? css.chevronOpen : ''}`} />
            </button>
            {mainOpen && (
              <div className={css.sheetBody}>
                <Outlet />
              </div>
            )}
          </section>

          <section className={css.sheet}>
            <button className={css.sheetHeader} onClick={() => setMembersOpen(v => !v)}>
              <span className={css.sheetTitle}>Участники</span>
              <ChevronDown size={18} className={`${css.chevron} ${membersOpen ? css.chevronOpen : ''}`} />
            </button>
            {membersOpen && (
              <div className={css.sheetBody}>
                <Side members={members as any[]} loading={isFetching} teamName={team?.title} />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TeamLayout;
