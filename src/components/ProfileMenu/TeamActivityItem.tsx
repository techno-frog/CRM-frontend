import React from 'react';
import type { TeamActivity } from '../../types/team-activities.types';
import { TeamActivityType } from '../../types/team-activities.types';
import { useArchiveTeamActivityMutation } from '../../api/teamActivitiesApi';
import { TeamActivityItemMember } from './team-activities/TeamActivityItemMember';
import { TeamActivityItemTask } from './team-activities/TeamActivityItemTask';
import { TeamActivityItemEvent } from './team-activities/TeamActivityItemEvent';
import { TeamActivityItemRole } from './team-activities/TeamActivityItemRole';
import { TeamActivityItemInvitation } from './team-activities/TeamActivityItemInvitation';
import { TeamActivityItemDocument } from './team-activities/TeamActivityItemDocument';
import { TeamActivityItemTeam } from './team-activities/TeamActivityItemTeam';
import { TeamActivityItemDeal } from './team-activities/TeamActivityItemDeal';
import { TeamActivityItemProject } from './team-activities/TeamActivityItemProject';
import { TeamActivityItemMeeting } from './team-activities/TeamActivityItemMeeting';
import { TeamActivityItemSystem } from './team-activities/TeamActivityItemSystem';

interface TeamActivityItemProps {
  activity: TeamActivity;
  onArchive: (activityId: string) => void;
}

export const TeamActivityItem: React.FC<TeamActivityItemProps> = ({ activity, onArchive }) => {
  const [archiveActivity] = useArchiveTeamActivityMutation();

  const handleArchive = async () => {
    if (!activity.isArchived) {
      try {
        await archiveActivity({ id: activity.id, teamId: activity.teamId }).unwrap();
        onArchive(activity.id);
      } catch (error) {
        console.error('Failed to archive team activity:', error);
      }
    }
  };

  // Route to appropriate activity item component based on type
  switch (activity.type) {
    case TeamActivityType.MEMBER_JOINED:
    case TeamActivityType.MEMBER_LEFT:
    case TeamActivityType.MEMBER_INVITED:
    case TeamActivityType.MEMBER_DISMISSED:
    case TeamActivityType.MEMBER_ROLE_CHANGED:
      return (
        <TeamActivityItemMember
          activity={activity}
          onArchive={handleArchive}
        />
      );

    case TeamActivityType.TASK_CREATED:
    case TeamActivityType.TASK_COMPLETED:
    case TeamActivityType.TASK_ASSIGNED:
      return (
        <TeamActivityItemTask
          activity={activity}
          onArchive={handleArchive}
        />
      );

    case TeamActivityType.EVENT_CREATED:
    case TeamActivityType.EVENT_STARTED:
    case TeamActivityType.EVENT_COMPLETED:
      return (
        <TeamActivityItemEvent
          activity={activity}
          onArchive={handleArchive}
        />
      );

    case TeamActivityType.ROLE_ASSIGNED:
    case TeamActivityType.ROLE_REMOVED:
      return (
        <TeamActivityItemRole
          activity={activity}
          onArchive={handleArchive}
        />
      );

    case TeamActivityType.INVITATION_CREATED:
    case TeamActivityType.INVITATION_ACCEPTED:
    case TeamActivityType.INVITATION_DECLINED:
    case TeamActivityType.INVITATION_REVOKED:
    case TeamActivityType.INVITATION_EXPIRED:
      return (
        <TeamActivityItemInvitation
          activity={activity}
          onArchive={handleArchive}
        />
      );

    case TeamActivityType.DOCUMENT_UPLOADED:
    case TeamActivityType.DOCUMENT_DELETED:
    case TeamActivityType.DOCUMENT_SHARED:
      return (
        <TeamActivityItemDocument
          activity={activity}
          onArchive={handleArchive}
        />
      );

    case TeamActivityType.TEAM_CREATED:
    case TeamActivityType.TEAM_STATUS_CHANGED:
    case TeamActivityType.TEAM_SETTINGS_UPDATED:
    case TeamActivityType.TEAM_DESCRIPTION_UPDATED:
      return (
        <TeamActivityItemTeam
          activity={activity}
          onArchive={handleArchive}
        />
      );

    case TeamActivityType.DEAL_CREATED:
    case TeamActivityType.DEAL_UPDATED:
    case TeamActivityType.DEAL_CLOSED:
      return (
        <TeamActivityItemDeal
          activity={activity}
          onArchive={handleArchive}
        />
      );

    case TeamActivityType.PROJECT_CREATED:
    case TeamActivityType.PROJECT_COMPLETED:
    case TeamActivityType.MILESTONE_REACHED:
      return (
        <TeamActivityItemProject
          activity={activity}
          onArchive={handleArchive}
        />
      );

    case TeamActivityType.MEETING_SCHEDULED:
    case TeamActivityType.MEETING_COMPLETED:
      return (
        <TeamActivityItemMeeting
          activity={activity}
          onArchive={handleArchive}
        />
      );

    case TeamActivityType.ANNOUNCEMENT_POSTED:
    case TeamActivityType.INTEGRATION_CONNECTED:
    case TeamActivityType.INTEGRATION_DISCONNECTED:
    case TeamActivityType.BACKUP_CREATED:
    case TeamActivityType.SECURITY_ALERT:
    default:
      // Fallback to system item for other types
      return (
        <TeamActivityItemSystem
          activity={activity}
          onArchive={handleArchive}
        />
      );
  }
};