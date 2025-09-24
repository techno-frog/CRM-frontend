import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';
import type { TeamActivity } from '../../../types/team-activities.types';
import { TeamActivityType } from '../../../types/team-activities.types';
import { TeamActivityItemBase } from './TeamActivityItemBase';

interface TeamActivityItemMeetingProps {
  activity: TeamActivity;
  onArchive: () => void;
}

const getMeetingIcon = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.MEETING_SCHEDULED:
      return <Calendar size={16} className="text-blue-500" />;
    case TeamActivityType.MEETING_COMPLETED:
      return <CheckCircle size={16} className="text-green-500" />;
    default:
      return <Calendar size={16} />;
  }
};

export const TeamActivityItemMeeting: React.FC<TeamActivityItemMeetingProps> = ({
  activity,
  onArchive
}) => {
  const icon = getMeetingIcon(activity.type);

  return (
    <TeamActivityItemBase
      activity={activity}
      onArchive={onArchive}
      icon={icon}
    />
  );
};