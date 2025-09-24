import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { notificationService, NotificationEventType, type NotificationEventData, } from '../services/NotificationService';
import { teamActivitiesApi } from '../api/teamActivitiesApi';

interface TeamActivityRefetchOptions {
  teamId?: string; // If provided, will refetch activities for specific team
  enableGlobalRefetch?: boolean; // If true, will refetch global activities
}

export const useTeamActivityRefetch = (options: TeamActivityRefetchOptions = {}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Handler for team activity notifications
    const handleTeamActivityNotification = (data: NotificationEventData) => {
      console.log('[useTeamActivityRefetch] Received team activity notification:', data);

      // Parse team activity data from notification
      if (data.type === NotificationEventType.TEAM_ACTIVITY_CREATED) {
        const activityData = data.data as {
          teamId: string;
          teamName: string;
          activityType: string;
          activityTitle: string;
          actorName: string;
          activityId: string;
        };

        // Refetch specific team activities if teamId matches
        if (options.teamId && activityData.teamId === options.teamId) {
          console.log('[useTeamActivityRefetch] Refetching activities for team:', activityData.teamId);
          dispatch(
            teamActivitiesApi.util.invalidateTags([
              { type: 'TeamActivities', id: activityData.teamId }
            ])
          );
        }

        // Refetch global activities if enabled
        if (options.enableGlobalRefetch) {
          console.log('[useTeamActivityRefetch] Refetching global team activities');
          dispatch(
            teamActivitiesApi.util.invalidateTags(['TeamActivities'])
          );
        }
      }
    };

    // Subscribe to team activity notifications
    notificationService.on(NotificationEventType.TEAM_ACTIVITY_CREATED, handleTeamActivityNotification);

    return () => {
      // Unsubscribe on cleanup
      notificationService.off(NotificationEventType.TEAM_ACTIVITY_CREATED, handleTeamActivityNotification);
    };
  }, [dispatch, options.teamId, options.enableGlobalRefetch]);

  // Return utility functions for manual refetch if needed
  return {
    refetchTeamActivities: (teamId: string) => {
      dispatch(
        teamActivitiesApi.util.invalidateTags([
          { type: 'TeamActivities', id: teamId }
        ])
      );
    },
    refetchGlobalActivities: () => {
      dispatch(
        teamActivitiesApi.util.invalidateTags(['TeamActivities'])
      );
    }
  };
};