import React, { useState } from 'react';
import {
  Users,
  Calendar,
  FileText,
  Settings,
  UserPlus,
  Activity,
  Target,
  MessageSquare,
  Bell
} from 'lucide-react';
import css from './Team.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetTeamQuery } from '../../../../api/teamsApi';
import { TeamActivitiesList } from '../../../../components/ProfileMenu/TeamActivitiesList';
import { TeamActivitySubscriptionModal } from '../../../../components/TeamActivitySubscriptionModal/TeamActivitySubscriptionModal';
import { useTeamActivityRefetch } from '../../../../hooks/useTeamActivityRefetch';


const Team: React.FC = () => {
  const { id } = useParams();
  const { data: team, isFetching, error } = useGetTeamQuery(id || '', { skip: !id });
  const navigate = useNavigate();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Настройка автоматического обновления активностей команды при получении уведомлений
  useTeamActivityRefetch({ teamId: id });

  return (
    <div className={css.teamContainer}>
      {/* Заголовок команды / Скелетон */}
      <div className={css.teamHeader}>
        {isFetching ? (
          <>
            <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonHeaderTitle}`} />
            <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonHeaderSubtitle}`} />
            <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonHeaderId}`} />
          </>
        ) : (
          <>
            <div className={css.teamHeaderContent}>
              <div className={css.teamTitleSection}>
                <h1 className={css.teamTitle}>
                  {!error ? (
                    <>
                      Команда <span className={css.gradientText}>{team?.title || '—'}</span>
                    </>
                  ) :
                    <>Команда не доступна</>
                  }
                </h1>
                {!error && (
                  <p className={css.teamSubtitle}>
                    {team?.isPublic ? 'Публичная команда' : 'Приватная команда'}
                  </p>
                )}
                <div className={css.teamId}>
                  <span className={css.teamIdLabel}>ID:</span>
                  <span className={css.teamIdValue}>{team?.id || id}</span>
                </div>
              </div>
              {!error && (
                <div className={css.teamHeaderActions}>
                  <button
                    className={css.subscribeButton}
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    title="Подписаться на события команды"
                  >
                    <Bell size={20} />
                    Подписаться на события
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Статистика команды */}
      <div className={css.teamStats}>
        {isFetching ? (
          <div className={css.skeletonRow}>
            <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonCard}`} />
            <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonCard}`} />
            <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonCard}`} />
            <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonCard}`} />
          </div>
        ) : (
          <>
            <div className={css.statCard}>
              <div className={css.statIcon}>
                <Users size={24} />
              </div>
              <div className={css.statValue}>{team?.members?.length ?? 0}</div>
              <div className={css.statLabel}>Участников</div>
            </div>

            <div className={css.statCard}>
              <div className={css.statIcon}>
                <Target size={24} />
              </div>
              <div className={css.statValue}>0</div>
              <div className={css.statLabel}>Активных задач</div>
            </div>

            <div className={css.statCard}>
              <div className={css.statIcon}>
                <Activity size={24} />
              </div>
              <div className={css.statValue}>{team?.deals?.length ?? 0}</div>
              <div className={css.statLabel}>Проектов</div>
            </div>

            <div className={css.statCard}>
              <div className={css.statIcon}>
                <MessageSquare size={24} />
              </div>
              <div className={css.statValue}>0</div>
              <div className={css.statLabel}>Сообщений</div>
            </div>
          </>
        )}
      </div>

      {/* Кнопки действий */}
      <div className={css.teamActions}>
        <button onClick={() => navigate('invites')} className={css.actionButton}>
          <UserPlus size={20} />
          Пригласить участника
        </button>
        <button className={`${css.actionButton} ${css.secondary}`}>
          <Settings size={20} />
          Настройки команды
        </button>
      </div>

      {/* Основной контент */}
      <div className={css.teamContent}>
        <div className={css.contentMain}>
          {isFetching ? (
            <>
              <div className={css.contentSection}>
                <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonSectionTitle}`} />
                <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonSectionBody}`} />
              </div>
              <div className={css.contentSection}>
                <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonSectionTitle}`} />
                <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonSectionBody}`} />
              </div>
              <div className={css.contentSection}>
                <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonSectionTitle}`} />
                <div className={`${css.skeletonBlock} ${css.skeletonShimmer} ${css.skeletonSectionBody}`} />
              </div>
            </>
          ) : (
            <>
              <div className={css.contentSection}>
                <h3 className={css.sectionTitle}>
                  <div className={css.sectionIcon}>
                    <FileText size={16} />
                  </div>
                  Последние проекты
                </h3>
                <div className={css.sectionContent}>
                  <div className={css.placeholder}>
                    Пока что проектов нет. Создай первый проект для команды!
                  </div>
                </div>
              </div>

              <div className={css.contentSection}>
                <h3 className={css.sectionTitle}>
                  <div className={css.sectionIcon}>
                    <Calendar size={16} />
                  </div>
                  Ближайшие события
                </h3>
                <div className={css.sectionContent}>
                  <div className={css.placeholder}>
                    Календарь событий пуст. Запланируй встречу или дедлайн!
                  </div>
                </div>
              </div>

              <div className={css.contentSection}>
                <h3 className={css.sectionTitle}>
                  <div className={css.sectionIcon}>
                    <Activity size={16} />
                  </div>
                  Активность команды
                </h3>
                <div className={css.sectionContent}>
                  {id && <TeamActivitiesList teamId={id} />}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal for activity subscriptions */}
      {id && (
        <TeamActivitySubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          teamId={id}
        />
      )}
    </div>
  );
};

export default Team;
