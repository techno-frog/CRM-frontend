import React from 'react';
import { Building2 } from 'lucide-react';
import css from '../../pages/CreateTeam/CreateTeam.module.css';

interface RegionSelectorProps {
  onRegionSelect: (region: 'usa' | 'europe') => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({ onRegionSelect }) => (
  <div className={css.formContainer}>
    <div className={css.formHeader}>
      <div className={css.formIcon}>
        <Building2 size={32} />
      </div>
      <h2>Регистрация компании</h2>
      <p>Выбери регион регистрации твоей компании</p>
    </div>

    <div className={css.regionGrid}>
      <div
        className={`${css.regionCard} ${css.usa}`}
        onClick={() => onRegionSelect('usa')}
      >
        <div className={css.regionFlag}>🇺🇸</div>
        <h3>США</h3>
        <p>Компания зарегистрирована в Соединенных Штатах</p>
      </div>

      <div
        className={`${css.regionCard} ${css.europe}`}
        onClick={() => onRegionSelect('europe')}
      >
        <div className={css.regionFlag}>🇪🇺</div>
        <h3>Европа</h3>
        <p>Компания зарегистрирована в Европейском Союзе</p>
      </div>
    </div>
  </div>
);