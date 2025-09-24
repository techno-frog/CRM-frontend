import React, { useState, useEffect } from 'react';
import { X, Bell, Check } from 'lucide-react';
import { TeamActivityType } from '../../types/team-activities.types';
import {
  useGetUserSubscriptionQuery,
  useCreateOrUpdateSubscriptionMutation
} from '../../api/teamActivitySubscriptionsApi';
import Modal from '../../shared/components/Modal/Modal';
import css from './TeamActivitySubscriptionModal.module.css';

interface TeamActivitySubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}

// Группировка типов активностей для удобства
const activityTypeGroups = {
  'Участники команды': [
    TeamActivityType.MEMBER_JOINED,
    TeamActivityType.MEMBER_LEFT,
    TeamActivityType.MEMBER_INVITED,
    TeamActivityType.MEMBER_DISMISSED,
    TeamActivityType.MEMBER_ROLE_CHANGED,
  ],
  'Задачи и проекты': [
    TeamActivityType.TASK_CREATED,
    TeamActivityType.TASK_COMPLETED,
    TeamActivityType.TASK_ASSIGNED,
    TeamActivityType.PROJECT_CREATED,
    TeamActivityType.PROJECT_COMPLETED,
    TeamActivityType.MILESTONE_REACHED,
  ],
  'События и встречи': [
    TeamActivityType.EVENT_CREATED,
    TeamActivityType.EVENT_STARTED,
    TeamActivityType.EVENT_COMPLETED,
    TeamActivityType.MEETING_SCHEDULED,
    TeamActivityType.MEETING_COMPLETED,
  ],
  'Роли и приглашения': [
    TeamActivityType.ROLE_ASSIGNED,
    TeamActivityType.ROLE_REMOVED,
    TeamActivityType.INVITATION_CREATED,
    TeamActivityType.INVITATION_ACCEPTED,
    TeamActivityType.INVITATION_DECLINED,
    TeamActivityType.INVITATION_EXPIRED,
  ],
  'Документы': [
    TeamActivityType.DOCUMENT_UPLOADED,
    TeamActivityType.DOCUMENT_DELETED,
    TeamActivityType.DOCUMENT_SHARED,
  ],
  'Сделки': [
    TeamActivityType.DEAL_CREATED,
    TeamActivityType.DEAL_UPDATED,
    TeamActivityType.DEAL_CLOSED,
  ],
  'Команда': [
    TeamActivityType.TEAM_CREATED,
    TeamActivityType.TEAM_STATUS_CHANGED,
    TeamActivityType.TEAM_SETTINGS_UPDATED,
    TeamActivityType.TEAM_DESCRIPTION_UPDATED,
  ],
  'Системные события': [
    TeamActivityType.ANNOUNCEMENT_POSTED,
    TeamActivityType.INTEGRATION_CONNECTED,
    TeamActivityType.INTEGRATION_DISCONNECTED,
    TeamActivityType.BACKUP_CREATED,
    TeamActivityType.SECURITY_ALERT,
  ],
};

// Названия типов активностей на русском
const activityTypeNames: Record<TeamActivityType, string> = {
  [TeamActivityType.TEAM_CREATED]: 'Команда создана',
  [TeamActivityType.MEMBER_JOINED]: 'Участник присоединился',
  [TeamActivityType.MEMBER_LEFT]: 'Участник покинул команду',
  [TeamActivityType.MEMBER_INVITED]: 'Участник приглашен',
  [TeamActivityType.MEMBER_DISMISSED]: 'Участник исключен',
  [TeamActivityType.MEMBER_ROLE_CHANGED]: 'Роль участника изменена',
  [TeamActivityType.TASK_CREATED]: 'Создана задача',
  [TeamActivityType.TASK_COMPLETED]: 'Задача выполнена',
  [TeamActivityType.TASK_ASSIGNED]: 'Задача назначена',
  [TeamActivityType.EVENT_CREATED]: 'Создано событие',
  [TeamActivityType.EVENT_STARTED]: 'Событие началось',
  [TeamActivityType.EVENT_COMPLETED]: 'Событие завершено',
  [TeamActivityType.ROLE_ASSIGNED]: 'Назначена роль',
  [TeamActivityType.ROLE_REMOVED]: 'Роль удалена',
  [TeamActivityType.INVITATION_CREATED]: 'Создано приглашение',
  [TeamActivityType.INVITATION_ACCEPTED]: 'Приглашение принято',
  [TeamActivityType.INVITATION_DECLINED]: 'Приглашение отклонено',
  [TeamActivityType.INVITATION_EXPIRED]: 'Приглашение истекло',
  [TeamActivityType.DOCUMENT_UPLOADED]: 'Загружен документ',
  [TeamActivityType.DOCUMENT_DELETED]: 'Документ удален',
  [TeamActivityType.DOCUMENT_SHARED]: 'Документ опубликован',
  [TeamActivityType.TEAM_STATUS_CHANGED]: 'Статус команды изменен',
  [TeamActivityType.TEAM_SETTINGS_UPDATED]: 'Настройки команды обновлены',
  [TeamActivityType.TEAM_DESCRIPTION_UPDATED]: 'Описание команды обновлено',
  [TeamActivityType.DEAL_CREATED]: 'Создана сделка',
  [TeamActivityType.DEAL_UPDATED]: 'Сделка обновлена',
  [TeamActivityType.DEAL_CLOSED]: 'Сделка закрыта',
  [TeamActivityType.PROJECT_CREATED]: 'Создан проект',
  [TeamActivityType.PROJECT_COMPLETED]: 'Проект завершен',
  [TeamActivityType.MILESTONE_REACHED]: 'Достигнута веха',
  [TeamActivityType.MEETING_SCHEDULED]: 'Запланирована встреча',
  [TeamActivityType.MEETING_COMPLETED]: 'Встреча завершена',
  [TeamActivityType.ANNOUNCEMENT_POSTED]: 'Опубликовано объявление',
  [TeamActivityType.INTEGRATION_CONNECTED]: 'Подключена интеграция',
  [TeamActivityType.INTEGRATION_DISCONNECTED]: 'Отключена интеграция',
  [TeamActivityType.BACKUP_CREATED]: 'Создана резервная копия',
  [TeamActivityType.SECURITY_ALERT]: 'Предупреждение безопасности',
};

