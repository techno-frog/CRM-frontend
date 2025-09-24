import React from 'react';
import { Calendar, Play, CheckCircle } from 'lucide-react';
import type { TeamActivity } from '../../../types/team-activities.types';
import { TeamActivityType } from '../../../types/team-activities.types';
import { TeamActivityItemBase } from './TeamActivityItemBase';

interface TeamActivityItemEventProps {
  activity: TeamActivity;
  onArchive: () => void;
}

const getEventIcon = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.EVENT_CREATED:
      return <Calendar size={16} className="text-blue-500" />;
    case TeamActivityType.EVENT_STARTED:
      return <Play size={16} className="text-green-500" />;
    case TeamActivityType.EVENT_COMPLETED:
      return <CheckCircle size={16} className="text-green-600" />;
    default:
      return <Calendar size={16} />;
  }
};

export const TeamActivityItemEvent: React.FC<TeamActivityItemEventProps> = ({
  activity,
  onArchive
}) => {
  const icon = getEventIcon(activity.type);

  return (
    <TeamActivityItemBase
      activity={activity}
      onArchive={onArchive}
      icon={icon}
    >
      {activity.metadata && (
        <div className="mt-2 text-sm text-gray-600">
          {activity.metadata.eventTitle && (
            <div>Событие: {activity.metadata.eventTitle}</div>
          )}
          {activity.metadata.eventDate && (
            <div>Дата: {new Date(activity.metadata.eventDate).toLocaleDateString('ru-RU')}</div>
          )}
          {activity.metadata.duration && (
            <div>Длительность: {activity.metadata.duration}</div>
          )}
          {activity.metadata.participants && (
            <div>Участники: {activity.metadata.participants}</div>
          )}
        </div>
      )}
    </TeamActivityItemBase>
  );
};