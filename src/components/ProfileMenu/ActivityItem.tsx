import React from 'react';
import type { UserActivity } from '../../types/activities.types';
import { ActivityType, ActivityStatus } from '../../types/activities.types';
import { ActivityItemInvite } from './activities/ActivityItemInvite';
import { ActivityItemSystem } from './activities/ActivityItemSystem';
import { ActivityItemCalendar } from './activities/ActivityItemCalendar';
import { ActivityItemNotification } from './activities/ActivityItemNotification';

interface ActivityItemProps {
  activity: UserActivity;
  onMarkRead: (activityId: string) => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onMarkRead }) => {
  const handleMarkRead = () => {
    if (activity.status === ActivityStatus.UNREAD) {
      onMarkRead(activity.id);
    }
  };

  // Route to appropriate activity item component based on type
  switch (activity.type) {
    case ActivityType.INVITE:
      return (
        <ActivityItemInvite
          activity={activity}
          onMarkRead={handleMarkRead}
        />
      );

    case ActivityType.CALENDAR:
      return (
        <ActivityItemCalendar
          activity={activity}
          onMarkRead={handleMarkRead}
        />
      );

    case ActivityType.SYSTEM:
      return (
        <ActivityItemSystem
          activity={activity}
          onMarkRead={handleMarkRead}
        />
      );

    case ActivityType.NOTIFICATION:
      return (
        <ActivityItemNotification
          activity={activity}
          onMarkRead={handleMarkRead}
        />
      );

    default:
      // Fallback to system item for unknown types
      return (
        <ActivityItemSystem
          activity={activity}
          onMarkRead={handleMarkRead}
        />
      );
  }
};