import React, { useState, useEffect } from 'react';
import Modal from '../../../../shared/components/Modal/Modal';
import css from './CreateInviteModal.module.css';
import modalCss from '../../../../shared/components/Modal/Modal.module.css';
import { useCreateInviteLinkMutation } from '../../../../api/invitesApi';
import { useNotify } from '../../../../hooks/useNotify';
import { extractErrorMessage } from '../../../../utils/extractErrorMessage';

interface Props {
  teamId: string;
  open: boolean;
  onClose: () => void;
  onCreated?: (token: string) => void;
}

// CSS анимации для галочки
const animationStyles = `
  @keyframes checkmarkScale {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -15px, 0);
    }
    70% {
      transform: translate3d(0, -7px, 0);
    }
    90% {
      transform: translate3d(0, -2px, 0);
    }
  }
`;

const CreateInviteModal: React.FC<Props> = ({ teamId, open, onClose, onCreated }) => {
  const [role, setRole] = useState('member');
  const [note, setNote] = useState('');
  const [maxActs, setMaxActs] = useState(1);
  const [expiresAt, setExpiresAt] = useState('');
  const [createLink, { isLoading, isSuccess }] = useCreateInviteLinkMutation();
  const { success, error: notifyError } = useNotify();

  // Добавить CSS анимации в head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = animationStyles;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  const minus = () => setMaxActs(Math.max(1, maxActs - 1));
  const plus = () => setMaxActs(Math.min(9999, maxActs + 1));

  const submit = async () => {
    try {
      const res = await createLink({ teamId, maxActivations: maxActs, role, note, expiresAt: expiresAt || undefined }).unwrap();
      onCreated?.(res.token);
      success({ title: 'Ссылка готова', text: 'Скопируй её и поделись с командой' });
      onClose();
    } catch (err) {
      console.error('Ошибка создания ссылки-приглашения:', err);
      notifyError({ title: 'Не удалось создать ссылку', text: extractErrorMessage(err, 'Попробуй снова позже') });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Создание инвайт‑ссылки" footer={
      <>
        {!isLoading && !isSuccess && (
          <button className={`${modalCss.btn} ${modalCss.ghost}`} onClick={onClose}>Отмена</button>
        )}

        {!isLoading && !isSuccess ? (
          <button className={`${modalCss.btn} ${modalCss.primary}`} onClick={submit}>Создать</button>
        ) : isLoading ? (
          <div className={`${modalCss.btn} ${modalCss.primary}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'default',
            opacity: 0.8
          }}>
            ⏳ Отправляем приглашение...
          </div>
        ) : (
          <div className={`${modalCss.btn} ${modalCss.primary}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'default',
            backgroundColor: '#10b981',
            animation: 'checkmarkScale 0.5s ease-in-out'
          }}>
            <span style={{
              animation: 'bounce 0.6s ease-in-out',
              display: 'inline-block'
            }}>✅</span>
            Приглашение отправлено
          </div>
        )}
      </>
    }>
      <div className={css.grid}>
        <div className={css.row}>
          <div className={css.label}>Роль</div>
          <select className={css.input} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="member">Участник</option>
            <option value="viewer">Наблюдатель</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
        <div className={css.row}>
          <div className={css.label}>Количество активаций</div>
          <div className={css.numberInput}>
            <button className={css.stepBtn} onClick={minus}>−</button>
            <input className={css.input} type="number" min={1} value={maxActs} onChange={(e) => setMaxActs(parseInt(e.target.value || '1', 10))} />
            <button className={css.stepBtn} onClick={plus}>+</button>
          </div>
        </div>
        <div className={css.row}>
          <div className={css.label}>Срок действия</div>
          <input className={css.input} type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>
        <div className={css.row}>
          <div className={css.label}>Примечание</div>
          <input className={css.input} placeholder="Название ссылки" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className={css.hint}>После создания ссылка появится в списке активных приглашений. Вы сможете скопировать её и отправить пользователю.</div>
      </div>
    </Modal>
  );
};

export default CreateInviteModal;
