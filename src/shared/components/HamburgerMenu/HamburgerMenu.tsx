import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import css from './HamburgerMenu.module.css';

export interface MenuItem {
  path: string;
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
  onClick?: () => void;
}

interface HamburgerMenuProps {
  items: MenuItem[];
  className?: string;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ items, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleItemClick = (item: MenuItem) => {
    closeMenu();
    item.onClick?.();
  };

  return (
    <>
      <button
        className={`${css.menuButton} ${className}`}
        onClick={toggleMenu}
        aria-label="Меню"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <>
          <div className={css.menuOverlay} onClick={closeMenu} />
          <div className={css.menuDropdown}>
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={css.menuItem}
                  onClick={() => handleItemClick(item)}
                >
                  {Icon && <Icon size={16} />}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};