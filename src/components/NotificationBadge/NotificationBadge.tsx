import React from 'react';
import css from './NotificationBadge.module.css';

export interface NotificationBadgeProps {
  personalCount: number;
  teamCount: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  personalCount,
  teamCount,
  className = ''
}) => {
  const hasPersonal = personalCount > 0;
  const hasTeam = teamCount > 0;
  const hasAny = hasPersonal || hasTeam;

  if (!hasAny) {
    return null;
  }

  const formatCount = (count: number): string => {
    return count > 99 ? '99+' : count.toString();
  };

  return (
    <div className={`${css.container} ${className}`}>
      {/* Личные уведомления - синий горошек слева */}
      {hasPersonal && (
        <div className={`${css.badge} ${css.personal} ${css.left}`}>
          {formatCount(personalCount)}
        </div>
      )}

      {/* Командные уведомления - зеленый горошек справа */}
      {hasTeam && (
        <div className={`${css.badge} ${css.team} ${css.right}`}>
          {formatCount(teamCount)}
        </div>
      )}
    </div>
  );
};