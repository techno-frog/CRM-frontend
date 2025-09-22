import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings } from 'lucide-react';
import { ActivitiesList } from './ActivitiesList';
import Modal from '../../shared/components/Modal/Modal';
import css from './ProfileMenu.module.css';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ isOpen, onClose, triggerRef }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef, isMobile]);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, isMobile]);

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <Modal
        open={isOpen}
        onClose={onClose}
        title="Профиль"
        absolute
        footer={
          <div className={css.footerButtons}>
            <Link to="/profile" className={css.navButton} onClick={onClose}>
              <User size={18} />
              Профиль
            </Link>
            <Link to="/settings" className={css.navButton} onClick={onClose}>
              <Settings size={18} />
              Настройки
            </Link>
          </div>
        }
      >
        <ActivitiesList />
      </Modal>
    );
  }

  return (
    <div ref={menuRef} className={css.desktopDropdown}>
      {/* Desktop Content */}
      <div className={css.desktopContent}>
        <ActivitiesList />

        <div className={css.navigationButtons}>
          <Link to="/profile" className={css.navButton} onClick={onClose}>
            <User size={16} />
            Профиль
          </Link>
          <Link to="/settings" className={css.navButton} onClick={onClose}>
            <Settings size={16} />
            Настройки
          </Link>
        </div>
      </div>
    </div>
  );
};