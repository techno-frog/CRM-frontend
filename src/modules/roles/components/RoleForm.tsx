import React, { useState } from 'react';
import { Action, ResourceType } from '../../../api/rolesApi';
import css from './RoleForm.module.css';

interface RoleFormProps {
  initialData?: {
    name: string;
    description?: string;
    defaultActions: Action[];
    resourceType?: ResourceType;
    isActive?: boolean;
  };
  onSubmit: (data: {
    name: string;
    description?: string;
    defaultActions: Action[];
    resourceType?: ResourceType;
    isActive?: boolean;
  }) => void;
  isLoading?: boolean;
  error?: any;
  submitText?: string;
}

export const RoleForm: React.FC<RoleFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  error,
  submitText = 'Сохранить'
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [defaultActions, setDefaultActions] = useState<Action[]>(initialData?.defaultActions || []);
  const [resourceType, setResourceType] = useState<ResourceType | ''>(initialData?.resourceType || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleActionToggle = (action: Action) => {
    setDefaultActions(prev =>
      prev.includes(action)
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };

  const handleSelectAll = () => {
    if (defaultActions.length === Object.values(Action).length) {
      setDefaultActions([]);
    } else {
      setDefaultActions(Object.values(Action));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (defaultActions.length === 0) {
      alert('Выбери хотя бы одно разрешение, бро!');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      defaultActions,
      resourceType: resourceType || undefined,
      isActive
    });
  };

  const getActionLabel = (action: Action): string => {
    const labels = {
      [Action.ALL]: 'Все системные',
      [Action.CREATE]: 'Создание',
      [Action.READ]: 'Чтение',
      [Action.UPDATE]: 'Обновление',
      [Action.DELETE]: 'Удаление',
      [Action.MANAGE]: 'Полное управление',
      [Action.INVITE]: 'Приглашение',
      [Action.UPDATE_STOCK]: 'Обновление склада',
      [Action.DISMISS]: 'Увольнение',
    };
    return labels[action] || action;
  };

  const getActionDescription = (action: Action): string => {
    const descriptions = {
      [Action.ALL]: 'Доступ ко всем системным функциям',
      [Action.CREATE]: 'Создание новых записей',
      [Action.READ]: 'Просмотр информации',
      [Action.UPDATE]: 'Изменение существующих записей',
      [Action.DELETE]: 'Удаление записей',
      [Action.MANAGE]: 'Полный контроль над ресурсом',
      [Action.INVITE]: 'Приглашение новых пользователей',
      [Action.UPDATE_STOCK]: 'Изменение складских остатков',
      [Action.DISMISS]: 'Увольнение сотрудников',
    };
    return descriptions[action] || '';
  };

  return (
    <form onSubmit={handleSubmit} className={css.form}>
      {error && (
        <div className={css.error}>
          {error.data?.message || 'Что-то пошло не так, бро!'}
        </div>
      )}

      <div className={css.formGroup}>
        <label htmlFor="name">Название роли *</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: manager, editor"
          required
          minLength={2}
        />
        <span className={css.hint}>Используй латиницу и нижний регистр</span>
      </div>

      <div className={css.formGroup}>
        <label htmlFor="description">Описание</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опиши, что может делать эта роль"
          rows={3}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="resourceType">Тип ресурса</label>
        <select
          id="resourceType"
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value as ResourceType | '')}
        >
          <option value="">Без привязки к ресурсу</option>
          <option value={ResourceType.COMPANY}>Компания</option>
          <option value={ResourceType.TEAM}>Команда</option>
          <option value={ResourceType.PRODUCT}>Продукт</option>
        </select>
        <span className={css.hint}>Выбери, если роль привязана к конкретному типу ресурса</span>
      </div>

      <div className={css.formGroup}>
        <div className={css.actionsHeader}>
          <label>Разрешения *</label>
          <button
            type="button"
            onClick={handleSelectAll}
            className={css.selectAllBtn}
          >
            {defaultActions.length === Object.values(Action).length ? 'Снять все' : 'Выбрать все'}
          </button>
        </div>
        <div className={css.actionsGrid}>
          {Object.values(Action).map(action => (
            <div
              key={action}
              className={`${css.actionItem} ${defaultActions.includes(action) ? css.selected : ''}`}
              onClick={() => handleActionToggle(action)}
            >
              <div className={css.actionCheckbox}>
                <input
                  type="checkbox"
                  checked={defaultActions.includes(action)}
                  onChange={() => { }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className={css.actionContent}>
                <div className={css.actionLabel}>{getActionLabel(action)}</div>
                <div className={css.actionDescription}>{getActionDescription(action)}</div>
              </div>
            </div>
          ))}
        </div>
        {defaultActions.length === 0 && (
          <span className={css.errorHint}>Выбери хотя бы одно разрешение</span>
        )}
      </div>

      <div className={css.formGroup}>
        <label className={css.checkboxLabel}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span>Роль активна</span>
        </label>
        <span className={css.hint}>Неактивные роли нельзя назначать пользователям</span>
      </div>

      <div className={css.formActions}>
        <button
          type="submit"
          disabled={isLoading || defaultActions.length === 0}
          className={css.submitBtn}
        >
          {isLoading ? 'Сохраняю...' : submitText}
        </button>
      </div>
    </form>
  );
};