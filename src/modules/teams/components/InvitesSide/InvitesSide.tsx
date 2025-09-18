import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetActiveInvitesQuery, useRevokeInviteMutation, useUpdateInviteMutation } from '../../../../api/invitesApi';
import css from './InvitesSide.module.css';
import { Users } from 'lucide-react';

const InvitesSide: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const teamId = id || '';
  const { data: invites, isFetching } = useGetActiveInvitesQuery(teamId, { skip: !teamId });
  const [revoke] = useRevokeInviteMutation();
  const [updateInvite] = useUpdateInviteMutation();

  if (!teamId) return null;

  return (
    <aside className={css.wrapper}>
      <div className={css.title}><Users size={18} /> Активные приглашения</div>
      {isFetching && <div className={css.meta}>Загрузка…</div>}
      {!isFetching && (!invites || invites.length === 0) && <div className={css.meta}>Нет активных приглашений</div>}
      <div className={css.list}>
        {invites?.map((inv) => (
          <div key={inv._id} className={css.item}>
            <div className={css.itemHeader}>
              <div className={css.itemEmail}>{inv.email || 'Инвайт‑ссылка'}</div>
              <div className={css.meta}>{inv.activationsUsed}/{inv.maxActivations}</div>
            </div>
            <div className={css.token}>{inv.token}</div>
            {!inv.email && (
              <div className={css.meta}>
                <label>Активаций: </label>
                <input type="number" min={1} defaultValue={inv.maxActivations} onBlur={(e) => updateInvite({ id: inv._id, teamId, maxActivations: parseInt(e.target.value || '1', 10) })} />
                <label style={{ marginLeft: 8 }}>Срок: </label>
                <input type="datetime-local" onBlur={(e) => updateInvite({ id: inv._id, teamId, expiresAt: e.target.value })} />
              </div>
            )}
            <button className={css.revokeBtn} onClick={() => revoke({ id: inv._id, teamId })}>Отозвать</button>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default InvitesSide;
