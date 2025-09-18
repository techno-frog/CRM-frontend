import React from 'react';
import {
  Users,
  Calendar,
  FileText,
  Settings,
  UserPlus,
  Activity,
  Target,
  MessageSquare
} from 'lucide-react';
import css from './Team.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetTeamQuery } from '../../../../api/teamsApi';


const Team: React.FC = () => {

  const { id } = useParams();
  const { data: team, isFetching, error } = useGetTeamQuery(id || '', { skip: !id });
  const navigate = useNavigate();

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
                  <div className={css.placeholder}>
                    История активности команды будет отображаться здесь
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Team;
