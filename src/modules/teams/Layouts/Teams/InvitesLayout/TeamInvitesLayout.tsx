import React, { useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Menu } from 'lucide-react';
import css from '../CalendarLayout/TeamCalendarLayout.module.css';
import InvitesSide from '../../../components/InvitesSide/InvitesSide';
import { useGetTeamQuery } from '../../../../../api/teamsApi';

const TeamInvitesLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<'main' | 'invites'>('main');
  useGetTeamQuery(id || '', { skip: !id });

  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        <header className={css.header}>
          <div className={css.desktopOnly}>
            <Link to="/teams" className={css.backButton}>
              <ArrowLeft size={20} /> Вернуться к командам
            </Link>
            <Link to={id ? `/team/${id}/callendar` : '#'} className={css.backButton}>
              <Calendar size={20} /> Календарь
            </Link>
          </div>
          <div className={css.mobileOnly}>
            <button className={css.menuButton} onClick={() => setMenuOpen(v => !v)} aria-label="Меню">
              <Menu size={20} />
            </button>
            {menuOpen && (
              <div className={css.menuDropdown} onClick={() => setMenuOpen(false)}>
                <Link to="/teams" className={css.menuItem}><ArrowLeft size={16} /> Вернуться к командам</Link>
                <Link to={id ? `/team/${id}/callendar` : '#'} className={css.menuItem}><Calendar size={16} /> Календарь</Link>
              </div>
            )}
          </div>
        </header>

        <div className={`${css.mainContent} ${css.desktopOnly}`}>
          <main className={css.contentSection}>
            <Outlet />
          </main>
          <div className={css.membersSection}>
            <InvitesSide />
          </div>
        </div>

        <div className={css.mobileOnly}>
          <div className={css.mobileMain}>
            {activeSheet === 'main' ? (
              <Outlet />
            ) : (
              <div className={css.membersSection}>
                <InvitesSide />
              </div>
            )}
          </div>
          <div className={css.bottomDock}>
            {activeSheet === 'main' ? (
              <button className={css.dockButton} onClick={() => setActiveSheet('invites')}>Активные приглашения</button>
            ) : (
              <button className={css.dockButton} onClick={() => setActiveSheet('main')}>Вернуться</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamInvitesLayout;
