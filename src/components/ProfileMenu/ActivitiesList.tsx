import React, { useState, useCallback } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { useGetActivitiesQuery, useMarkActivityAsReadMutation } from '../../api/activitiesApi';
import { ActivityStatus } from '../../types/activities.types';
import { ActivityItem } from './ActivityItem';
import css from './ActivitiesList.module.css';

export const ActivitiesList: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [markAsRead] = useMarkActivityAsReadMutation();

  // Fetch unread activities
  const {
    data: unreadData,
    isLoading: isLoadingUnread,
    refetch: refetchUnread
  } = useGetActivitiesQuery({
    status: ActivityStatus.UNREAD,
    limit: 10
  });

  // Fetch read activities (history) only when needed
  const {
    data: readData,
    isLoading: isLoadingRead,
    refetch: refetchRead
  } = useGetActivitiesQuery({
    status: ActivityStatus.READ,
    limit: 20
  }, {
    skip: !showHistory
  });

  const handleMarkAsRead = useCallback(async (activityId: string) => {
    try {
      await markAsRead(activityId).unwrap();
      // Refetch to update the lists
      refetchUnread();
      if (showHistory) {
        refetchRead();
      }
    } catch (error) {
      console.error('Failed to mark activity as read:', error);
    }
  }, [markAsRead, refetchUnread, refetchRead, showHistory]);

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  const unreadActivities = unreadData?.activities || [];
  const readActivities = readData?.activities || [];

  return (
    <div className={css.container}>
      {/* New Activities Section */}
      <div className={css.section}>
        <h3 className={css.sectionTitle}>
          Новые активности
          {unreadActivities.length > 0 && (
            <span className={css.badge}>{unreadActivities.length}</span>
          )}
        </h3>

        <div className={css.sectionContent}>
          {isLoadingUnread ? (
            <div className={css.loading}>
              <RefreshCw size={16} className={css.spinner} />
              Загрузка...
            </div>
          ) : unreadActivities.length === 0 ? (
            <div className={css.empty}>
              <Clock size={32} className={css.emptyIcon} />
              <p className={css.emptyText}>Нет новых активностей</p>
            </div>
          ) : (
            <div className={css.activitiesList}>
              {unreadActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onMarkRead={handleMarkAsRead}
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
          <h3 className={css.sectionTitle}>История активностей</h3>

          {isLoadingRead ? (
            <div className={css.loading}>
              <RefreshCw size={16} className={css.spinner} />
              Загрузка...
            </div>
          ) : readActivities.length === 0 ? (
            <div className={css.empty}>
              <p className={css.emptyText}>История пуста</p>
            </div>
          ) : (
            <div className={css.activitiesList}>
              {readActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onMarkRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};