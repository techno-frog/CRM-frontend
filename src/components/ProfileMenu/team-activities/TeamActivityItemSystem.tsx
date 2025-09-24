import React from 'react';
import { Bell, Megaphone, Link, Unlink, HardDrive, Shield } from 'lucide-react';
import type { TeamActivity } from '../../../types/team-activities.types';
import { TeamActivityType } from '../../../types/team-activities.types';
import { TeamActivityItemBase } from './TeamActivityItemBase';

interface TeamActivityItemSystemProps {
  activity: TeamActivity;
  onArchive: () => void;
}

const getSystemIcon = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.ANNOUNCEMENT_POSTED:
      return <Megaphone size={16} className="text-blue-500" />;
    case TeamActivityType.INTEGRATION_CONNECTED:
      return <Link size={16} className="text-green-500" />;
    case TeamActivityType.INTEGRATION_DISCONNECTED:
      return <Unlink size={16} className="text-red-500" />;
    case TeamActivityType.BACKUP_CREATED:
      return <HardDrive size={16} className="text-blue-500" />;
    case TeamActivityType.SECURITY_ALERT:
      return <Shield size={16} className="text-red-600" />;
    default:
      return <Bell size={16} className="text-gray-500" />;
  }
};

export const TeamActivityItemSystem: React.FC<TeamActivityItemSystemProps> = ({
  activity,
  onArchive
}) => {
  const icon = getSystemIcon(activity.type);

  return (
    <TeamActivityItemBase
      activity={activity}
      onArchive={onArchive}
      icon={icon}
    >
      {activity.metadata && (
        <div className="mt-2 text-sm text-gray-600">
          {activity.metadata.message && (
            <div>{activity.metadata.message}</div>
          )}
          {activity.metadata.integrationName && (
            <div>Интеграция: {activity.metadata.integrationName}</div>
          )}
          {activity.metadata.backupSize && (
            <div>Размер резервной копии: {activity.metadata.backupSize}</div>
          )}
          {activity.metadata.alertLevel && (
            <div>Уровень тревоги: {activity.metadata.alertLevel}</div>
          )}
        </div>
      )}
    </TeamActivityItemBase>
  );
};