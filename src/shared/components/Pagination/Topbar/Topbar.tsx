import React, { useState, useRef } from 'react';
import { Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import css from './Topbar.module.css';
import type { RouteConfig } from '../../../../types/module.types';
import { FaUser } from 'react-icons/fa';
import { ProfileMenu } from '../../../../components/ProfileMenu';

interface TopbarProps {
  userName?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  isSidebarCollapsed: boolean;
  routes: RouteConfig[];
}

export const Topbar: React.FC<TopbarProps> = ({
  userName,
  theme,
  onToggleTheme,
  onLogout,
  isSidebarCollapsed,
  routes,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header
        className={`${css.topbar} ${isSidebarCollapsed ? css.sidebarCollapsed : ''}`}
      >
        <div className={css.container}>
          {/* Мобильное меню - только на маленьких экранах */}
          <button
            className={css.mobileMenuBtn}
            onClick={toggleMobileMenu}
            aria-label="Открыть меню"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Приветствие */}
          <div className={css.greeting}>
            <h3>Привет, <span className={css.userName}>{userName}</span>!</h3>
          </div>

          {/* Действия */}
          <div className={css.actions}>


            <button
              onClick={onToggleTheme}
              className={css.themeBtn}
              aria-label={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            >
              <div className={css.themeIcon}>
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
            </button>

            <div style={{ position: 'relative' }}>
              <button
                ref={profileButtonRef}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={css.userBtn}
                aria-label="Открыть меню профиля"
              >
                <div className={css.themeIcon}>
                  <FaUser size={20} />
                </div>
              </button>

              <ProfileMenu
                isOpen={isProfileMenuOpen}
                onClose={() => setIsProfileMenuOpen(false)}
                triggerRef={profileButtonRef}
              />
            </div>

            {/* Кнопка выхода на десктопе */}
            <button
              onClick={onLogout}
              className={css.logoutBtnDesktop}
              aria-label="Выйти"
            >
              <LogOut size={20} />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное выпадающее меню */}
      <div className={`${css.mobileMenu} ${isMobileMenuOpen ? css.open : ''}`}>
        <nav className={css.mobileNav}>
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <Link
                key={route.path}
                to={route.path}
                className={css.mobileNavLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {/* @ts-ignore */}
                {Icon && <Icon size={20} />}
                <span>{route.title}</span>
              </Link>
            );
          })}
        </nav>
        <div className={css.mobileActions}>
          <button onClick={onLogout} className={css.mobileLogoutBtn}>
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </div>

      {/* Оверлей для мобильного меню */}
      {isMobileMenuOpen && (
        <div
          className={css.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};