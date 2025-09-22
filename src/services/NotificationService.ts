export enum NotificationEventType {
  TEAM_ACTIVITY = 'team.activity',
  TASK_RECEIVED = 'task.received',
  INVITE_RECEIVED = 'invite.received',
  DIRECT_MESSAGE = 'message.direct',
  SYSTEM_NOTIFICATION = 'system.notification',
  USER_STATUS_CHANGED = 'user.status.changed'
}

export interface NotificationEventData {
  id: string;
  type: NotificationEventType;
  userId: string;
  data: any;
  timestamp: string;
  read?: boolean;
}

export interface NotificationEventHandler {
  type: NotificationEventType;
  handler: (data: NotificationEventData) => void;
}

export class NotificationService {
  private eventSource: EventSource | null = null;
  private eventHandlers: Map<NotificationEventType, ((data: NotificationEventData) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;
  private accessToken: string | null = null;

  constructor() {
    // Initialize event handler map
    Object.values(NotificationEventType).forEach(type => {
      this.eventHandlers.set(type, []);
    });
  }

  // Set access token for authentication
  setAccessToken(token: string | null): void {
    const wasConnected = this.eventSource?.readyState === EventSource.OPEN;
    const oldToken = this.accessToken;

    console.log('[NOTIFICATIONS] setAccessToken called');
    console.log('[NOTIFICATIONS] Old token:', oldToken ? oldToken.substring(0, 20) + '... (last 10: ...' + oldToken.slice(-10) + ')' : 'MISSING');
    console.log('[NOTIFICATIONS] New token:', token ? token.substring(0, 20) + '... (last 10: ...' + token.slice(-10) + ')' : 'MISSING');
    console.log('[NOTIFICATIONS] Tokens are different:', token !== oldToken);

    this.accessToken = token;

    // If token changed and we were connected, reconnect with new token
    if (token && oldToken && token !== oldToken && wasConnected) {
      console.log('[NOTIFICATIONS] Token updated, reconnecting with new token...');
      this.disconnect();
      // Small delay to ensure clean disconnect
      setTimeout(() => {
        this.connect();
      }, 100);
    }
  }

  // Check if token is expired or will expire soon
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const bufferTime = 5 * 1000; // 5 seconds buffer

      return exp <= (now + bufferTime);
    } catch (error) {
      console.error('[NOTIFICATIONS] Error checking token expiration:', error);
      return true; // Assume expired if we can't parse
    }
  }

  // Connect to SSE stream
  connect(): void {
    if (this.isConnecting || this.eventSource?.readyState === EventSource.OPEN) {
      console.log('[NOTIFICATIONS] Already connecting or connected');
      return;
    }

    if (!this.accessToken) {
      console.warn('[NOTIFICATIONS] No access token available, cannot connect');
      return;
    }

    // Check if token is expired before connecting
    if (this.isTokenExpired(this.accessToken)) {
      console.warn('[NOTIFICATIONS] Access token is expired, cannot connect');
      return;
    }

    this.isConnecting = true;
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v0/notifications/stream`;

    console.log('[NOTIFICATIONS] Connecting to SSE stream...');

    try {
      // Option 1: EventSource with token in URL (current, less secure)
      if (import.meta.env.VITE_SSE_METHOD === 'eventsource') {
        this.eventSource = new EventSource(`${url}?token=${this.accessToken}`);
      } else {
        // Option 2: Fetch API with Authorization header (more secure)
        this.connectWithFetch(url);
        return;
      }

      this.eventSource.onopen = () => {
        console.log('[NOTIFICATIONS] SSE connection opened');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[NOTIFICATIONS] Received event:', data);
          this.handleEvent(data);
        } catch (error) {
          console.error('[NOTIFICATIONS] Error parsing event data:', error);
        }
      };

      this.eventSource.addEventListener('connected', (event) => {
        const data = JSON.parse(event.data);
        console.log('[NOTIFICATIONS] Connected:', data);
      });

      this.eventSource.addEventListener('notification', (event) => {
        try {
          const data: NotificationEventData = JSON.parse(event.data);
          console.log('[NOTIFICATIONS] Received notification:', data);
          this.handleEvent(data);
        } catch (error) {
          console.error('[NOTIFICATIONS] Error parsing notification:', error);
        }
      });

      this.eventSource.addEventListener('heartbeat', (event) => {
        const data = JSON.parse(event.data);
        console.log('[NOTIFICATIONS] Heartbeat:', data.timestamp);
      });

      this.eventSource.onerror = (error) => {
        console.error('[NOTIFICATIONS] SSE error:', error);
        this.isConnecting = false;

        // Check if this is an authentication error (401)
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          // Reset reconnect attempts for failed connections due to auth issues
          console.log('[NOTIFICATIONS] Connection closed, checking if token needs refresh...');

          // Don't auto-reconnect immediately to avoid spam
          // Let the token refresh mechanism handle reconnection
          if (this.reconnectAttempts === 0) {
            console.log('[NOTIFICATIONS] First connection failure, will not auto-reconnect to avoid token spam');
            return;
          }

          this.handleReconnect();
        }
      };

    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to create EventSource:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  // Alternative secure connection method using Fetch API
  private async connectWithFetch(url: string): Promise<void> {
    try {
      console.log('[NOTIFICATIONS] Connecting with Fetch API + Authorization header...');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      this.isConnecting = false;
      this.reconnectAttempts = 0;
      console.log('[NOTIFICATIONS] Fetch SSE connection established');

      // Read the stream
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[NOTIFICATIONS] Stream ended');
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let eventType = '';
        let eventData = '';
        let eventId = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            eventData = line.substring(5).trim();
          } else if (line.startsWith('id:')) {
            eventId = line.substring(3).trim();
          } else if (line === '') {
            // Empty line indicates end of event
            if (eventData) {
              this.handleFetchSSEEvent(eventType, eventData, eventId);
              eventType = '';
              eventData = '';
              eventId = '';
            }
          }
        }
      }

    } catch (error) {
      console.error('[NOTIFICATIONS] Fetch SSE connection failed:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  // Handle SSE events from Fetch API
  private handleFetchSSEEvent(eventType: string, data: string, id: string): void {
    try {
      switch (eventType) {
        case 'connected':
          console.log('[NOTIFICATIONS] Connected via Fetch:', JSON.parse(data));
          break;
        case 'notification':
          const notificationData: NotificationEventData = JSON.parse(data);
          console.log('[NOTIFICATIONS] Received notification via Fetch:', notificationData);
          this.handleEvent(notificationData);
          break;
        case 'heartbeat':
          const heartbeatData = JSON.parse(data);
          console.log('[NOTIFICATIONS] Heartbeat via Fetch:', heartbeatData.timestamp);
          break;
        default:
          // Handle regular message events
          const parsedData = JSON.parse(data);
          console.log('[NOTIFICATIONS] Received event via Fetch:', parsedData);
          this.handleEvent(parsedData);
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Error parsing Fetch SSE event:', error);
    }
  }

  // Disconnect from SSE stream
  disconnect(): void {
    console.log('[NOTIFICATIONS] Disconnecting...');

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  // Force reconnect with current token (useful after token refresh)
  reconnect(): void {
    console.log('[NOTIFICATIONS] Force reconnecting...');
    if (this.eventSource) {
      this.disconnect();
    }

    // Small delay to ensure clean disconnect
    setTimeout(() => {
      if (this.accessToken) {
        this.connect();
      }
    }, 100);
  }

  // Handle automatic reconnection
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[NOTIFICATIONS] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(`[NOTIFICATIONS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) {
        this.connect();
      }
    }, delay);
  }

  // Register event handler for specific notification type
  on(type: NotificationEventType, handler: (data: NotificationEventData) => void): void {
    const handlers = this.eventHandlers.get(type) || [];
    handlers.push(handler);
    this.eventHandlers.set(type, handlers);

    console.log(`[NOTIFICATIONS] Registered handler for ${type}. Total handlers: ${handlers.length}`);
  }

  // Unregister event handler
  off(type: NotificationEventType, handler: (data: NotificationEventData) => void): void {
    const handlers = this.eventHandlers.get(type) || [];
    const index = handlers.indexOf(handler);

    if (index > -1) {
      handlers.splice(index, 1);
      this.eventHandlers.set(type, handlers);
      console.log(`[NOTIFICATIONS] Unregistered handler for ${type}. Remaining handlers: ${handlers.length}`);
    }
  }

  // Handle incoming notification event
  private handleEvent(data: NotificationEventData): void {
    const handlers = this.eventHandlers.get(data.type) || [];

    if (handlers.length === 0) {
      console.warn(`[NOTIFICATIONS] No handlers registered for event type: ${data.type}`);
      return;
    }

    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[NOTIFICATIONS] Error in handler for ${data.type}:`, error);
      }
    });
  }

  // Get connection status
  getConnectionStatus(): 'connecting' | 'open' | 'closed' {
    if (this.isConnecting) return 'connecting';
    if (!this.eventSource) return 'closed';

    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING: return 'connecting';
      case EventSource.OPEN: return 'open';
      case EventSource.CLOSED: return 'closed';
      default: return 'closed';
    }
  }

  // Test method for Stage 1
  sendTestNotification(): Promise<void> {
    console.log('[NOTIFICATIONS] sendTestNotification called');

    // Get current user ID from JWT token
    let userId: string;
    try {
      if (!this.accessToken) {
        throw new Error('No access token available');
      }

      console.log('[NOTIFICATIONS] Using token for sendTestNotification:', this.accessToken.substring(0, 20) + '... (last 10: ...' + this.accessToken.slice(-10) + ')');

      // Check if token is expired before making request
      const isExpired = this.isTokenExpired(this.accessToken);
      console.log('[NOTIFICATIONS] Token expiration check result:', isExpired);

      if (isExpired) {
        console.warn('[NOTIFICATIONS] Token is expired but proceeding anyway - caller should have refreshed it');

        // Parse the token to show expiration details
        try {
          const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
          const exp = payload.exp * 1000;
          const now = Date.now();
          console.log('[NOTIFICATIONS] Token exp time:', new Date(exp).toISOString());
          console.log('[NOTIFICATIONS] Current time:', new Date(now).toISOString());
          console.log('[NOTIFICATIONS] Time difference (seconds):', (exp - now) / 1000);
        } catch (parseError) {
          console.error('[NOTIFICATIONS] Failed to parse token for debug info:', parseError);
        }
      }

      // Decode JWT to get user ID (simple base64 decode, no verification needed for client-side)
      const tokenParts = this.accessToken.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      userId = payload.sub || payload.id || payload._id;

      if (!userId) {
        throw new Error('No user ID found in token');
      }

      console.log('[NOTIFICATIONS] Extracted userId:', userId);
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to extract user ID from token:', error);
      throw error;
    }

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v0/notifications/test/${userId}`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('[NOTIFICATIONS] Test notification sent:', data);
    })
    .catch(error => {
      console.error('[NOTIFICATIONS] Failed to send test notification:', error);
      throw error;
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();