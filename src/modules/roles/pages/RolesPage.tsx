import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetRolesQuery, useDeleteRoleMutation, Action } from '../../../api/rolesApi';
import { FaEdit, FaTrash, FaPlus, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';
import css from './RolesPage.module.css';

export const RolesPage: React.FC = () => {
  const [showInactive, setShowInactive] = useState(false);
  const { data: roles, isLoading, error } = useGetRolesQuery(!showInactive);
  const [deleteRole] = useDeleteRoleMutation();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Точно хочешь удалить роль "${name}", бро?`)) {
      try {
        await deleteRole(id).unwrap();
      } catch (err) {
        console.error('Не получилось удалить роль:', err);
        alert('Не могу удалить роль, она используется!');
      }
    }
  };

  const getActionLabel = (action: Action): string => {
    const labels = {
      [Action.ALL]: 'Все системные',
      [Action.CREATE]: 'Создание',
      [Action.READ]: 'Чтение',
      [Action.UPDATE]: 'Обновление',
      [Action.DELETE]: 'Удаление',
      [Action.MANAGE]: 'Управление',
      [Action.INVITE]: 'Приглашение',
      [Action.UPDATE_STOCK]: 'Обновление склада',
      [Action.DISMISS]: 'Увольнение',
    };
    return labels[action] || action;
  };

  if (isLoading) {
    return (
      <div className={css.container}>
        <div className={css.loading}>Загружаю роли, бро...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={css.container}>
        <div className={css.error}>Что-то пошло не так, бро!</div>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h1>Управление ролями</h1>
        <div className={css.headerActions}>
          <label className={css.checkboxLabel}>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Показать неактивные
          </label>
          <Link to="/roles/assign" className={css.assignBtn}>
            <FaUserPlus />
            Назначить роль
          </Link>
          <Link to="/roles/create" className={css.createBtn}>
            <FaPlus />
            Создать роль
          </Link>
        </div>
      </div>

      <div className={css.rolesList}>
        {roles?.length === 0 ? (
          <div className={css.empty}>
            <p>Пока нет ролей, бро</p>
            <Link to="/roles/create" className={css.emptyBtn}>
              Создать первую роль
            </Link>
          </div>
        ) : (
          <div className={css.rolesGrid}>
            {roles?.map((role) => (
              <div key={role._id} className={`${css.roleCard} ${!role.isActive ? css.inactive : ''}`}>
                <div className={css.roleHeader}>
                  <h3>{role.name}</h3>
                  <div className={css.roleStatus}>
                    {role.isActive ? (
                      <span className={css.active}>
                        <FaCheck /> Активна
                      </span>
                    ) : (
                      <span className={css.inactiveLabel}>
                        <FaTimes /> Неактивна
                      </span>
                    )}
                  </div>
                </div>

                {role.description && (
                  <p className={css.description}>{role.description}</p>
                )}

                {role.resourceType && (
                  <div className={css.resourceType}>
                    <span className={css.label}>Тип ресурса:</span>
                    <span className={css.value}>{role.resourceType}</span>
                  </div>
                )}

                <div className={css.actions}>
                  <span className={css.label}>Разрешения:</span>
                  <div className={css.actionsList}>
                    {role.defaultActions.map((action) => (
                      <span key={action} className={css.actionBadge}>
                        {getActionLabel(action)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={css.cardFooter}>
                  <Link to={`/roles/edit/${role._id}`} className={css.editBtn}>
                    <FaEdit /> Редактировать
                  </Link>
                  <button
                    onClick={() => handleDelete(role._id, role.name)}
                    className={css.deleteBtn}
                  >
                    <FaTrash /> Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};