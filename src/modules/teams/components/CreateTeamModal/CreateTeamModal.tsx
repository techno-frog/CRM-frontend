import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { useCreateTeamMutation } from '../../../../api/teamsApi';
import Modal from '../../../../shared/components/Modal/Modal';
import css from './CreateTeamModal.module.css';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    title: '',
    role: '',
    description: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [createTeam, { isLoading }] = useCreateTeamMutation();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (formData.title.trim().length < 2) {
      errors.title = 'Название должно быть минимум 2 символа';
    } else if (formData.title.trim().length > 50) {
      errors.title = 'Название не должно превышать 50 символов';
    }

    if (!formData.role) {
      errors.role = 'Выберите вашу роль в команде';
    }

    if (formData.description.trim().length > 200) {
      errors.description = 'Описание не должно превышать 200 символов';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createTeam({
        title: formData.title.trim(),
        role: formData.role,
        description: formData.description.trim() || undefined
      }).unwrap();

      // Сбрасываем форму
      setFormData({ title: '', role: '', description: '' });
      setValidationErrors({});

      onClose();
    } catch (error) {
      console.error('Ошибка создания команды:', error);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', role: '', description: '' });
    setValidationErrors({});
    onClose();
  };

  const footer = (
    <div className={css.actions}>
      <button
        type="button"
        onClick={handleClose}
        className={css.secondaryBtn}
        disabled={isLoading}
      >
        Отмена
      </button>
      <button
        type="submit"
        form="create-team-form"
        disabled={isLoading}
        className={css.primaryBtn}
      >
        <Users size={20} />
        {isLoading ? 'Создаём...' : 'Создать команду'}
      </button>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      title={
        <div className={css.titleSection}>
          <div className={css.iconWrapper}>
            <Plus size={24} />
          </div>
          Создать команду
        </div>
      }
      onClose={handleClose}
      footer={footer}
    >
      <form id="create-team-form" onSubmit={handleSubmit} className={css.form}>
        <div className={css.inputGroup}>
          <label htmlFor="title" className={css.label}>
            Название команды *
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Моя крутая команда"
            required
            className={css.input}
          />
          {validationErrors.title && (
            <span className={css.error}>{validationErrors.title}</span>
          )}
        </div>

        <div className={css.inputGroup}>
          <label htmlFor="role" className={css.label}>
            Ваша роль в команде *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className={css.select}
          >
            <option value="">Выберите роль</option>
            <option value="founder">Основатель</option>
            <option value="ceo">CEO</option>
            <option value="cto">CTO</option>
            <option value="manager">Менеджер</option>
            <option value="developer">Разработчик</option>
            <option value="designer">Дизайнер</option>
            <option value="marketing">Маркетолог</option>
            <option value="sales">Продажи</option>
            <option value="support">Поддержка</option>
            <option value="other">Другое</option>
          </select>
          {validationErrors.role && (
            <span className={css.error}>{validationErrors.role}</span>
          )}
        </div>

        <div className={css.inputGroup}>
          <label htmlFor="description" className={css.label}>
            Описание команды
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Расскажите о вашей команде и её целях"
            rows={3}
            className={css.textarea}
          />
          {validationErrors.description && (
            <span className={css.error}>{validationErrors.description}</span>
          )}
          <span className={css.hint}>
            {formData.description.length}/200 символов
          </span>
        </div>
      </form>
    </Modal>
  );
};