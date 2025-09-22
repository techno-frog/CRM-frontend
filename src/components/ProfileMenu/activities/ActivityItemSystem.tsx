import React from 'react';
import { Info } from 'lucide-react';
import type { UserActivity } from '../../../types/activities.types';
import { ActivityStatus } from '../../../types/activities.types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import css from './ActivityItem.module.css';

interface ActivityItemSystemProps {
  activity: UserActivity;
  onMarkRead: () => void;
}

export const ActivityItemSystem: React.FC<ActivityItemSystemProps> = ({ activity, onMarkRead }) => {
  const handleClick = () => {
    onMarkRead();
  };

  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
    locale: ru
  });

  return (
    <div
      className={`${css.activityItem} ${activity.status === ActivityStatus.UNREAD ? css.unread : ''} ${css.clickable}`}
      onClick={handleClick}
    >
      <div className={css.icon}>
        <Info size={16} />
      </div>

      <div className={css.content}>
        <div className={css.text}>{activity.text}</div>
        <div className={css.time}>{timeAgo}</div>
      </div>

      {activity.status === ActivityStatus.UNREAD && <div className={css.unreadDot} />}
    </div>
  );
};