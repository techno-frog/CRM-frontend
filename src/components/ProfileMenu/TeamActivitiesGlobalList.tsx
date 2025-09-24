import React, { useState, useCallback } from 'react';
import { Clock, RefreshCw, Users } from 'lucide-react';
import { useGetGlobalTeamActivitiesQuery } from '../../api/teamActivitiesApi';
import { useTeamActivityRefetch } from '../../hooks/useTeamActivityRefetch';
import { TeamActivityItem } from './TeamActivityItem';

import css from './ActivitiesList.module.css';
import type { TeamActivity } from '../../types/team-activities.types';

interface TeamActivitiesGroup {
  teamId: string;
  teamName: string;
  activities: TeamActivity[];
}

export const TeamActivitiesGlobalList: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);

  // Setup auto-refetch for global team activities
  useTeamActivityRefetch({ enableGlobalRefetch: true });

  // Fetch recent global activities (limit 20 for all teams)
  const {
    data: globalData,
    isLoading,
    refetch
  } = useGetGlobalTeamActivitiesQuery({
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const handleArchiveActivity = useCallback(async (_activityId: string) => {
    try {
      // Refetch to update the list after archiving
      refetch();
    } catch (error) {
      console.error('Failed to archive team activity:', error);
    }
  }, [refetch]);

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  // Group activities by team
  const groupActivitiesByTeam = (activities: TeamActivity[]): TeamActivitiesGroup[] => {
    const groups: Record<string, TeamActivitiesGroup> = {};

    activities.forEach(activity => {
      if (!groups[activity.teamId]) {
        groups[activity.teamId] = {
          teamId: activity.teamId,
          teamName: activity.teamName || 'Неизвестная команда',
          activities: []
        };
      }
      groups[activity.teamId].activities.push(activity);
    });

    // Sort groups by latest activity
    return Object.values(groups).sort((a, b) => {
      const latestA = new Date(a.activities[0].createdAt).getTime();
      const latestB = new Date(b.activities[0].createdAt).getTime();
      return latestB - latestA;
    });
  };

  const activities = globalData?.activities || [];
  const recentActivities = showHistory ? activities : activities.slice(0, 15);
  const groupedActivities = groupActivitiesByTeam(recentActivities);

  return (
    <div className={css.container}>
      {/* Global Activities Section */}
      <div className={css.section}>
        <h3 className={css.sectionTitle}>
          <Users size={16} />
          Активности команд
          {activities.length > 0 && (
            <span className={css.badge}>{activities.length}</span>
          )}
        </h3>

        <div className={css.sectionContent}>
          {isLoading ? (
            <div className={css.loading}>
              <RefreshCw size={16} className={css.spinner} />
              Загрузка...
            </div>
          ) : activities.length === 0 ? (
            <div className={css.empty}>
              <Users size={32} className={css.emptyIcon} />
              <p className={css.emptyText}>Нет активностей в командах</p>
              <p className={css.emptyText} style={{ fontSize: '12px', marginTop: '4px' }}>
                Подпишитесь на уведомления команды для получения активностей
              </p>
            </div>
          ) : (
            <div className={css.activitiesList}>
              {groupedActivities.map((group) => (
                <div key={group.teamId} style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#6b7280',
                    marginBottom: '8px',

                    borderLeft: '3px solid #10b981',
                    paddingLeft: '8px'
                  }}>
                    {group.teamName}
                  </div>
                  {group.activities.map((activity) => (
                    <TeamActivityItem
                      key={activity.id}
                      activity={activity}
                      onArchive={handleArchiveActivity}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Show More Button */}
          {!showHistory && activities.length > 15 && (
            <button className={css.historyButton} onClick={handleShowHistory}>
              <Clock size={16} />
              Показать все активности ({activities.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};