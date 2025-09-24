import React, { useState } from 'react';
import { Users, UserPlus, LogOut } from 'lucide-react';
import css from './Side.module.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
import { useLeaveTeamMutation } from '../../../../api/teamsApi';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../../../../shared/components/Modal/Modal';

type User = { _id?: string; id?: string; name?: string; email?: string }
type Member = { role: string, user: User };

interface SideProps {
  members: Member[];
  loading?: boolean;
  teamName?: string;
}

const Side: React.FC<SideProps> = ({ members, loading, teamName }) => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { id: teamId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [leaveTeam, { isLoading: isLeaving }] = useLeaveTeamMutation();

  const expectedText = `Покинуть ${teamName || 'команду'}`;
  const canLeave = confirmText === expectedText;

  const handleLeaveTeam = async () => {
    if (!teamId || !canLeave) return;

    try {
      await leaveTeam(teamId).unwrap();
      navigate('/teams');
    } catch (error) {
      console.error('Failed to leave team:', error);
    }
  };

  const openLeaveModal = () => {
    setShowLeaveModal(true);
    setConfirmText('');
  };

  const closeLeaveModal = () => {
    setShowLeaveModal(false);
    setConfirmText('');
  };

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
          {members.map((m) => {
            const memberId = m.user._id || m.user.id || m.user.email || '';
            const isCurrentUser = currentUser && (

              currentUser.user.email === m.user.email
            );
            const isSelected = selectedMember === memberId;

            return (
              <div
                key={memberId}
                className={`${css.memberItem} ${isCurrentUser ? css.currentUser : ''} ${isSelected ? css.selected : ''}`}
                onClick={() => setSelectedMember(isSelected ? null : memberId)}
              >
                <div className={css.memberContent}>
                  <div className={css.memberAvatar}>{getInitials(m.user.name || m.user.email || '?')}</div>
                  <div className={css.memberInfo}>
                    <div className={css.memberName}>{m.user.name || '—'}</div>
                    <div className={css.memberRole}>{m.user.email}</div>
                  </div>
                </div>
                {isCurrentUser && isSelected && (
                  <button
                    className={css.leaveButton}
                    onClick={(e) => {
                      console.log(currentUser)
                      console.log(m)
                      console.log(isCurrentUser)
                      e.stopPropagation();
                      openLeaveModal();
                    }}
                    disabled={isLeaving}
                  >
                    <LogOut size={16} />
                    Покинуть команду
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showLeaveModal}
        onClose={closeLeaveModal}
        title="Покинуть команду"
        footer={
          <>
            <button className={css.cancelButton} onClick={closeLeaveModal}>
              Отмена
            </button>
            <button
              className={css.confirmButton}
              onClick={handleLeaveTeam}
              disabled={!canLeave || isLeaving}
            >
              {isLeaving ? 'Покидаем...' : 'Покинуть команду'}
            </button>
          </>
        }
      >
        <div className={css.leaveModalContent}>
          <p className={css.warningText}>
            Вы действительно хотите покинуть команду <strong>{teamName}</strong>?
          </p>
          <p className={css.confirmationText}>
            Для подтверждения введите: <code className={css.codeText}>{expectedText}</code>
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={expectedText}
            className={css.confirmInput}
            autoFocus
          />
        </div>
      </Modal>
    </aside>
  );
};

export default Side;

