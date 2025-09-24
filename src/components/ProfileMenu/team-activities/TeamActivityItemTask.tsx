import React from 'react';
import { Plus, CheckCircle, UserCheck } from 'lucide-react';
import type { TeamActivity } from '../../../types/team-activities.types';
import { TeamActivityType } from '../../../types/team-activities.types';
import { TeamActivityItemBase } from './TeamActivityItemBase';

interface TeamActivityItemTaskProps {
  activity: TeamActivity;
  onArchive: () => void;
}

const getTaskIcon = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.TASK_CREATED:
      return <Plus size={16} className="text-blue-500" />;
    case TeamActivityType.TASK_COMPLETED:
      return <CheckCircle size={16} className="text-green-500" />;
    case TeamActivityType.TASK_ASSIGNED:
      return <UserCheck size={16} className="text-yellow-500" />;
    default:
      return <Plus size={16} />;
  }
};

export const TeamActivityItemTask: React.FC<TeamActivityItemTaskProps> = ({
  activity,
  onArchive
}) => {
  const icon = getTaskIcon(activity.type);

  return (
    <TeamActivityItemBase
      activity={activity}
      onArchive={onArchive}
      icon={icon}
    >
      {activity.metadata && (
        <div className="mt-2 text-sm text-gray-600">
          {activity.metadata.taskTitle && (
            <div>Задача: {activity.metadata.taskTitle}</div>
          )}
          {activity.metadata.assignedTo && (
            <div>Назначена: {activity.metadata.assignedTo}</div>
          )}
          {activity.metadata.dueDate && (
            <div>Срок: {new Date(activity.metadata.dueDate).toLocaleDateString('ru-RU')}</div>
          )}
          {activity.metadata.priority && (
            <div>Приоритет: {activity.metadata.priority}</div>
          )}
        </div>
      )}
    </TeamActivityItemBase>
  );
};