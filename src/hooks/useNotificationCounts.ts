import { useState, useEffect } from 'react';
import { notificationService, NotificationEventType } from '../services/NotificationService';

export interface NotificationCounts {
  personal: number;
  team: number;
  total: number;
}

export const useNotificationCounts = () => {
  const [counts, setCounts] = useState<NotificationCounts>({
    personal: 0,
    team: 0,
    total: 0
  });

  useEffect(() => {
    // Handler для личных уведомлений
    const handlePersonalNotification = () => {
      setCounts(prev => ({
        ...prev,
        personal: prev.personal + 1,
        total: prev.total + 1
      }));
    };

    // Handler для командных уведомлений
    const handleTeamNotification = () => {
      setCounts(prev => ({
        ...prev,
        team: prev.team + 1,
        total: prev.total + 1
      }));
    };

    // Регистрируем обработчики для разных типов уведомлений

    // Личные уведомления
    notificationService.on(NotificationEventType.INVITE_RECEIVED, handlePersonalNotification);
    notificationService.on(NotificationEventType.TASK_RECEIVED, handlePersonalNotification);
    notificationService.on(NotificationEventType.DIRECT_MESSAGE, handlePersonalNotification);
    notificationService.on(NotificationEventType.SYSTEM_NOTIFICATION, handlePersonalNotification);

    // Командные уведомления
    notificationService.on(NotificationEventType.TEAM_ACTIVITY_CREATED, handleTeamNotification);
    notificationService.on(NotificationEventType.TEAM_ACTIVITY, handleTeamNotification);

    return () => {
      // Очищаем обработчики при размонтировании
      notificationService.off(NotificationEventType.INVITE_RECEIVED, handlePersonalNotification);
      notificationService.off(NotificationEventType.TASK_RECEIVED, handlePersonalNotification);
      notificationService.off(NotificationEventType.DIRECT_MESSAGE, handlePersonalNotification);
      notificationService.off(NotificationEventType.SYSTEM_NOTIFICATION, handlePersonalNotification);

      notificationService.off(NotificationEventType.TEAM_ACTIVITY_CREATED, handleTeamNotification);
      notificationService.off(NotificationEventType.TEAM_ACTIVITY, handleTeamNotification);
    };
  }, []);

  // Функция для сброса счетчиков
  const resetCounts = (type?: 'personal' | 'team') => {
    if (type === 'personal') {
      setCounts(prev => ({
        ...prev,
        personal: 0,
        total: prev.total - prev.personal
      }));
    } else if (type === 'team') {
      setCounts(prev => ({
        ...prev,
        team: 0,
        total: prev.total - prev.team
      }));
    } else {
      setCounts({
        personal: 0,
        team: 0,
        total: 0
      });
    }
  };

  return {
    counts,
    resetCounts
  };
};