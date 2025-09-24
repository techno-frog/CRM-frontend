import React from 'react';
import { Shield, ShieldCheck } from 'lucide-react';
import type { TeamActivity } from '../../../types/team-activities.types';
import { TeamActivityType } from '../../../types/team-activities.types';
import { TeamActivityItemBase } from './TeamActivityItemBase';

interface TeamActivityItemRoleProps {
  activity: TeamActivity;
  onArchive: () => void;
}

const getRoleIcon = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.ROLE_ASSIGNED:
      return <ShieldCheck size={16} className="text-green-500" />;
    case TeamActivityType.ROLE_REMOVED:
      return <Shield size={16} className="text-red-500" />;
    default:
      return <Shield size={16} />;
  }
};

export const TeamActivityItemRole: React.FC<TeamActivityItemRoleProps> = ({
  activity,
  onArchive
}) => {
  const icon = getRoleIcon(activity.type);

  return (
    <TeamActivityItemBase
      activity={activity}
      onArchive={onArchive}
      icon={icon}
    />
  );
};