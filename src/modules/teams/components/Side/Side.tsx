import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import css from './Side.module.css';

type User = { _id?: string; id?: string; name?: string; email?: string }
type Member = { role: string, user: User };

interface SideProps {
  members: Member[];
  loading?: boolean;
}

const Side: React.FC<SideProps> = ({ members, loading }) => {
  const getInitials = (nameOrEmail: string): string => {
    return (nameOrEmail || '?')
      .split(' ')
      .map((s) => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <aside className={css.membersSection}>
      <div className={css.membersHeader}>
        <div className={css.membersIcon}>
          <Users size={20} />
        </div>
        <h3 className={css.membersTitle}>Участники</h3>
      </div>

      {loading ? (
        <>
          <div className={css.skeletonMember} />
          <div className={css.skeletonMember} />
          <div className={css.skeletonMember} />
        </>
      ) : members.length === 0 ? (
        <div className={css.emptyMembers}>
          <div className={css.emptyMembersIcon}>
            <UserPlus size={24} />
          </div>
          <div>
            <div className={css.emptyMembersTitle}>Добавить участников</div>
            <div className={css.emptyMembersText}>
              Пока что в команде нет участников. Пригласи коллег для совместной работы!
            </div>
          </div>
        </div>
      ) : (
        <div className={css.membersList}>
          {members.map((m) => (
            <div key={m.user._id || m.user.id || m.user.email} className={css.memberItem}>
              <div className={css.memberAvatar}>{getInitials(m.user.name || m.user.email || '?')}</div>
              <div className={css.memberInfo}>
                <div className={css.memberName}>{m.user.name || '—'}</div>
                <div className={css.memberRole}>{m.user.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};

export default Side;

