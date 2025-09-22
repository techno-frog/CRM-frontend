import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSendInviteMutation, useLazySearchUsersQuery, useInviteUserMutation } from '../../../../api/invitesApi';
import { Search, Link as LinkIcon, Copy, Send } from 'lucide-react';
import CreateInviteModal from './CreateInviteModal';
import css from './TeamInvites.module.css';
import { useNotify } from '../../../../hooks/useNotify';
import { extractErrorMessage } from '../../../../utils/extractErrorMessage';

const TeamInvites: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const teamId = id || '';

  const [maxActs] = useState<number>(1);
  const [email, setEmail] = useState('');
  const [expiresAt] = useState<string>('');
  const [role] = useState<string>('member');
  const [note] = useState<string>('');
  const [perpetualInvite] = useState<boolean>(false);
  const [link, setLink] = useState<string>('');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [search, { isFetching: searching }] = useLazySearchUsersQuery();
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());
  const [successUsers, setSuccessUsers] = useState<Set<string>>(new Set());

  const [sendInvite, { isLoading: sending }] = useSendInviteMutation();
  const [inviteUser] = useInviteUserMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const { success, error: notifyError } = useNotify();

  const handleSend = async () => {
    if (!teamId || !email) return;
    try {
      await sendInvite({ teamId, email, maxActivations: maxActs, role, note }).unwrap();
      success({ title: 'Приглашение отправлено', text: `Мы написали ${email}` });
      setEmail('');
    } catch (err) {
      console.error('Ошибка отправки инвайта:', err);
      notifyError({ title: 'Не удалось отправить письмо', text: extractErrorMessage(err, 'Попробуй ещё раз позже') });
    }
  };

  const handleInviteExisting = async (userEmail: string, userId: string) => {
    if (!teamId) return;

    // Добавляем в загрузку
    setLoadingUsers(prev => new Set(prev).add(userId));
    setSuccessUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });

    try {
      await inviteUser({ teamId, userEmail, expiresAt: perpetualInvite ? undefined : expiresAt }).unwrap();
      success({ title: 'Пользователь приглашён', text: `${userEmail} получил приглашение` });

      // Переводим в успех
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setSuccessUsers(prev => new Set(prev).add(userId));

    } catch (err) {
      console.error('Ошибка приглашения пользователя:', err);
      notifyError({ title: 'Не удалось пригласить', text: extractErrorMessage(err, 'Проверь данные и попробуй снова') });

      // Убираем из загрузки при ошибке
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setUsers([]); // Clear previous results when field is empty
      return;
    }
    if (q.length < 2) return;

    const t = setTimeout(async () => {
      try {
        const result = await search(q).unwrap();
        setUsers(result || []);
      } catch (err) {
        setUsers([]);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [query, search]);

  const copyLink = async () => {
    if (link) await navigator.clipboard.writeText(link);
  };

  return (
    <>
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
                  {!loadingUsers.has(u.id) && !successUsers.has(u.id) ? (
                    <button className={css.secondaryBtn} onClick={() => handleInviteExisting(u.email, u.id)}>Пригласить</button>
                  ) : loadingUsers.has(u.id) ? (
                    <div className={css.loadingBtn}>
                      ⏳ Отправляем приглашение...
                    </div>
                  ) : (
                    <div className={css.successBtn}>
                      <span className={css.checkmark}>✅</span>
                      Приглашение отправлено
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={css.section}>
          <h3 className={css.sectionTitle}>Мульти‑инвайт / Ссылка </h3>
          <div className={css.row}>
            <button className={css.primaryBtn} onClick={() => setModalOpen(true)}><LinkIcon size={16} />Создать ссылку</button>
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
      <CreateInviteModal
        teamId={teamId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(token) => setLink(`${window.location.origin}/join/${token}`)}
      />
    </>
  );
};

export default TeamInvites;
