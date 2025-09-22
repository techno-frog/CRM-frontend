import React, { useState } from 'react';
import { Users, Check, X } from 'lucide-react';
import type { UserActivity } from '../../../types/activities.types';
import { ActivityStatus } from '../../../types/activities.types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import css from './ActivityItem.module.css';
import { useAcceptInviteMutation } from '../../../api/invitesApi';

interface ActivityItemInviteProps {
  activity: UserActivity;
  onMarkRead: () => void;
}

export const ActivityItemInvite: React.FC<ActivityItemInviteProps> = ({ activity, onMarkRead }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptInvite] = useAcceptInviteMutation();

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement accept invite API call
      // await acceptInvite(activity.data.inviteId);
      console.log('Accepting invite:', activity.data);
      await acceptInvite(activity.data.inviteToken)
      onMarkRead();
    } catch (error) {
      console.error('Failed to accept invite:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement decline invite API call
      // await declineInvite(activity.data.inviteId);
      console.log('Declining invite:', activity.data);
      onMarkRead();
    } catch (error) {
      console.error('Failed to decline invite:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
    locale: ru
  });

  return (
    <div className={`${css.activityItem} ${activity.status === ActivityStatus.UNREAD ? css.unread : ''}`}>
      <div className={css.icon}>
        <Users size={16} />
      </div>

      <div className={css.content}>
        <div className={css.text}>{activity.text}</div>

        {activity.data.teamName && (
          <div className={css.meta}>
            Команда: <strong>{activity.data.teamName}</strong>
            {activity.data.role && <span> • Роль: {activity.data.role}</span>}
          </div>
        )}

        <div className={css.time}>{timeAgo}</div>

        {activity.status === ActivityStatus.UNREAD && (
          <div className={css.actions}>
            <button
              className={`${css.actionButton} ${css.accept}`}
              onClick={handleAccept}
              disabled={isProcessing}

            >
              <Check size={14} />
              Принять
            </button>
            <button
              className={`${css.actionButton} ${css.decline}`}
              onClick={handleDecline}
              disabled={isProcessing}
            >
              <X size={14} />
              Отклонить
            </button>
          </div>
        )}
      </div>

      {activity.status === ActivityStatus.UNREAD && <div className={css.unreadDot} />}
    </div>
  );
};