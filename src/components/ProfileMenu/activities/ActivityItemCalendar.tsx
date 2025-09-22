import React, { useState } from 'react';
import { Calendar, Check } from 'lucide-react';
import type { UserActivity } from '../../../types/activities.types';
import { ActivityStatus } from '../../../types/activities.types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import css from './ActivityItem.module.css';

interface ActivityItemCalendarProps {
  activity: UserActivity;
  onMarkRead: () => void;
}

export const ActivityItemCalendar: React.FC<ActivityItemCalendarProps> = ({ activity, onMarkRead }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement confirm calendar event API call
      console.log('Confirming calendar event:', activity.data);
      onMarkRead();
    } catch (error) {
      console.error('Failed to confirm calendar event:', error);
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
        <Calendar size={16} />
      </div>

      <div className={css.content}>
        <div className={css.text}>{activity.text}</div>

        {activity.data.eventDate && (
          <div className={css.meta}>
            Дата: <strong>{new Date(activity.data.eventDate).toLocaleDateString('ru-RU')}</strong>
          </div>
        )}

        <div className={css.time}>{timeAgo}</div>

        {activity.status === ActivityStatus.UNREAD && (
          <div className={css.actions}>
            <button
              className={`${css.actionButton} ${css.confirm}`}
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              <Check size={14} />
              Подтвердить
            </button>
          </div>
        )}
      </div>

      {activity.status === ActivityStatus.UNREAD && <div className={css.unreadDot} />}
    </div>
  );
};