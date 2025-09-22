import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { notificationService, NotificationEventType } from '../services/NotificationService';
import type { NotificationEventData } from '../services/NotificationService';
import { useNotify } from './useNotify';
import type { RootState } from '../store/store';
import { authApi } from '../api/authApi';
import { store } from '../store/store';
import { soundService } from '../services/SoundService';

// Re-export types and enums for easier imports
export { NotificationEventType } from '../services/NotificationService';
export type { NotificationEventData } from '../services/NotificationService';

export interface UseNotificationsOptions {
  autoConnect?: boolean;
}

export interface NotificationConnection {
  status: 'connecting' | 'open' | 'closed';
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  on: (type: NotificationEventType, handler: (data: NotificationEventData) => void) => void;
  off: (type: NotificationEventType, handler: (data: NotificationEventData) => void) => void;
  sendTestNotification: () => Promise<void>;
}

export const useNotifications = (options: UseNotificationsOptions = {}): NotificationConnection => {
  const { autoConnect = true } = options;

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closed'>('closed');
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  // Update connection status
  const updateConnectionStatus = useCallback(() => {
    setConnectionStatus(notificationService.getConnectionStatus());
  }, []);

  // Setup status monitoring
  useEffect(() => {
    const interval = setInterval(updateConnectionStatus, 1000);
    return () => clearInterval(interval);
  }, [updateConnectionStatus]);

  // Handle authentication changes
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      console.log('[useNotifications] Token updated, setting new token in NotificationService');
      notificationService.setAccessToken(accessToken);

      if (autoConnect) {
        notificationService.connect();
      }
    } else {
      notificationService.disconnect();
    }

    updateConnectionStatus();
  }, [isAuthenticated, accessToken, autoConnect, updateConnectionStatus]);

  // Watch for token changes and automatically reconnect if connected
  useEffect(() => {
    if (accessToken) {
      console.log('[useNotifications] Access token changed, updating NotificationService');
      notificationService.setAccessToken(accessToken);

      // If we're supposed to be connected but aren't, reconnect
      const status = notificationService.getConnectionStatus();
      if (isAuthenticated && autoConnect && status === 'closed') {
        console.log('[useNotifications] Auto-reconnecting with fresh token');
        notificationService.connect();
      }
    }
  }, [accessToken, isAuthenticated, autoConnect]);

  // Periodic token refresh monitoring for SSE
  useEffect(() => {
    if (!accessToken || !isAuthenticated) return;

    const checkTokenAndReconnect = () => {
      const status = notificationService.getConnectionStatus();
      if (status === 'open' && accessToken) {
        // Check if token will expire soon (within 2 minutes)
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const exp = payload.exp * 1000;
          const now = Date.now();
          const fiveSeconds = 5 * 1000;

          if (exp <= (now + fiveSeconds)) {
            console.log('[useNotifications] Token expiring soon, will be refreshed by next API call');
            // The token will be refreshed automatically on next API call
            // We just need to be ready to reconnect when it happens
          }
        } catch (error) {
          console.error('[useNotifications] Error checking token expiration:', error);
        }
      }
    };

    // Check every 10 seconds for fast testing
    const interval = setInterval(checkTokenAndReconnect, 10000);
    return () => clearInterval(interval);
  }, [accessToken, isAuthenticated]);

  // Connect manually
  const connect = useCallback(() => {
    if (accessToken) {
      // Always use fresh token from Redux store
      notificationService.setAccessToken(accessToken);
      notificationService.connect();
      updateConnectionStatus();
    } else {
      console.warn('[useNotifications] Cannot connect: no access token');
    }
  }, [accessToken, updateConnectionStatus]);

  // Disconnect manually
  const disconnect = useCallback(() => {
    notificationService.disconnect();
    updateConnectionStatus();
  }, [updateConnectionStatus]);

  // Register event handler
  const on = useCallback((type: NotificationEventType, handler: (data: NotificationEventData) => void) => {
    notificationService.on(type, handler);
  }, []);

  // Unregister event handler
  const off = useCallback((type: NotificationEventType, handler: (data: NotificationEventData) => void) => {
    notificationService.off(type, handler);
  }, []);

  // Send test notification with automatic token refresh
  const sendTestNotification = useCallback(async () => {
    try {
      console.log('[useNotifications] Starting sendTestNotification...');

      // Log current token before refresh
      const beforeState = store.getState();
      const beforeToken = beforeState.auth.accessToken;
      console.log('[useNotifications] Token BEFORE getMe call:', beforeToken ? beforeToken.substring(0, 20) + '...' : 'MISSING');
      console.log('[useNotifications] Token BEFORE getMe (full last 10 chars):', beforeToken ? '...' + beforeToken.slice(-10) : 'MISSING');

      // Check what token NotificationService currently has
      const currentServiceStatus = notificationService.getConnectionStatus();
      console.log('[useNotifications] NotificationService connection status before refresh:', currentServiceStatus);

      // First try to refresh token by making an API call
      console.log('[useNotifications] Calling getMe to refresh token...');
      const meResponse = await dispatch(authApi.endpoints.getMe.initiate()).unwrap();
      console.log('[useNotifications] getMe response received:', !!meResponse);

      // Get the fresh token directly from current Redux state after dispatch
      const currentState = store.getState();
      const freshToken = currentState.auth.accessToken;

      console.log('[useNotifications] Token AFTER getMe call:', freshToken ? freshToken.substring(0, 20) + '...' : 'MISSING');
      console.log('[useNotifications] Token AFTER getMe (full last 10 chars):', freshToken ? '...' + freshToken.slice(-10) : 'MISSING');

      // Compare tokens
      const tokensMatch = beforeToken === freshToken;
      console.log('[useNotifications] Token changed during getMe call:', !tokensMatch);

      // Now use the fresh token
      if (freshToken) {
        console.log('[useNotifications] Setting fresh token in NotificationService...');
        notificationService.setAccessToken(freshToken);
        console.log('[useNotifications] Token set in NotificationService successfully');
      } else {
        console.error('[useNotifications] No fresh token available after getMe call!');
      }

      console.log('[useNotifications] Calling notificationService.sendTestNotification...');
      await notificationService.sendTestNotification();
      console.log('[useNotifications] sendTestNotification completed successfully');
    } catch (error) {
      console.error('[useNotifications] Test notification failed:', error);
      throw error;
    }
  }, [dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't disconnect on unmount as we want to keep connection alive
      // across component unmounts
    };
  }, []);

  // Force reconnect with token refresh
  const reconnect = useCallback(async () => {
    try {
      // Make a simple API call to trigger token refresh if needed
      await dispatch(authApi.endpoints.getMe.initiate()).unwrap();

      // Get the fresh token directly from current Redux state after dispatch
      const currentState = store.getState();
      const freshToken = currentState.auth.accessToken;

      console.log('[useNotifications] Reconnecting with fresh token:', freshToken ? freshToken.substring(0, 20) + '...' : 'MISSING');

      // Now use the fresh token
      if (freshToken) {
        notificationService.setAccessToken(freshToken);
      }
      notificationService.reconnect();
      updateConnectionStatus();
    } catch (error) {
      console.error('[useNotifications] Failed to refresh token before reconnect:', error);
      // Try reconnect anyway with current token
      notificationService.reconnect();
      updateConnectionStatus();
    }
  }, [updateConnectionStatus, dispatch]);

  return {
    status: connectionStatus,
    connect,
    disconnect,
    reconnect,
    on,
    off,
    sendTestNotification
  };
};

