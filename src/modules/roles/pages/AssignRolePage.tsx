import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetRolesQuery,
  useAssignRoleToUserMutation,
  useAssignRoleToResourceMutation,
  useGetUserRolesQuery,
  ResourceType,
  Action
} from '../../../api/rolesApi';
import css from './AssignRolePage.module.css';

export const AssignRolePage: React.FC = () => {
  const navigate = useNavigate();
  const [assignType, setAssignType] = useState<'user' | 'resource'>('user');
  const [userId, setUserId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>(ResourceType.TEAM);
  const [resourceId, setResourceId] = useState('');
  const [additionalActions, setAdditionalActions] = useState<Action[]>([]);

  const { data: roles, isLoading: isLoadingRoles } = useGetRolesQuery(true);
  const [assignRoleToUser, { isLoading: isAssigningUser }] = useAssignRoleToUserMutation();
  const [assignRoleToResource, { isLoading: isAssigningResource }] = useAssignRoleToResourceMutation();
  const { data: userRoles } = useGetUserRolesQuery(userId, { skip: !userId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (assignType === 'user') {
        await assignRoleToUser({ userId, roleId }).unwrap();
      } else {
        await assignRoleToResource({
          userId,
          roleId,
          resourceType,
          resourceId,
          additionalActions: additionalActions.length > 0 ? additionalActions : undefined
        }).unwrap();
      }
      navigate('/roles');
    } catch (err) {
      console.error('Ошибка назначения роли:', err);
      alert('Не получилось назначить роль, бро!');
    }
  };

  const handleActionToggle = (action: Action) => {
    setAdditionalActions(prev =>
      prev.includes(action)
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };

  const isLoading = isAssigningUser || isAssigningResource;

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h1>Назначить роль</h1>
        <p>Дай пользователю права, бро</p>
      </div>

      <div className={css.formWrapper}>
        <form onSubmit={handleSubmit} className={css.form}>
          <div className={css.assignTypeSelector}>
            <button
              type="button"
              className={`${css.typeBtn} ${assignType === 'user' ? css.active : ''}`}
              onClick={() => setAssignType('user')}
            >
              Назначить пользователю
            </button>
            <button
              type="button"
              className={`${css.typeBtn} ${assignType === 'resource' ? css.active : ''}`}
              onClick={() => setAssignType('resource')}
            >
              Назначить на ресурс
            </button>
          </div>

          <div className={css.formGroup}>
            <label htmlFor="userId">ID пользователя</label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Введи ID пользователя"
              required
            />
            {userRoles && userRoles.length > 0 && (
              <div className={css.currentRoles}>
                <span>Текущие роли:</span>
                {userRoles.map(ur => (
                  <span key={ur._id} className={css.roleBadge}>
                    {typeof ur.roleId === 'object' ? ur.roleId.name : ur.roleId}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={css.formGroup}>
            <label htmlFor="roleId">Роль</label>
            <select
              id="roleId"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              required
              disabled={isLoadingRoles}
            >
              <option value="">Выбери роль</option>
              {roles?.map(role => (
                <option key={role._id} value={role._id}>
                  {role.name} {role.description && `- ${role.description}`}
                </option>
              ))}
            </select>
          </div>

          {assignType === 'resource' && (
            <>
              <div className={css.formGroup}>
                <label htmlFor="resourceType">Тип ресурса</label>
                <select
                  id="resourceType"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as ResourceType)}
                  required
                >
                  <option value={ResourceType.TEAM}>Команда</option>
                  <option value={ResourceType.COMPANY}>Компания</option>
                  <option value={ResourceType.PRODUCT}>Продукт</option>
                </select>
              </div>

              <div className={css.formGroup}>
                <label htmlFor="resourceId">ID ресурса</label>
                <input
                  id="resourceId"
                  type="text"
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  placeholder="Введи ID ресурса"
                  required
                />
              </div>

              <div className={css.formGroup}>
                <label>Дополнительные разрешения</label>
                <div className={css.actionsGrid}>
                  {Object.values(Action).map(action => (
                    <label key={action} className={css.actionCheckbox}>
                      <input
                        type="checkbox"
                        checked={additionalActions.includes(action)}
                        onChange={() => handleActionToggle(action)}
                      />
                      <span>{action}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className={css.formActions}>
            <button
              type="button"
              onClick={() => navigate('/roles')}
              className={css.cancelBtn}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={css.submitBtn}
            >
              {isLoading ? 'Назначаю...' : 'Назначить роль'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};