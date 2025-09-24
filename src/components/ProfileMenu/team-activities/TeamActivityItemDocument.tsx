import React from 'react';
import { FileUp, FileX, Share } from 'lucide-react';
import type { TeamActivity } from '../../../types/team-activities.types';
import { TeamActivityType } from '../../../types/team-activities.types';
import { TeamActivityItemBase } from './TeamActivityItemBase';

interface TeamActivityItemDocumentProps {
  activity: TeamActivity;
  onArchive: () => void;
}

const getDocumentIcon = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.DOCUMENT_UPLOADED:
      return <FileUp size={16} className="text-green-500" />;
    case TeamActivityType.DOCUMENT_DELETED:
      return <FileX size={16} className="text-red-500" />;
    case TeamActivityType.DOCUMENT_SHARED:
      return <Share size={16} className="text-blue-500" />;
    default:
      return <FileUp size={16} />;
  }
};

export const TeamActivityItemDocument: React.FC<TeamActivityItemDocumentProps> = ({
  activity,
  onArchive
}) => {
  const icon = getDocumentIcon(activity.type);

  return (
    <TeamActivityItemBase
      activity={activity}
      onArchive={onArchive}
      icon={icon}
    />
  );
};