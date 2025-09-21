import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { RouteRegistry } from '../routing/RouteRegistry';
import { useLogoutMutation } from '../api/authApi';
import { useTheme } from '../providers/ThemeProvider';
import { useNotify } from '../hooks/useNotify';
import { extractErrorMessage } from '../utils/extractErrorMessage';
import css from './DashboardLayout.module.css';

import { Topbar } from '../shared/components/Pagination/Topbar/Topbar';
import { Sidebar } from '../shared/components/Pagination/Sidebar/Sidebar';
import { InviteModal } from '../shared/components/InviteModal/InviteModal';

export const DashboardLayout: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [logout] = useLogoutMutation();
  const { theme, toggleTheme } = useTheme();
  const { success, error: notifyError } = useNotify();
  const navigate = useNavigate();
  const navigableRoutes = RouteRegistry.getNavigableRoutes();

  // Состояние сайдбара
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [isChatOpen, _] = useState(false);

  // Состояние для модалки приглашения
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);

  // Проверяем наличие invite code в localStorage при загрузке
  useEffect(() => {
    const inviteCode = localStorage.getItem('pendingInviteCode');
    if (inviteCode && user) {
      setPendingInviteCode(inviteCode);
    }
  }, [user]);

  // Сохраняем состояние сайдбара
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const handleLogout = async () => {
    try {
      window.dispatchEvent(new Event('logout'));
      await logout().unwrap();
      success({ title: 'До встречи 👋', text: 'Ждём тебя снова' });
    } catch (error) {
      console.error('Logout error:', error);
      notifyError({ title: 'Не удалось выйти', text: extractErrorMessage(error, 'Попробуй повторить позже') });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleAcceptInvite = async () => {
    try {
      // TODO: Заменить на реальный API вызов для присоединения к команде
      success({ title: 'Добро пожаловать в команду! 🎉', text: 'Вы успешно присоединились к команде' });
      localStorage.removeItem('pendingInviteCode');
      setPendingInviteCode(null);
      // Возможно, нужно обновить данные пользователя или перенаправить
      navigate('/teams');
    } catch (error) {
      console.error('Ошибка принятия приглашения:', error);
      notifyError({ title: 'Ошибка', text: 'Не удалось присоединиться к команде' });
    }
  };

  const handleDeclineInvite = () => {
    localStorage.removeItem('pendingInviteCode');
    setPendingInviteCode(null);
    success({ title: 'Приглашение отклонено', text: 'Вы можете присоединиться к команде позже' });
  };

  const handleCloseInviteModal = () => {
    localStorage.removeItem('pendingInviteCode');
    setPendingInviteCode(null);
  };

  return (
    <div className={css.container}>
      {/* Sidebar - фиксированный слева */}

      <Sidebar
        routes={navigableRoutes}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Основная область */}
      <div className={css.mainWrapper}>
        {/* Topbar - вверху основной области */}
        <Topbar
          userName={user?.name}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          isSidebarCollapsed={isSidebarCollapsed}
          routes={navigableRoutes}
        />

        {/* Область контента и чата */}
        <div className={`${css.contentArea} ${isChatOpen ? css.chatActive : ''}`}>
          {/* Основной контент */}
          <main className={css.main}>
            <div className={css.content}>
              {/* <span onClick={() => setIsChatOpen(true)}>lol</span> */}
              <Outlet />
            </div>
          </main>

          {/* Секция чата */}
          <aside className={`${css.chatSection} ${isChatOpen ? css.active : ''}`}>
            {/* Чат будет здесь */}
            {/* Для тестирования добавь кнопку toggleChat и вызывай setIsChatOpen(!isChatOpen) */}
          </aside>
        </div>
      </div>

      {/* Модалка приглашения */}
      {pendingInviteCode && (
        <InviteModal
          inviteCode={pendingInviteCode}
          onAccept={handleAcceptInvite}
          onDecline={handleDeclineInvite}
          onClose={handleCloseInviteModal}
        />
      )}
    </div>
  );
};
