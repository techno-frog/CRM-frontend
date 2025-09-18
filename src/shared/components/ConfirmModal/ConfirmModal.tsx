import React from 'react';
import Modal from '../Modal/Modal';
import modalCss from '../Modal/Modal.module.css';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = 'Подтверждение',
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onClose,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      absolute
      title={title}
      footer={
        <>
          <button className={`${modalCss.btn} ${modalCss.ghost}`} onClick={onClose}>{cancelLabel}</button>
          <button className={`${modalCss.btn} ${modalCss.primary}`} onClick={onConfirm}>{confirmLabel}</button>
        </>
      }
    >
      {description && <div style={{ color: 'var(--text-secondary)' }}>{description}</div>}
    </Modal>
  );
};

export default ConfirmModal;
