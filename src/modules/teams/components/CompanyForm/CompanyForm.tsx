import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Building2, Mail, Trash2 } from 'lucide-react';
import type { RootState } from '../../../../store/store';
import {
  setCompanyName,
  setCompanyTeamName,
  setRegistrationNumber,
  setEmployeeCount,
  setCompanyUserRole,
  updateCompanyInvite,
  addCompanyInvite,
  removeCompanyInvite
} from '../../../../store/slices/createTeamSlice';
import css from '../../pages/CreateTeam/CreateTeam.module.css';

interface CompanyFormProps {
  companyRegion: 'usa' | 'europe';
  onBackToRegion: () => void;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  companyRegion,
  onBackToRegion
}) => {
  const dispatch = useDispatch();
  const {
    companyName,
    companyTeamName,
    registrationNumber,
    employeeCount,
    companyUserRole,
    companyInvites
  } = useSelector((state: RootState) => state.createTeam);

  const isFormValid =
    companyName.trim() &&
    companyTeamName.trim() &&
    registrationNumber.trim() &&
    employeeCount &&
    companyUserRole;

  return (
    <div className={css.formContainer}>
      <div className={css.formHeader}>
        <div className={css.formIcon}>
          <Building2 size={32} />
        </div>
        <h2>Данные компании</h2>
        <p>Заполни информацию о своей компании</p>
      </div>

      <div className={css.formContent}>
        <div className={css.formGrid}>
          <div className={css.inputGroup}>
            <label>Название компании</label>
            <input
              type="text"
              placeholder="ООО Рога и Копыта"
              value={companyName}
              onChange={(e) => dispatch(setCompanyName(e.target.value))}
              className={css.input}
              autoComplete="off"
            />
          </div>

          <div className={css.inputGroup}>
            <label>Название команды</label>
            <input
              type="text"
              placeholder="Разработка продуктов"
              value={companyTeamName}
              onChange={(e) => dispatch(setCompanyTeamName(e.target.value))}
              className={css.input}
              autoComplete="off"
            />
          </div>

          <div className={css.inputGroup}>
            <label>Регистрационный номер</label>
            <input
              type="text"
              placeholder={companyRegion === 'usa' ? '12-3456789' : 'EU123456789'}
              value={registrationNumber}
              onChange={(e) => dispatch(setRegistrationNumber(e.target.value))}
              className={css.input}
              autoComplete="off"
            />
          </div>

          <div className={css.inputGroup}>
            <label>Количество сотрудников</label>
            <select
              value={employeeCount}
              onChange={(e) => dispatch(setEmployeeCount(e.target.value))}
              className={css.select}
            >
              <option value="">Выбери размер</option>
              <option value="1-10">1-10 сотрудников</option>
              <option value="11-50">11-50 сотрудников</option>
              <option value="51-200">51-200 сотрудников</option>
              <option value="200+">200+ сотрудников</option>
            </select>
          </div>

          <div className={css.inputGroup}>
            <label>Твоя роль в компании</label>
            <select
              value={companyUserRole}
              onChange={(e) => dispatch(setCompanyUserRole(e.target.value))}
              className={css.select}
            >
              <option value="">Выбери роль</option>
              <option value="owner">Владелец</option>
              <option value="ceo">CEO</option>
              <option value="cfo">CFO</option>
              <option value="cto">CTO</option>
              <option value="director">Директор</option>
              <option value="manager">Менеджер</option>
            </select>
          </div>
        </div>

        {/* <div className={css.inviteSection}>
          <h3>Добавить сотрудников</h3>
          <div className={css.inviteList}>
            {companyInvites.map((invite) => (
              <div key={invite.id} className={css.inviteItem}>
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  className={css.inviteInput}
                  value={invite.email}
                  onChange={(e) => dispatch(updateCompanyInvite({ id: invite.id, email: e.target.value }))}
                  autoComplete="off"
                />
                {companyInvites.length > 1 && (
                  <button
                    className={css.removeBtn}
                    onClick={() => dispatch(removeCompanyInvite(invite.id))}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            className={css.addMoreBtn}
            onClick={() => dispatch(addCompanyInvite())}
            type="button"
          >
            + Добавить еще
          </button>


        </div> */}

        <div className={css.actionButtons}>
          <button
            className={css.secondaryBtn}
            onClick={onBackToRegion}
            type="button"
          >
            Назад к выбору региона
          </button>
          <button
            className={css.primaryBtn}
            disabled={!isFormValid}
            type="button"
          >
            <Building2 size={20} />
            Зарегистрировать
          </button>
        </div>
      </div>
    </div>
  );
};