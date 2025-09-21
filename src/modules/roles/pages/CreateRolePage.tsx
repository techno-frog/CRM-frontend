import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRoleMutation, Action, ResourceType } from '../../../api/rolesApi';
import { RoleForm } from '../components/RoleForm';
import css from './CreateRolePage.module.css';
import { useNotify } from '../../../hooks/useNotify';
import { extractErrorMessage } from '../../../utils/extractErrorMessage';

export const CreateRolePage: React.FC = () => {
  const navigate = useNavigate();
  const [createRole, { isLoading, error }] = useCreateRoleMutation();
  const { success, error: notifyError } = useNotify();

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    defaultActions: Action[];
    resourceType?: ResourceType;
    isActive?: boolean;
  }) => {
    try {
      await createRole(data).unwrap();
      success({ title: 'Роль создана', text: 'Теперь её можно назначать' });
      navigate('/roles');
    } catch (err) {
      console.error('Ошибка создания роли:', err);
      notifyError({ title: 'Не удалось создать роль', text: extractErrorMessage(err, 'Проверь данные и попробуй снова') });
    }
  };

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h1>Создать новую роль</h1>
        <p>Настрой права доступа для новой роли, бро</p>
      </div>

      <div className={css.formWrapper}>
        <RoleForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          submitText="Создать роль"
        />
      </div>
    </div>
  );
};
