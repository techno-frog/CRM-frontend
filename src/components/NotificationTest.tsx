import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNotifications, useSystemNotifications, useTeamInviteNotifications, NotificationEventType } from '../hooks/useNotifications';
import { useNotificationContext } from '../providers/NotificationProvider';
import type { RootState } from '../store/store';
import { soundService } from '../services/SoundService';
import { useSendTestInviteMutation, useSendTestNotificationMutation } from '../api/notificationsApi';

// CSS анимации в виде стилей
const bounceKeyframes = `
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -15px, 0);
    }
    70% {
      transform: translate3d(0, -7px, 0);
    }
    90% {
      transform: translate3d(0, -2px, 0);
    }
  }

  @keyframes checkmark {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const NotificationTest: React.FC = () => {
  const { status, connect, disconnect, reconnect, on, off } = useNotifications();
  const {
    connectionStatus,
    eventCounts,
    totalEvents,
    recentEvents,
    clearRecentEvents
  } = useNotificationContext();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const user = useSelector((state: RootState) => state.auth.user);
  const [messages, setMessages] = useState<string[]>([]);
  const [sendTestNotification, { isLoading: isLoadingTest }] = useSendTestNotificationMutation();
  const [sendTestInvite, { isLoading: isLoadingInvite, isSuccess: isInviteSuccess, reset: resetInvite }] = useSendTestInviteMutation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  // Enable system notifications
  useSystemNotifications();

  // Добавить CSS анимации в head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = bounceKeyframes;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // НЕ включаем useTeamInviteNotifications здесь, так как он уже включен в DefaultLayout
  // useTeamInviteNotifications(); // ОТКЛЮЧЕНО - избегаем дублирования тостов

  useEffect(() => {
    // Register listener for all notification types
    const handleSystemNotification = (data: any) => {
      setMessages(prev => [...prev, `SYSTEM: ${JSON.stringify(data)}`]);
    };

    const handleInviteReceived = (data: any) => {
      setMessages(prev => [...prev, `INVITE: ${JSON.stringify(data)}`]);
    };

    const handleTeamActivity = (data: any) => {
      setMessages(prev => [...prev, `TEAM: ${JSON.stringify(data)}`]);
    };

    on(NotificationEventType.SYSTEM_NOTIFICATION, handleSystemNotification);
    on(NotificationEventType.INVITE_RECEIVED, handleInviteReceived);
    on(NotificationEventType.TEAM_ACTIVITY, handleTeamActivity);

    // Cleanup
    return () => {
      off(NotificationEventType.SYSTEM_NOTIFICATION, handleSystemNotification);
      off(NotificationEventType.INVITE_RECEIVED, handleInviteReceived);
      off(NotificationEventType.TEAM_ACTIVITY, handleTeamActivity);
    };
  }, [on, off]);

  // RTK Query для отправки тестового уведомления
  const handleSendTest = async () => {
    try {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const userId = user.id || user._id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      await sendTestNotification(userId).unwrap();
      setMessages(prev => [...prev, 'Test notification sent successfully']);
    } catch (error) {
      setMessages(prev => [...prev, `Error sending test: ${error}`]);
    }
  };

  // RTK Query для отправки тестового приглашения
  const handleSendInviteTest = async () => {
    try {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const userId = user.id || user._id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      await sendTestInvite(userId).unwrap();
      setMessages(prev => [...prev, 'Test invite notification sent successfully']);
    } catch (error) {
      setMessages(prev => [...prev, `Error sending invite test: ${error}`]);
    }
  };

  // Убрали автосброс - пользователь сам будет управлять состоянием

  const clearMessages = () => {
    setMessages([]);
  };

  // Прямое тестирование document.title
  const handleTestTitle = () => {
    console.log('[TEST] Testing document.title directly...');
    console.log('[TEST] Current document.title:', document.title);
    document.title = 'ТЕСТ ЗАГОЛОВКА!';
    console.log('[TEST] After setting title:', document.title);
    setMessages(prev => [...prev, `Direct title test triggered. Current title: "${document.title}"`]);
  };

  // Прямое тестирование SoundService
  const handleTestSound = async () => {
    console.log('[TEST] Testing SoundService directly...');
    try {
      await soundService.initUserInteraction();
      await soundService.playNotificationSound();
      setMessages(prev => [...prev, 'Direct SoundService test triggered']);
    } catch (error) {
      console.error('[TEST] Sound test failed:', error);
      setMessages(prev => [...prev, `Sound test failed: ${error}`]);
    }
  };

  // Drag & Drop функции
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isExpanded) return; // Можно тащить только в развернутом виде

    setIsDragging(true);
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Добавляем глобальные обработчики для drag & drop
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Переключение размера
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'open': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'closed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Компактная иконка
  if (!isExpanded) {
    return (
      <div
        onClick={toggleExpanded}
        style={{
          position: 'fixed',
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: '50px',
          height: '50px',
          backgroundColor: getStatusColor(),
          borderRadius: '25px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: 'white',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={`Notifications: ${status} (${totalEvents} events)`}
      >
        🔔
      </div>
    );
  }

  // Развернутая панель
  return (
    <div
      ref={dragRef}
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '400px',
        maxHeight: '600px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Заголовок с возможностью перетаскивания */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          cursor: 'grab',
          backgroundColor: '#f9fafb',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        onMouseDown={handleMouseDown}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#374151' }}>
          🔔 Notification Test
        </h3>
        <button
          onClick={toggleExpanded}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '2px',
            color: '#6b7280'
          }}
        >
          ✖
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getStatusColor()
            }}
          />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            Status: {status}
          </span>
          <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>
            Total events: {totalEvents}
          </span>
        </div>

        {/* Event Statistics */}
        <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
            Event Counts:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', fontSize: '11px' }}>
            {Object.entries(eventCounts).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>{type.split('.')[1] || type}:</span>
                <span style={{ fontWeight: '500', color: count > 0 ? '#059669' : '#9ca3af' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <button
            onClick={connect}
            disabled={status === 'open' || status === 'connecting'}
            style={{
              padding: '6px 10px',
              backgroundColor: status === 'open' ? '#d1fae5' : '#3b82f6',
              color: status === 'open' ? '#065f46' : 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: status === 'open' ? 'default' : 'pointer',
              opacity: status === 'connecting' ? 0.6 : 1
            }}
          >
            {status === 'connecting' ? 'Connecting...' : 'Connect'}
          </button>

          <button
            onClick={disconnect}
            disabled={status === 'closed'}
            style={{
              padding: '6px 10px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: status === 'closed' ? 'default' : 'pointer',
              opacity: status === 'closed' ? 0.6 : 1
            }}
          >
            Disconnect
          </button>

          <button
            onClick={reconnect}
            disabled={status === 'connecting'}
            style={{
              padding: '6px 10px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: status === 'connecting' ? 'default' : 'pointer',
              opacity: status === 'connecting' ? 0.6 : 1
            }}
          >
            Reconnect
          </button>

          <button
            onClick={handleSendTest}
            disabled={status !== 'open' || isLoadingTest}
            style={{
              padding: '6px 10px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: status !== 'open' || isLoadingTest ? 'default' : 'pointer',
              opacity: status !== 'open' || isLoadingTest ? 0.6 : 1
            }}
          >
            {isLoadingTest ? 'Sending...' : 'Test'}
          </button>

          {!isLoadingInvite && !isInviteSuccess ? (
            <button
              onClick={handleSendInviteTest}
              disabled={status !== 'open'}
              style={{
                padding: '6px 10px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500',
                cursor: status !== 'open' ? 'default' : 'pointer',
                opacity: status !== 'open' ? 0.6 : 1
              }}
            >
              Invite 🎯
            </button>
          ) : isLoadingInvite ? (
            <div style={{
              padding: '6px 10px',
              backgroundColor: '#f59e0b',
              color: 'white',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ⏳ Отправляем приглашение...
            </div>
          ) : (
            <div style={{
              padding: '6px 10px',
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              animationName: 'checkmark',
              animationDuration: '0.5s',
              animationTimingFunction: 'ease-in-out',
              animationFillMode: 'both'
            }}>
              <span style={{
                display: 'inline-block',
                animationName: 'bounce',
                animationDuration: '0.6s',
                animationTimingFunction: 'ease-in-out',
                animationFillMode: 'both'
              }}>✅</span>
              Приглашение отправлено
            </div>
          )}

          <button
            onClick={clearMessages}
            style={{
              padding: '6px 10px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>

          {isInviteSuccess && (
            <button
              onClick={resetInvite}
              style={{
                padding: '6px 10px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </div>

        {/* Direct Testing Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
          <button
            onClick={handleTestTitle}
            style={{
              padding: '6px 10px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📑 Test Title
          </button>


          <button
            onClick={() => {
              console.log('[TEST] Direct document.title test');
              console.log('[TEST] Current title:', document.title);
              document.title = 'ТЕСТ ПРЯМОГО ИЗМЕНЕНИЯ';
              console.log('[TEST] After direct change:', document.title);
              setTimeout(() => {
                console.log('[TEST] After 1 second:', document.title);
              }, 1000);
              setMessages(prev => [...prev, 'Direct document.title test triggered']);
            }}
            style={{
              padding: '6px 10px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🔴 Direct Test
          </button>

          <button
            onClick={handleTestSound}
            style={{
              padding: '6px 10px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🔊 Test Sound
          </button>
        </div>

        {/* Recent Events - компактная версия */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>
              Recent Events ({recentEvents.length})
            </h4>
            <button
              onClick={clearRecentEvents}
              style={{
                padding: '2px 4px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '2px',
                fontSize: '9px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>

          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '6px'
          }}>
            {recentEvents.length === 0 ? (
              <div style={{ color: '#6b7280', fontSize: '10px', fontStyle: 'italic' }}>
                No events yet. Click buttons to test!
              </div>
            ) : (
              recentEvents.slice(-5).map((event, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: '10px',
                    marginBottom: '4px',
                    padding: '4px',
                    backgroundColor: 'white',
                    borderRadius: '2px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontWeight: '600', color: '#374151', fontSize: '9px' }}>
                      {event.type.split('.')[1]?.toUpperCase() || event.type}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '8px' }}>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '9px', color: '#4b5563' }}>
                    {event.type === NotificationEventType.INVITE_RECEIVED && (
                      <>🎯 Invited to <strong>{event.data.teamName}</strong></>
                    )}
                    {event.type === NotificationEventType.SYSTEM_NOTIFICATION && (
                      <>🔔 {event.data.title}</>
                    )}
                    {/* Другие типы событий можно добавить по необходимости */}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationTest;