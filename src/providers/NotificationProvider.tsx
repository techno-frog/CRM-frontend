import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useNotifications, useSystemNotifications, NotificationEventType } from '../hooks/useNotifications';
import type { NotificationEventData } from '../hooks/useNotifications';
import { useNotify } from '../hooks/useNotify';

// Context types
export interface NotificationContextType {
  // Connection state
  connectionStatus: 'connecting' | 'open' | 'closed';
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;

  // Event statistics
  eventCounts: Record<NotificationEventType, number>;
  totalEvents: number;

  // Recent events
  recentEvents: NotificationEventData[];
  clearRecentEvents: () => void;

  // Event handlers
  registerEventHandler: (type: NotificationEventType, handler: (data: NotificationEventData) => void) => () => void;

  // Test functionality
  sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export interface NotificationProviderProps {
  children: React.ReactNode;
  maxRecentEvents?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxRecentEvents = 50
}) => {
  const { status, connect, disconnect, reconnect, on, off, sendTestNotification } = useNotifications();
  const { success, info, error } = useNotify();

  // State for event tracking
  const [eventCounts, setEventCounts] = useState<Record<NotificationEventType, number>>(
    Object.values(NotificationEventType).reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<NotificationEventType, number>)
  );
  const [recentEvents, setRecentEvents] = useState<NotificationEventData[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);

  // Enable system notifications (auto-toast for system events)
  useSystemNotifications();

  // Global event handler to track all events
  useEffect(() => {
    const handleGlobalEvent = (data: NotificationEventData) => {
      // Update event counts
      setEventCounts(prev => ({
        ...prev,
        [data.type]: prev[data.type] + 1
      }));

      // Update total count
      setTotalEvents(prev => prev + 1);

      // Add to recent events (keep only latest N)
      setRecentEvents(prev => {
        const newEvents = [{ ...data, receivedAt: new Date().toISOString() } as NotificationEventData & { receivedAt: string }, ...prev];
        return newEvents.slice(0, maxRecentEvents);
      });

      // Show appropriate UI feedback based on event type
      handleEventFeedback(data);
    };

    // Register global listeners for all event types
    const unsubscribers = Object.values(NotificationEventType).map(type => {
      on(type, handleGlobalEvent);
      return () => off(type, handleGlobalEvent);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [on, off, maxRecentEvents]);

  // Handle event-specific UI feedback
  const handleEventFeedback = useCallback((data: NotificationEventData) => {
    switch (data.type) {
      case NotificationEventType.INVITE_RECEIVED:
        info({
          title: 'New Team Invitation',
          text: `You've been invited to join ${data.data.teamName}${data.data.inviterName ? ` by ${data.data.inviterName}` : ''}`
        });
        break;

      case NotificationEventType.TEAM_ACTIVITY:
        if (data.data.activity === 'member_joined') {
          info({
            title: 'Team Activity',
            text: `${data.data.actorName} joined ${data.data.teamName}`
          });
        } else if (data.data.activity === 'team_created') {
          success({
            title: 'Team Created',
            text: `Team "${data.data.teamName}" has been created`
          });
        }
        break;

      case NotificationEventType.TASK_RECEIVED:
        info({
          title: 'New Task',
          text: `You've been assigned: ${data.data.taskTitle}`
        });
        break;

      case NotificationEventType.USER_STATUS_CHANGED:
        // Don't show toast for status changes to avoid spam
        console.log(`[NOTIFICATIONS] User status: ${data.data.userName} is ${data.data.status}`);
        break;

      case NotificationEventType.DIRECT_MESSAGE:
        info({
          title: 'New Message',
          text: `Message from ${data.data.senderName}: ${data.data.preview}`
        });
        break;

      case NotificationEventType.SYSTEM_NOTIFICATION:
        // Handled by useSystemNotifications hook
        break;

      default:
        console.log('[NOTIFICATIONS] Unhandled event type:', data.type);
    }
  }, [info, success]);

  // Clear recent events
  const clearRecentEvents = useCallback(() => {
    setRecentEvents([]);
  }, []);

  // Register custom event handler
  const registerEventHandler = useCallback((
    type: NotificationEventType,
    handler: (data: NotificationEventData) => void
  ) => {
    on(type, handler);
    return () => off(type, handler);
  }, [on, off]);

  const contextValue: NotificationContextType = {
    connectionStatus: status,
    connect,
    disconnect,
    reconnect,
    eventCounts,
    totalEvents,
    recentEvents,
    clearRecentEvents,
    registerEventHandler,
    sendTestNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notification context
export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

// Convenience hooks for specific event types
export const useInviteNotifications = (handler: (data: NotificationEventData) => void) => {
  const { registerEventHandler } = useNotificationContext();

  useEffect(() => {
    const unsubscribe = registerEventHandler(NotificationEventType.INVITE_RECEIVED, handler);
    return unsubscribe;
  }, [handler, registerEventHandler]);
};

export const useTeamActivityNotifications = (handler: (data: NotificationEventData) => void) => {
  const { registerEventHandler } = useNotificationContext();

  useEffect(() => {
    const unsubscribe = registerEventHandler(NotificationEventType.TEAM_ACTIVITY, handler);
    return unsubscribe;
  }, [handler, registerEventHandler]);
};

export const useTaskNotifications = (handler: (data: NotificationEventData) => void) => {
  const { registerEventHandler } = useNotificationContext();

  useEffect(() => {
    const unsubscribe = registerEventHandler(NotificationEventType.TASK_RECEIVED, handler);
    return unsubscribe;
  }, [handler, registerEventHandler]);
};