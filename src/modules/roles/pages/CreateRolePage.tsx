import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRoleMutation, Action, ResourceType } from '../../../api/rolesApi';
import { RoleForm } from '../components/RoleForm';
import css from './CreateRolePage.module.css';

export const CreateRolePage: React.FC = () => {
  const navigate = useNavigate();
  const [createRole, { isLoading, error }] = useCreateRoleMutation();

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    defaultActions: Action[];
    resourceType?: ResourceType;
    isActive?: boolean;
  }) => {
    try {
      await createRole(data).unwrap();
      navigate('/roles');
    } catch (err) {
      console.error('Ошибка создания роли:', err);
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