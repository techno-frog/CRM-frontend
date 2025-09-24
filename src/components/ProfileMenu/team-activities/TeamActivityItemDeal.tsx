import React from 'react';
import { DollarSign, Edit, CheckCircle } from 'lucide-react';
import type { TeamActivity } from '../../../types/team-activities.types';
import { TeamActivityType } from '../../../types/team-activities.types';
import { TeamActivityItemBase } from './TeamActivityItemBase';

interface TeamActivityItemDealProps {
  activity: TeamActivity;
  onArchive: () => void;
}

const getDealIcon = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.DEAL_CREATED:
      return <DollarSign size={16} className="text-green-500" />;
    case TeamActivityType.DEAL_UPDATED:
      return <Edit size={16} className="text-blue-500" />;
    case TeamActivityType.DEAL_CLOSED:
      return <CheckCircle size={16} className="text-green-600" />;
    default:
      return <DollarSign size={16} />;
  }
};

export const TeamActivityItemDeal: React.FC<TeamActivityItemDealProps> = ({
  activity,
  onArchive
}) => {
  const icon = getDealIcon(activity.type);

  return (
    <TeamActivityItemBase
      activity={activity}
      onArchive={onArchive}
      icon={icon}
    />
  );
};