// Hook for listening to specific event type
export const useNotificationListener = (
  type: NotificationEventType,
  handler: (data: NotificationEventData) => void,
  deps: React.DependencyList = []
) => {
  const { on, off } = useNotifications({ autoConnect: true });

  useEffect(() => {
    on(type, handler);

    return () => {
      off(type, handler);
    };
  }, [type, handler, on, off, ...deps]);
};

// Hook for system notifications (shows toast)
export const useSystemNotifications = () => {
  const { success, error, info } = useNotify();

  useNotificationListener(
    NotificationEventType.SYSTEM_NOTIFICATION,
    useCallback((data: NotificationEventData) => {
      const { title, message, severity } = data.data;

      switch (severity) {
        case 'success':
          success({ title, text: message });
          break;
        case 'error':
          error({ title, text: message });
          break;
        case 'warning':
          // Assuming warning uses error styling
          error({ title, text: message });
          break;
        case 'info':
        default:
          info({ title, text: message });
          break;
      }
    }, [success, error, info]),
    [success, error, info]
  );
};

// Hook for team invite notifications (shows toast, plays sound, changes title)
export const useTeamInviteNotifications = () => {
  const { info } = useNotify();

  useEffect(() => {
    console.log('[useTeamInviteNotifications] Initializing services...');

    // Initialize sound service on first user interaction
    const initSound = () => {
      console.log('[useTeamInviteNotifications] Initializing sound on user interaction');
      soundService.initUserInteraction();
      document.removeEventListener('click', initSound);
      document.removeEventListener('keydown', initSound);
    };

    document.addEventListener('click', initSound);
    document.addEventListener('keydown', initSound);

    return () => {
      document.removeEventListener('click', initSound);
      document.removeEventListener('keydown', initSound);
    };
  }, []);

  useNotificationListener(
    NotificationEventType.INVITE_RECEIVED,
    useCallback(async (data: NotificationEventData) => {
      console.log('[TEAM_INVITE] Received invite notification:', data);

      const { teamName, inviterName, role } = data.data;

      try {
        // 1. Play notification sound
        console.log('[TEAM_INVITE] Playing notification sound...');
        await soundService.playNotificationSound();

        // 2. Simple title change
        console.log('[TEAM_INVITE] Updating browser title...');
        document.title = 'НОВОЕ УВЕДОМЛЕНИЕ';

        // 3. Show toast notification
        console.log('[TEAM_INVITE] Showing toast notification...');
        info({
          title: 'Приглашение в команду',
          text: `${inviterName} приглашает вас в команду "${teamName}" как ${role}`
        });

        console.log('[TEAM_INVITE] All notifications completed successfully');
      } catch (error) {
        console.error('[TEAM_INVITE] Error handling invite notification:', error);

        // Still show toast even if sound/title failed
        info({
          title: 'Приглашение в команду',
          text: `${inviterName} приглашает вас в команду "${teamName}" как ${role}`
        });
      }
    }, [info]),
    [info]
  );
};