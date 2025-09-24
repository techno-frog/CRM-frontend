import React from 'react';
import { UserPlus, UserMinus, UserCheck, UserX, Shield } from 'lucide-react';
import type { TeamActivity } from '../../../types/team-activities.types';
import { TeamActivityType } from '../../../types/team-activities.types';
import { TeamActivityItemBase } from './TeamActivityItemBase';

interface TeamActivityItemMemberProps {
  activity: TeamActivity;
  onArchive: () => void;
}

const getMemberIcon = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.MEMBER_JOINED:
      return <UserPlus size={16} className="text-green-500" />;
    case TeamActivityType.MEMBER_LEFT:
      return <UserMinus size={16} className="text-red-500" />;
    case TeamActivityType.MEMBER_INVITED:
      return <UserCheck size={16} className="text-blue-500" />;
    case TeamActivityType.MEMBER_DISMISSED:
      return <UserX size={16} className="text-red-600" />;
    case TeamActivityType.MEMBER_ROLE_CHANGED:
      return <Shield size={16} className="text-yellow-500" />;
    default:
      return <UserPlus size={16} />;
  }
};

export const TeamActivityItemMember: React.FC<TeamActivityItemMemberProps> = ({
  activity,
  onArchive
}) => {
  const icon = getMemberIcon(activity.type);

  return (
    <TeamActivityItemBase
      activity={activity}
      onArchive={onArchive}
      icon={icon}
    >
      {activity.metadata && (
        <div className="mt-2 text-sm text-gray-600">
          {activity.metadata.targetUserName && (
            <div>Участник: {activity.metadata.targetUserName}</div>
          )}
          {activity.metadata.oldRole && activity.metadata.newRole && (
            <div>
              Роль изменена: {activity.metadata.oldRole} → {activity.metadata.newRole}
            </div>
          )}
          {activity.metadata.role && (
            <div>Роль: {activity.metadata.role}</div>
          )}
        </div>
      )}
    </TeamActivityItemBase>
  );
};