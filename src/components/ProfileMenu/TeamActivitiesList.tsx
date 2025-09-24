import React, { useState, useCallback } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { useGetTeamActivitiesQuery } from '../../api/teamActivitiesApi';
import { TeamActivityItem } from './TeamActivityItem';
import css from './ActivitiesList.module.css';

interface TeamActivitiesListProps {
  teamId: string;
}

export const TeamActivitiesList: React.FC<TeamActivitiesListProps> = ({ teamId }) => {
  const [showHistory, setShowHistory] = useState(false);

  // Fetch recent activities (not archived)
  const {
    data: recentData,
    isLoading: isLoadingRecent,
    refetch: refetchRecent
  } = useGetTeamActivitiesQuery({
    teamId,
    isArchived: false,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch archived activities (history) only when needed
  const {
    data: archivedData,
    isLoading: isLoadingArchived,
    refetch: refetchArchived
  } = useGetTeamActivitiesQuery({
    teamId,
    isArchived: true,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }, {
    skip: !showHistory
  });

  const handleArchiveActivity = useCallback(async (_activityId: string) => {
    try {
      // This will be handled by the TeamActivityItem component
      // Refetch to update the lists
      refetchRecent();
      if (showHistory) {
        refetchArchived();
      }
    } catch (error) {
      console.error('Failed to archive team activity:', error);
    }
  }, [refetchRecent, refetchArchived, showHistory]);

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  const recentActivities = recentData?.activities || [];
  const archivedActivities = archivedData?.activities || [];

  return (
    <div className={css.container}>
      {/* Recent Activities Section */}
      <div className={css.section}>
        <h3 className={css.sectionTitle}>
          Активность команды
          {recentActivities.length > 0 && (
            <span className={css.badge}>{recentActivities.length}</span>
          )}
        </h3>

        <div className={css.sectionContent}>
          {isLoadingRecent ? (
            <div className={css.loading}>
              <RefreshCw size={16} className={css.spinner} />
              Загрузка...
            </div>
          ) : recentActivities.length === 0 ? (
            <div className={css.empty}>
              <Clock size={32} className={css.emptyIcon} />
              <p className={css.emptyText}>Нет активностей команды</p>
            </div>
          ) : (
            <div className={css.activitiesList}>
              {recentActivities.map((activity) => (
                <TeamActivityItem
                  key={activity.id}
                  activity={activity}
                  onArchive={handleArchiveActivity}
                />
              ))}
            </div>
          )}

          {/* History Button */}
          {!showHistory && (
            <button className={css.historyButton} onClick={handleShowHistory}>
              <Clock size={16} />
              История активностей
            </button>
          )}
        </div>
      </div>

      {/* History Section */}
      {showHistory && (
        <div className={css.section}>
          <h3 className={css.sectionTitle}>История активностей команды</h3>

          {isLoadingArchived ? (
            <div className={css.loading}>
              <RefreshCw size={16} className={css.spinner} />
              Загрузка...
            </div>
          ) : archivedActivities.length === 0 ? (
            <div className={css.empty}>
              <p className={css.emptyText}>История пуста</p>
            </div>
          ) : (
            <div className={css.activitiesList}>
              {archivedActivities.map((activity) => (
                <TeamActivityItem
                  key={activity.id}
                  activity={activity}
                  onArchive={handleArchiveActivity}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};