import React, { type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import css from './Modal.module.css';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  absolute?: boolean;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({ open, title, onClose, footer, absolute, children }) => {
  if (!open) return null;
  const content = (
    <div className={css.modal}>
      <div className={css.overlay} onClick={onClose} />
      <div className={css.panel} role="dialog" aria-modal="true">
        <div className={css.header}>
          <div className={css.title}>{title}</div>
          <button className={css.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={css.body}>{children}</div>
        {footer && <div className={css.footer}>{footer}</div>}
      </div>
    </div>
  );
  return absolute ? createPortal(content, document.body) : content;
};

export default Modal;