export const TeamActivitySubscriptionModal: React.FC<TeamActivitySubscriptionModalProps> = ({
  isOpen,
  onClose,
  teamId,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<Set<TeamActivityType>>(new Set());

  // Получение текущих подписок пользователя
  const {
    data: currentSubscription,
    isLoading: isLoadingSubscription,
    refetch
  } = useGetUserSubscriptionQuery(
    { teamId },
    { skip: !isOpen }
  );

  // Мутация для создания/обновления подписок
  const [createOrUpdateSubscription, { isLoading: isSaving }] = useCreateOrUpdateSubscriptionMutation();

  // Загрузить существующие подписки при открытии модального окна
  useEffect(() => {
    if (isOpen && currentSubscription) {
      setSelectedTypes(new Set(currentSubscription.subscribedActivityTypes));
    } else if (isOpen && !currentSubscription && !isLoadingSubscription) {
      // Если подписок нет, сбрасываем выбор
      setSelectedTypes(new Set());
    }
  }, [isOpen, currentSubscription, isLoadingSubscription]);

  const handleTypeToggle = (type: TeamActivityType) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedTypes(newSelected);
  };

  const handleGroupToggle = (groupTypes: TeamActivityType[]) => {
    const newSelected = new Set(selectedTypes);
    const allSelected = groupTypes.every(type => newSelected.has(type));

    if (allSelected) {
      // Снять выделение со всех типов в группе
      groupTypes.forEach(type => newSelected.delete(type));
    } else {
      // Выбрать все типы в группе
      groupTypes.forEach(type => newSelected.add(type));
    }

    setSelectedTypes(newSelected);
  };

  const handleSelectAll = () => {
    const allTypes = Object.values(activityTypeGroups).flat();
    setSelectedTypes(new Set(allTypes));
  };

  const handleDeselectAll = () => {
    setSelectedTypes(new Set());
  };

  const handleSave = async () => {
    try {
      await createOrUpdateSubscription({
        teamId,
        subscribedActivityTypes: Array.from(selectedTypes),
        isActive: true
      }).unwrap();

      onClose();
    } catch (error) {
      console.error('Failed to save subscriptions:', error);
      // TODO: Показать уведомление об ошибке
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Подписка на события команды"
      size="large"
      footer={
        <div className={css.modalFooter}>
          <div className={css.footerActions}>
            <button
              className={css.cancelButton}
              onClick={onClose}
              disabled={isSaving}
            >
              Отмена
            </button>
            <button
              className={css.saveButton}
              onClick={handleSave}
              disabled={isSaving || isLoadingSubscription}
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      }
    >
      <div className={css.content}>
        <div className={css.description}>
          <Bell size={20} />
          <div>
            <p>Выберите типы активностей команды, о которых вы хотите получать уведомления.</p>
            <p className={css.note}>
              Вы будете получать уведомления только о новых событиях в команде.
            </p>
          </div>
        </div>

        {isLoadingSubscription ? (
          <div className={css.loading}>
            <div>Загрузка текущих настроек...</div>
          </div>
        ) : (
          <>

        <div className={css.quickActions}>
          <button className={css.quickButton} onClick={handleSelectAll}>
            Выбрать все
          </button>
          <button className={css.quickButton} onClick={handleDeselectAll}>
            Снять все
          </button>
        </div>

        <div className={css.groupsList}>
          {Object.entries(activityTypeGroups).map(([groupName, groupTypes]) => {
            const selectedInGroup = groupTypes.filter(type => selectedTypes.has(type)).length;
            const allSelectedInGroup = selectedInGroup === groupTypes.length;
            const someSelectedInGroup = selectedInGroup > 0 && selectedInGroup < groupTypes.length;

            return (
              <div key={groupName} className={css.group}>
                <div className={css.groupHeader}>
                  <label className={css.groupCheckbox}>
                    <input
                      type="checkbox"
                      checked={allSelectedInGroup}
                      ref={input => {
                        if (input) input.indeterminate = someSelectedInGroup;
                      }}
                      onChange={() => handleGroupToggle(groupTypes)}
                    />
                    <span className={css.checkmark}>
                      {allSelectedInGroup && <Check size={12} />}
                    </span>
                    <span className={css.groupTitle}>
                      {groupName}
                      <span className={css.groupCount}>
                        ({selectedInGroup}/{groupTypes.length})
                      </span>
                    </span>
                  </label>
                </div>

                <div className={css.groupTypes}>
                  {groupTypes.map((type) => (
                    <label key={type} className={css.typeCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedTypes.has(type)}
                        onChange={() => handleTypeToggle(type)}
                      />
                      <span className={css.checkmark}>
                        {selectedTypes.has(type) && <Check size={12} />}
                      </span>
                      <span className={css.typeName}>
                        {activityTypeNames[type]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        </>
        )}
      </div>
    </Modal>
  );
};