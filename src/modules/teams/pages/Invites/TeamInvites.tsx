import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCreateInviteLinkMutation, useSendInviteMutation, useLazySearchUsersQuery, useInviteUserMutation } from '../../../../api/invitesApi';
import { Search, Link as LinkIcon, Copy, Send } from 'lucide-react';
import css from './TeamInvites.module.css';

const TeamInvites: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const teamId = id || '';

  const [maxActs, setMaxActs] = useState<number>(1);
  const [email, setEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [query, setQuery] = useState('');
  const [search, { data: users, isFetching: searching }] = useLazySearchUsersQuery();

  const [createLink, { isLoading: creating }] = useCreateInviteLinkMutation();
  const [sendInvite, { isLoading: sending }] = useSendInviteMutation();
  const [inviteUser] = useInviteUserMutation();

  const handleCreateLink = async () => {
    if (!teamId) return;
    const res = await createLink({ teamId, maxActivations: maxActs, expiresAt: expiresAt || undefined }).unwrap();
    const url = `${window.location.origin}/join/${res.token}`;
    setLink(url);
  };

  const handleSend = async () => {
    if (!teamId || !email) return;
    await sendInvite({ teamId, email, maxActivations: maxActs }).unwrap();
    setEmail('');
  };

  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 2) return;
    const t = setTimeout(() => search(q), 400);
    return () => clearTimeout(t);
  }, [query, search]);

  const copyLink = async () => {
    if (link) await navigator.clipboard.writeText(link);
  };

  return (
    <div className={css.wrapper}>
      <h2 className={css.title}>Приглашения в команду</h2>

      <section className={css.section}>
        <h3 className={css.sectionTitle}>Поиск пользователя</h3>
        <div className={css.row}>
          <div className={css.inputWrap}>
            <Search size={16} />
            <input className={css.input} placeholder="Email или имя" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        {searching && <div className={css.muted}>Идет поиск…</div>}
        {users && users.length > 0 && (
          <div className={css.list}>
            {users.map(u => (
              <div key={u.id} className={css.card}>
                <div className={css.cardBody}>
                  <div className={css.cardTitle}>{u.name || u.email}</div>
                  <div className={css.cardSubtitle}>{u.email}</div>
                </div>
                <button className={css.secondaryBtn} onClick={() => inviteUser({ teamId, userEmail: u.email })}>Пригласить</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={css.section}>
        <h3 className={css.sectionTitle}>Мульти‑инвайт / Ссылка</h3>
        <div className={css.row}>
          <label className={css.label}>Активаций:</label>
          <input className={css.input} type="number" min={1} value={maxActs} onChange={(e) => setMaxActs(parseInt(e.target.value || '1', 10))} style={{ width: 120 }} />
          <label className={css.label}>Срок:</label>
          <input className={css.input} type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} style={{ width: 220 }} />
          <button className={css.primaryBtn} disabled={creating} onClick={handleCreateLink}><LinkIcon size={16} />Создать ссылку</button>
        </div>
        {link && (
          <div className={css.row}>
            <input className={css.input} readOnly value={link} />
            <button className={css.secondaryBtn} onClick={copyLink}><Copy size={16} />Копировать</button>
          </div>
        )}
      </section>

      <section className={css.section}>
        <h3 className={css.sectionTitle}>Отправить на почту</h3>
        <div className={css.row}>
          <input className={css.input} placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className={css.primaryBtn} disabled={sending} onClick={handleSend}><Send size={16} />Отправить</button>
        </div>
      </section>
    </div>
  );
};

export default TeamInvites;
