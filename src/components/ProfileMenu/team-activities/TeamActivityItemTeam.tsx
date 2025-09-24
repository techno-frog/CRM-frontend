import React from 'react';
import { Users, Settings, FileText } from 'lucide-react';
import type { TeamActivity } from '../../../types/team-activities.types';
import { TeamActivityType } from '../../../types/team-activities.types';
import { TeamActivityItemBase } from './TeamActivityItemBase';

interface TeamActivityItemTeamProps {
  activity: TeamActivity;
  onArchive: () => void;
}

const getTeamIcon = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.TEAM_CREATED:
      return <Users size={16} className="text-green-500" />;
    case TeamActivityType.TEAM_SETTINGS_UPDATED:
      return <Settings size={16} className="text-blue-500" />;
    case TeamActivityType.TEAM_DESCRIPTION_UPDATED:
      return <FileText size={16} className="text-yellow-500" />;
    default:
      return <Users size={16} />;
  }
};

export const TeamActivityItemTeam: React.FC<TeamActivityItemTeamProps> = ({
  activity,
  onArchive
}) => {
  const icon = getTeamIcon(activity.type);

  return (
    <TeamActivityItemBase
      activity={activity}
      onArchive={onArchive}
      icon={icon}
    />
  );
};