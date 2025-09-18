import { useParams } from 'react-router-dom';
import { useGetActiveInvitesQuery, useRevokeInviteMutation } from '../../../../api/invitesApi';
import css from './InvitesSide.module.css';
import { Users, Trash2, Copy } from 'lucide-react';
import React, { useState } from 'react';
import ConfirmModal from '../../../../shared/components/ConfirmModal/ConfirmModal';


const InvitesSide: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const teamId = id || '';
  const { data: invites, isFetching } = useGetActiveInvitesQuery(teamId, { skip: !teamId });
  const [revoke] = useRevokeInviteMutation();
  const [toRevoke, setToRevoke] = useState<string | null>(null);

  if (!teamId) return null;

  return (
    <aside className={css.wrapper}>
      <div className={css.title}><Users size={18} /> Активные приглашения</div>
      {isFetching && <div className={css.meta}>Загрузка…</div>}
      {!isFetching && (!invites || invites.length === 0) && <div className={css.meta}>Нет активных приглашений</div>}
      <div className={css.list}>
        {invites?.map((inv) => {
          const note = (inv as any).note as string | undefined;
          const expiresAt = (inv as any).expiresAt as string | undefined;
          const validUntil = expiresAt ? new Date(expiresAt).toLocaleDateString('ru-RU') : null;
          const createdAt = inv.createdAt ? new Date(inv.createdAt).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : null;
          const creator = typeof inv.createdBy === 'object' && inv.createdBy
            ? (inv.createdBy.name || inv.createdBy.email || (inv.createdBy as any).id)
            : typeof inv.createdBy === 'string'
              ? inv.createdBy
              : undefined;
          return (
            <div key={inv._id} className={css.item}>
              <div className={css.itemHeader}>
                <div className={css.itemEmail}>{note || inv.email || 'Инвайт‑ссылка'}</div>
                <div className={css.meta}>{inv.activationsUsed} из {inv.maxActivations}</div>
              </div>
              <div className={css.inlineRow}>
                <div className={css.token}>{inv.token}</div>
                <div className={css.inlineLeft}>
                  <button className={css.iconBtn} title="Копировать" onClick={() => navigator.clipboard.writeText(inv.token)}>
                    <Copy size={16} />
                  </button>
                  <button className={`${css.iconBtn} ${css.iconDanger}`} title="Отозвать" onClick={() => setToRevoke(inv._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {validUntil && (
                <div className={css.meta}>Действительна до {validUntil}</div>
              )}
              {(creator || createdAt) && (
                <div className={css.meta}>
                  {creator && <>Создал: {creator}</>}
                  {creator && createdAt && ' · '}
                  {createdAt && <>Создано: {createdAt}</>}
                </div>
              )}

            </div>
          );
        })}
      </div>
      <ConfirmModal
        open={Boolean(toRevoke)}
        title="Отозвать приглашение?"
        description="После отзыва ссылка перестанет работать."
        confirmLabel="Отозвать"
        cancelLabel="Отмена"
        onClose={() => setToRevoke(null)}
        onConfirm={() => { if (toRevoke) revoke({ id: toRevoke, teamId }); setToRevoke(null); }}
      />
    </aside>
  );
};

export default InvitesSide;
