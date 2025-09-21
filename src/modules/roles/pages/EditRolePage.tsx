import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetRoleByIdQuery, useUpdateRoleMutation, Action, ResourceType } from '../../../api/rolesApi';
import { RoleForm } from '../components/RoleForm';
import css from './CreateRolePage.module.css';
import { useNotify } from '../../../hooks/useNotify';
import { extractErrorMessage } from '../../../utils/extractErrorMessage';

export const EditRolePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: role, isLoading: isLoadingRole } = useGetRoleByIdQuery(id!);
  const [updateRole, { isLoading: isUpdating, error }] = useUpdateRoleMutation();
  const { success, error: notifyError } = useNotify();

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    defaultActions: Action[];
    resourceType?: ResourceType;
    isActive?: boolean;
  }) => {
    try {
      await updateRole({ id: id!, body: data }).unwrap();
      success({ title: 'Роль обновлена', text: 'Изменения уже в силе' });
      navigate('/roles');
    } catch (err) {
      console.error('Ошибка обновления роли:', err);
      notifyError({ title: 'Не удалось сохранить изменения', text: extractErrorMessage(err, 'Проверь данные и попробуй снова') });
    }
  };

  if (isLoadingRole) {
    return (
      <div className={css.container}>
        <div className={css.loading}>Загружаю роль, бро...</div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className={css.container}>
        <div className={css.error}>Роль не найдена, бро!</div>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h1>Редактировать роль</h1>
        <p>Измени настройки роли "{role.name}"</p>
      </div>

      <div className={css.formWrapper}>
        <RoleForm
          initialData={{
            name: role.name,
            description: role.description,
            defaultActions: role.defaultActions,
            resourceType: role.resourceType,
            isActive: role.isActive,
          }}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
          error={error}
          submitText="Сохранить изменения"
        />
      </div>
    </div>
  );
};
