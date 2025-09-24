import React from 'react';
import { Archive, Clock, AlertCircle, Info, User } from 'lucide-react';
import type { TeamActivity, TeamActivityPriority } from '../../../types/team-activities.types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import css from '../activities/ActivityItem.module.css';

interface TeamActivityItemBaseProps {
  activity: TeamActivity;
  onArchive: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  showArchiveButton?: boolean;
}

const getPriorityIcon = (priority: TeamActivityPriority) => {
  switch (priority) {
    case 'critical':
      return <AlertCircle size={16} className={css.criticalIcon} />;
    case 'high':
      return <AlertCircle size={16} className={css.highIcon} />;
    case 'medium':
      return <Info size={16} className={css.mediumIcon} />;
    case 'low':
    default:
      return <Info size={16} className={css.lowIcon} />;
  }
};

export const TeamActivityItemBase: React.FC<TeamActivityItemBaseProps> = ({
  activity,
  onArchive,
  children,
  icon,
  showArchiveButton = true
}) => {
  const priorityIcon = getPriorityIcon(activity.priority);
  const timeAgo = formatDistanceToNow(new Date(activity.occurredAt), {
    addSuffix: true,
    locale: ru
  });

  return (
    <div className={`${css.activityItem} ${activity.isArchived ? css.archived : ''} ${css[activity.priority]}`}>
      <div className={css.activityHeader}>
        <div className={css.activityIcon}>
          {icon || <User size={16} />}
        </div>
        <div className={css.activityContent}>
          <div className={css.activityTitle}>{activity.title}</div>
          {activity.description && (
            <div className={css.activityDescription}>{activity.description}</div>
          )}
          <div className={css.activityMeta}>
            <span className={css.activityCreator}>
              {activity.createdBy.name}
            </span>
            <span className={css.activityTime}>
              <Clock size={12} />
              {timeAgo}
            </span>
            <span className={css.activityPriority}>
              {priorityIcon}
              {activity.priority}
            </span>
          </div>
          {children}
        </div>
        {showArchiveButton && !activity.isArchived && (
          <button
            className={css.archiveButton}
            onClick={onArchive}
            title="Архивировать"
          >
            <Archive size={14} />
          </button>
        )}
      </div>
    </div>
  );
};