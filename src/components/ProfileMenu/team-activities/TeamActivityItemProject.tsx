import React from 'react';
import { FolderPlus, CheckCircle, Target } from 'lucide-react';
import type { TeamActivity } from '../../../types/team-activities.types';
import { TeamActivityType } from '../../../types/team-activities.types';
import { TeamActivityItemBase } from './TeamActivityItemBase';

interface TeamActivityItemProjectProps {
  activity: TeamActivity;
  onArchive: () => void;
}

const getProjectIcon = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.PROJECT_CREATED:
      return <FolderPlus size={16} className="text-blue-500" />;
    case TeamActivityType.PROJECT_COMPLETED:
      return <CheckCircle size={16} className="text-green-500" />;
    case TeamActivityType.MILESTONE_REACHED:
      return <Target size={16} className="text-yellow-500" />;
    default:
      return <FolderPlus size={16} />;
  }
};

export const TeamActivityItemProject: React.FC<TeamActivityItemProjectProps> = ({
  activity,
  onArchive
}) => {
  const icon = getProjectIcon(activity.type);

  return (
    <TeamActivityItemBase
      activity={activity}
      onArchive={onArchive}
      icon={icon}
    />
  );
};