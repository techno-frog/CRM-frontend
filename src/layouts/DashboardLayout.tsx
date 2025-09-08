import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { RouteRegistry } from '../routing/RouteRegistry';
import { useLogoutMutation } from '../api/authApi';
import { useTheme } from '../providers/ThemeProvider';
import css from './DashboardLayout.module.css';

import { Topbar } from '../shared/components/Navigation/Topbar/Topbar';
import { Sidebar } from '../shared/components/Navigation/Sidebar/Sidebar';

export const DashboardLayout: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [logout] = useLogoutMutation();
  const { theme, toggleTheme } = useTheme();
  const navigableRoutes = RouteRegistry.getNavigableRoutes();

  // Состояние сайдбара
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });


  const [isChatOpen, _] = useState(false);

  // Сохраняем состояние сайдбара
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const handleLogout = async () => {
    try {
      window.dispatchEvent(new Event('logout'));
      await logout().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
    </div>
  );
};