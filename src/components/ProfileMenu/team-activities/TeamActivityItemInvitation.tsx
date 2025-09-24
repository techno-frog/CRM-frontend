import React from 'react';
import { Mail, MailCheck, MailX, MailMinus, Clock } from 'lucide-react';
import type { TeamActivity } from '../../../types/team-activities.types';
import { TeamActivityType } from '../../../types/team-activities.types';
import { TeamActivityItemBase } from './TeamActivityItemBase';

interface TeamActivityItemInvitationProps {
  activity: TeamActivity;
  onArchive: () => void;
}

const getInvitationIcon = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.INVITATION_CREATED:
      return <Mail size={16} className="text-blue-500" />;
    case TeamActivityType.INVITATION_ACCEPTED:
      return <MailCheck size={16} className="text-green-500" />;
    case TeamActivityType.INVITATION_DECLINED:
      return <MailX size={16} className="text-red-500" />;
    case TeamActivityType.INVITATION_REVOKED:
      return <MailMinus size={16} className="text-orange-500" />;
    case TeamActivityType.INVITATION_EXPIRED:
      return <Clock size={16} className="text-yellow-500" />;
    default:
      return <Mail size={16} />;
  }
};

export const TeamActivityItemInvitation: React.FC<TeamActivityItemInvitationProps> = ({
  activity,
  onArchive
}) => {
  const icon = getInvitationIcon(activity.type);

  return (
    <TeamActivityItemBase
      activity={activity}
      onArchive={onArchive}
      icon={icon}
    />
  );
};