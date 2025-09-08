import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import css from './Sidebar.module.css';
import type { RouteConfig } from '../../../../types/module.types';

interface SidebarProps {
  routes: RouteConfig[];
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  routes,
  onLogout,
  isCollapsed,
  onToggleCollapse,
}) => {
  const location = useLocation();

  return (
    <aside className={`${css.sidebar} ${isCollapsed ? css.collapsed : ''}`}>
      <div className={css.content}>
        <div className={css.top}>
          {/* Логотип */}
          <div className={css.logo}>
            <div className={''}>
              <img src='/img/logo3.png' width={!isCollapsed ? 200 : 70} />
              {/* <svg viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2L2 9v14l14 7 14-7V9L16 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 16l-7-3.5v7l7 3.5 7-3.5v-7L16 16z"
                  fill="currentColor"
                  opacity="0.3"
                />
              </svg> */}
            </div>
            {/* {!isCollapsed && <span className={css.logoText}>Dashboard</span>} */}
          </div>

          {/* Навигация */}
          <nav className={css.nav}>
            {routes.map((route) => {
              const Icon = route.icon;
              const isActive = location.pathname === route.path;

              return (
                <Link
                  key={route.path}
                  to={route.path}
                  className={`${css.navLink} ${isActive ? css.active : ''}`}
                  title={isCollapsed ? route.title : undefined}
                >
                  <div className={css.navIcon}>
                    {/* @ts-ignore */}
                    {Icon && <Icon size={20} />}
                  </div>
                  {!isCollapsed && (
                    <span className={css.navText}>{route.title}</span>
                  )}
                  {!isCollapsed && isActive && (
                    <div className={css.activeIndicator} />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Нижняя часть */}
        <div className={css.bottom}>
          <button
            onClick={onLogout}
            className={css.logoutBtn}
            title={isCollapsed ? 'Выйти' : undefined}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Выйти</span>}
          </button>

          {/* Кнопка сворачивания */}
          <button
            onClick={onToggleCollapse}
            className={css.logoutBtn}
            aria-label={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!isCollapsed && <span>Свернуть</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};